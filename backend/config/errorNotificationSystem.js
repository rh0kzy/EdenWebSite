const logger = require('./logger');
const nodemailer = require('nodemailer');

/**
 * Error Notification and Alerting System for Eden Parfum API
 * Handles email notifications, webhook alerts, and error aggregation
 */
class ErrorNotificationSystem {
    constructor() {
        this.config = {
            // Email configuration
            enableEmail: process.env.ENABLE_ERROR_EMAIL === 'true',
            emailHost: process.env.SMTP_HOST,
            emailPort: parseInt(process.env.SMTP_PORT) || 587,
            emailUser: process.env.SMTP_USER,
            emailPass: process.env.SMTP_PASS,
            emailTo: process.env.ERROR_NOTIFICATION_EMAIL,
            emailFrom: process.env.SMTP_USER || 'noreply@edenparfum.com',

            // Webhook configuration
            enableWebhooks: process.env.ENABLE_ERROR_WEBHOOKS === 'true',
            slackWebhook: process.env.SLACK_WEBHOOK_URL,
            discordWebhook: process.env.DISCORD_WEBHOOK_URL,
            customWebhook: process.env.ERROR_WEBHOOK_URL,

            // Rate limiting
            maxNotificationsPerHour: parseInt(process.env.MAX_NOTIFICATIONS_PER_HOUR) || 10,
            cooldownPeriod: parseInt(process.env.NOTIFICATION_COOLDOWN) || 300000, // 5 minutes

            // Error thresholds
            criticalErrorThreshold: parseInt(process.env.CRITICAL_ERROR_THRESHOLD) || 5,
            errorRateThreshold: parseFloat(process.env.ERROR_RATE_THRESHOLD) || 0.1, // 10%
            responseTimeThreshold: parseInt(process.env.RESPONSE_TIME_THRESHOLD) || 5000 // 5 seconds
        };

        this.errorHistory = [];
        this.notificationHistory = [];
        this.lastNotificationTimes = new Map();
        this.emailTransporter = null;

        this.initializeEmailTransporter();
        this.startErrorAggregation();

        logger.info('Error Notification System initialized', {
            emailEnabled: this.config.enableEmail,
            webhooksEnabled: this.config.enableWebhooks,
            maxNotificationsPerHour: this.config.maxNotificationsPerHour,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Initialize email transporter
     */
    initializeEmailTransporter() {
        if (!this.config.enableEmail || !this.config.emailHost) {
            logger.info('Email notifications disabled - no SMTP configuration');
            return;
        }

        try {
            this.emailTransporter = nodemailer.createTransporter({
                host: this.config.emailHost,
                port: this.config.emailPort,
                secure: this.config.emailPort === 465, // true for 465, false for other ports
                auth: {
                    user: this.config.emailUser,
                    pass: this.config.emailPass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify transporter
            this.emailTransporter.verify((error, success) => {
                if (error) {
                    logger.error('Email transporter verification failed', {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    logger.info('Email transporter verified successfully');
                }
            });
        } catch (error) {
            logger.error('Failed to initialize email transporter', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Start error aggregation monitoring
     */
    startErrorAggregation() {
        // Monitor error patterns every minute
        setInterval(() => {
            this.analyzeErrorPatterns();
        }, 60000);

        // Cleanup old error history every hour
        setInterval(() => {
            this.cleanupErrorHistory();
        }, 3600000);
    }

    /**
     * Log and potentially notify about an error
     */
    async reportError(error, context = {}) {
        const errorData = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: error.type || 'application_error',
            message: error.message,
            stack: error.stack,
            severity: this.determineSeverity(error, context),
            context: {
                ...context,
                userAgent: context.userAgent,
                ip: context.ip,
                url: context.url,
                method: context.method
            },
            fingerprint: this.generateErrorFingerprint(error, context)
        };

        // Add to error history
        this.errorHistory.push(errorData);

        // Determine if notification should be sent
        const shouldNotify = this.shouldSendNotification(errorData);

        if (shouldNotify) {
            await this.sendNotifications(errorData);
        }

        // Log the error
        logger.error('Error reported to notification system', {
            errorId: errorData.id,
            severity: errorData.severity,
            shouldNotify,
            fingerprint: errorData.fingerprint,
            timestamp: errorData.timestamp
        });

        return errorData.id;
    }

    /**
     * Determine error severity
     */
    determineSeverity(error, context) {
        // Critical errors
        if (error.name === 'MongoError' || 
            error.name === 'PostgresError' ||
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('Database') ||
            context.statusCode >= 500) {
            return 'critical';
        }

        // High severity
        if (error.name === 'ValidationError' ||
            error.message.includes('Authentication') ||
            context.statusCode === 401 ||
            context.statusCode === 403) {
            return 'high';
        }

        // Medium severity
        if (context.statusCode >= 400) {
            return 'medium';
        }

        // Low severity
        return 'low';
    }

    /**
     * Generate error fingerprint for deduplication
     */
    generateErrorFingerprint(error, context) {
        const components = [
            error.name || 'UnknownError',
            error.message ? error.message.substring(0, 100) : '',
            context.url || '',
            context.method || ''
        ].filter(Boolean);

        return require('crypto')
            .createHash('md5')
            .update(components.join('|'))
            .digest('hex');
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return 'ERR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Determine if notification should be sent
     */
    shouldSendNotification(errorData) {
        const { severity, fingerprint, timestamp } = errorData;

        // Always notify for critical errors
        if (severity === 'critical') {
            return !this.isInCooldown(fingerprint);
        }

        // Check rate limiting
        if (!this.checkRateLimit()) {
            return false;
        }

        // Check if we've seen this error recently
        if (this.isInCooldown(fingerprint)) {
            return false;
        }

        // Check error count for this fingerprint
        const recentSimilarErrors = this.getRecentErrorsByFingerprint(fingerprint, 3600000); // 1 hour
        if (recentSimilarErrors.length >= this.config.criticalErrorThreshold) {
            return true;
        }

        // Notify for high severity errors
        if (severity === 'high') {
            return true;
        }

        return false;
    }

    /**
     * Check if error is in cooldown period
     */
    isInCooldown(fingerprint) {
        const lastNotification = this.lastNotificationTimes.get(fingerprint);
        if (!lastNotification) return false;

        return Date.now() - lastNotification < this.config.cooldownPeriod;
    }

    /**
     * Check notification rate limit
     */
    checkRateLimit() {
        const oneHourAgo = Date.now() - 3600000;
        const recentNotifications = this.notificationHistory.filter(
            n => n.timestamp > oneHourAgo
        );

        return recentNotifications.length < this.config.maxNotificationsPerHour;
    }

    /**
     * Get recent errors by fingerprint
     */
    getRecentErrorsByFingerprint(fingerprint, timeRange = 3600000) {
        const cutoff = Date.now() - timeRange;
        return this.errorHistory.filter(
            error => error.fingerprint === fingerprint && 
                    new Date(error.timestamp).getTime() > cutoff
        );
    }

    /**
     * Send notifications via all configured channels
     */
    async sendNotifications(errorData) {
        const notifications = [];

        // Send email notification
        if (this.config.enableEmail && this.emailTransporter) {
            notifications.push(this.sendEmailNotification(errorData));
        }

        // Send webhook notifications
        if (this.config.enableWebhooks) {
            if (this.config.slackWebhook) {
                notifications.push(this.sendSlackNotification(errorData));
            }
            if (this.config.discordWebhook) {
                notifications.push(this.sendDiscordNotification(errorData));
            }
            if (this.config.customWebhook) {
                notifications.push(this.sendWebhookNotification(errorData));
            }
        }

        // Wait for all notifications to complete
        const results = await Promise.allSettled(notifications);

        // Log notification results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        logger.info('Notifications sent', {
            errorId: errorData.id,
            successful,
            failed,
            total: results.length,
            timestamp: new Date().toISOString()
        });

        // Record notification
        this.recordNotification(errorData, successful, failed);

        // Update cooldown
        this.lastNotificationTimes.set(errorData.fingerprint, Date.now());
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(errorData) {
        if (!this.emailTransporter || !this.config.emailTo) {
            throw new Error('Email not configured');
        }

        const subject = `[${errorData.severity.toUpperCase()}] Eden Parfum API Error - ${errorData.message.substring(0, 50)}`;
        
        const html = `
            <h2>Eden Parfum API Error Report</h2>
            <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid ${this.getSeverityColor(errorData.severity)};">
                <h3>Error Details</h3>
                <p><strong>ID:</strong> ${errorData.id}</p>
                <p><strong>Time:</strong> ${errorData.timestamp}</p>
                <p><strong>Severity:</strong> ${errorData.severity}</p>
                <p><strong>Type:</strong> ${errorData.type}</p>
                <p><strong>Message:</strong> ${errorData.message}</p>
            </div>
            
            ${errorData.context.url ? `
            <div style="background: #e9ecef; padding: 15px; margin: 10px 0;">
                <h3>Request Context</h3>
                <p><strong>URL:</strong> ${errorData.context.url}</p>
                <p><strong>Method:</strong> ${errorData.context.method || 'N/A'}</p>
                <p><strong>IP:</strong> ${errorData.context.ip || 'N/A'}</p>
                <p><strong>User Agent:</strong> ${errorData.context.userAgent || 'N/A'}</p>
            </div>` : ''}
            
            ${errorData.stack ? `
            <div style="background: #f8f9fa; padding: 15px; margin: 10px 0;">
                <h3>Stack Trace</h3>
                <pre style="background: #ffffff; padding: 10px; border: 1px solid #dee2e6; overflow-x: auto; font-size: 12px;">${errorData.stack}</pre>
            </div>` : ''}
            
            <p style="margin-top: 20px; color: #6c757d; font-size: 12px;">
                This is an automated error notification from Eden Parfum API monitoring system.
            </p>
        `;

        await this.emailTransporter.sendMail({
            from: this.config.emailFrom,
            to: this.config.emailTo,
            subject,
            html
        });
    }

    /**
     * Send Slack notification
     */
    async sendSlackNotification(errorData) {
        const payload = {
            text: `🚨 Eden Parfum API Error - ${errorData.severity}`,
            attachments: [{
                color: this.getSeverityColor(errorData.severity),
                fields: [
                    { title: 'Error ID', value: errorData.id, short: true },
                    { title: 'Severity', value: errorData.severity, short: true },
                    { title: 'Type', value: errorData.type, short: true },
                    { title: 'Time', value: errorData.timestamp, short: true },
                    { title: 'Message', value: errorData.message, short: false }
                ]
            }]
        };

        await this.sendWebhook(this.config.slackWebhook, payload);
    }

    /**
     * Send Discord notification
     */
    async sendDiscordNotification(errorData) {
        const payload = {
            content: `🚨 **Eden Parfum API Error**`,
            embeds: [{
                title: `${errorData.severity.toUpperCase()} Error`,
                description: errorData.message,
                color: parseInt(this.getSeverityColor(errorData.severity).replace('#', ''), 16),
                fields: [
                    { name: 'Error ID', value: errorData.id, inline: true },
                    { name: 'Type', value: errorData.type, inline: true },
                    { name: 'Time', value: errorData.timestamp, inline: false }
                ],
                timestamp: errorData.timestamp
            }]
        };

        await this.sendWebhook(this.config.discordWebhook, payload);
    }

    /**
     * Send custom webhook notification
     */
    async sendWebhookNotification(errorData) {
        await this.sendWebhook(this.config.customWebhook, {
            service: 'Eden Parfum API',
            error: errorData,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send webhook request
     */
    async sendWebhook(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }
    }

    /**
     * Get color for severity level
     */
    getSeverityColor(severity) {
        const colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colors[severity] || '#6c757d';
    }

    /**
     * Record notification for rate limiting
     */
    recordNotification(errorData, successful, failed) {
        this.notificationHistory.push({
            errorId: errorData.id,
            timestamp: Date.now(),
            successful,
            failed,
            severity: errorData.severity,
            fingerprint: errorData.fingerprint
        });

        // Keep only last 1000 notifications
        if (this.notificationHistory.length > 1000) {
            this.notificationHistory = this.notificationHistory.slice(-1000);
        }
    }

    /**
     * Analyze error patterns for proactive alerting
     */
    analyzeErrorPatterns() {
        const oneHour = 3600000;
        const cutoff = Date.now() - oneHour;
        const recentErrors = this.errorHistory.filter(
            error => new Date(error.timestamp).getTime() > cutoff
        );

        if (recentErrors.length === 0) return;

        // Check error rate
        const errorRate = recentErrors.length / 60; // errors per minute
        if (errorRate > this.config.errorRateThreshold) {
            this.reportError({
                type: 'high_error_rate',
                message: `High error rate detected: ${errorRate.toFixed(2)} errors/minute`,
                name: 'HighErrorRateAlert'
            }, {
                severity: 'high',
                errorCount: recentErrors.length,
                timeWindow: '1 hour'
            });
        }

        // Check for error spikes
        this.checkErrorSpikes(recentErrors);

        // Check for new error types
        this.checkNewErrorTypes(recentErrors);
    }

    /**
     * Check for error spikes
     */
    checkErrorSpikes(recentErrors) {
        const fingerprintCounts = {};
        recentErrors.forEach(error => {
            fingerprintCounts[error.fingerprint] = (fingerprintCounts[error.fingerprint] || 0) + 1;
        });

        Object.entries(fingerprintCounts).forEach(([fingerprint, count]) => {
            if (count >= this.config.criticalErrorThreshold) {
                const sampleError = recentErrors.find(e => e.fingerprint === fingerprint);
                this.reportError({
                    type: 'error_spike',
                    message: `Error spike detected: ${count} occurrences of "${sampleError.message}"`,
                    name: 'ErrorSpikeAlert'
                }, {
                    severity: 'high',
                    originalError: sampleError.message,
                    count,
                    fingerprint
                });
            }
        });
    }

    /**
     * Check for new error types
     */
    checkNewErrorTypes(recentErrors) {
        const oneWeek = 7 * 24 * 3600000;
        const oneWeekAgo = Date.now() - oneWeek;
        
        const historicalFingerprints = new Set(
            this.errorHistory
                .filter(error => new Date(error.timestamp).getTime() < oneWeekAgo)
                .map(error => error.fingerprint)
        );

        const newFingerprints = recentErrors
            .filter(error => !historicalFingerprints.has(error.fingerprint))
            .map(error => error.fingerprint);

        if (newFingerprints.length > 0) {
            const uniqueNewFingerprints = [...new Set(newFingerprints)];
            uniqueNewFingerprints.forEach(fingerprint => {
                const sampleError = recentErrors.find(e => e.fingerprint === fingerprint);
                this.reportError({
                    type: 'new_error_type',
                    message: `New error type detected: "${sampleError.message}"`,
                    name: 'NewErrorTypeAlert'
                }, {
                    severity: 'medium',
                    originalError: sampleError.message,
                    fingerprint
                });
            });
        }
    }

    /**
     * Clean up old error history
     */
    cleanupErrorHistory() {
        const oneWeek = 7 * 24 * 3600000;
        const cutoff = Date.now() - oneWeek;
        
        const oldCount = this.errorHistory.length;
        this.errorHistory = this.errorHistory.filter(
            error => new Date(error.timestamp).getTime() > cutoff
        );
        
        const removedCount = oldCount - this.errorHistory.length;
        if (removedCount > 0) {
            logger.debug('Cleaned up old error history', {
                removedCount,
                remainingCount: this.errorHistory.length,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats(timeRange = 3600000) {
        const cutoff = Date.now() - timeRange;
        const recentErrors = this.errorHistory.filter(
            error => new Date(error.timestamp).getTime() > cutoff
        );

        const stats = {
            total: recentErrors.length,
            bySeverity: {},
            byType: {},
            byFingerprint: {},
            timeRange: timeRange / 1000 / 60 // in minutes
        };

        recentErrors.forEach(error => {
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            stats.byFingerprint[error.fingerprint] = (stats.byFingerprint[error.fingerprint] || 0) + 1;
        });

        return stats;
    }

    /**
     * Get notification statistics
     */
    getNotificationStats(timeRange = 3600000) {
        const cutoff = Date.now() - timeRange;
        const recentNotifications = this.notificationHistory.filter(
            n => n.timestamp > cutoff
        );

        return {
            total: recentNotifications.length,
            successful: recentNotifications.reduce((sum, n) => sum + n.successful, 0),
            failed: recentNotifications.reduce((sum, n) => sum + n.failed, 0),
            bySeverity: recentNotifications.reduce((acc, n) => {
                acc[n.severity] = (acc[n.severity] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

module.exports = ErrorNotificationSystem;