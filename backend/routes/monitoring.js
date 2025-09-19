const express = require('express');
const router = express.Router();
const ErrorNotificationSystem = require('../config/errorNotificationSystem');
const EnvironmentValidator = require('../config/environmentValidator');
const logger = require('../config/logger');
const { asyncHandler } = require('../middleware/errorHandler');

// Get reference to the error notification system (it's initialized in errorHandler middleware)
let errorNotificationSystem = null;
let environmentValidator = null;

// Initialize when first accessed
const getErrorNotificationSystem = () => {
    if (!errorNotificationSystem) {
        errorNotificationSystem = new ErrorNotificationSystem();
    }
    return errorNotificationSystem;
};

const getEnvironmentValidator = () => {
    if (!environmentValidator) {
        environmentValidator = new EnvironmentValidator();
    }
    return environmentValidator;
};

/**
 * Error monitoring dashboard endpoint
 * GET /api/monitoring/dashboard
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const timeRange = parseInt(req.query.timeRange) || 3600000; // Default 1 hour
    const errorStats = notificationSystem.getErrorStats(timeRange);
    const notificationStats = notificationSystem.getNotificationStats(timeRange);

    const dashboardData = {
        overview: {
            totalErrors: errorStats.total,
            errorRate: (errorStats.total / (timeRange / 60000)).toFixed(2), // errors per minute
            notificationsSent: notificationStats.total,
            notificationSuccess: notificationStats.successful,
            notificationFailures: notificationStats.failed,
            timeRange: {
                minutes: timeRange / 60000,
                label: timeRange === 3600000 ? 'Last Hour' : 
                       timeRange === 86400000 ? 'Last 24 Hours' :
                       timeRange === 604800000 ? 'Last 7 Days' : 
                       `Last ${timeRange / 60000} minutes`
            }
        },
        errorBreakdown: {
            bySeverity: errorStats.bySeverity,
            byType: errorStats.byType,
            topErrors: Object.entries(errorStats.byFingerprint)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([fingerprint, count]) => ({ fingerprint, count }))
        },
        notifications: {
            total: notificationStats.total,
            successful: notificationStats.successful,
            failed: notificationStats.failed,
            successRate: notificationStats.total > 0 ? 
                ((notificationStats.successful / (notificationStats.successful + notificationStats.failed)) * 100).toFixed(1) : 
                '100',
            bySeverity: notificationStats.bySeverity
        },
        timestamp: new Date().toISOString()
    };

    res.status(200).json({
        success: true,
        data: dashboardData
    });
}));

/**
 * Error history endpoint
 * GET /api/monitoring/errors
 */
router.get('/errors', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const severity = req.query.severity;
    const type = req.query.type;
    const timeRange = parseInt(req.query.timeRange) || 3600000;

    const cutoff = Date.now() - timeRange;
    let errors = notificationSystem.errorHistory.filter(
        error => new Date(error.timestamp).getTime() > cutoff
    );

    // Apply filters
    if (severity) {
        errors = errors.filter(error => error.severity === severity);
    }
    if (type) {
        errors = errors.filter(error => error.type === type);
    }

    // Sort by timestamp (newest first) and limit
    errors = errors
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

    res.status(200).json({
        success: true,
        data: {
            errors,
            count: errors.length,
            filters: { severity, type, timeRange, limit },
            timestamp: new Date().toISOString()
        }
    });
}));

/**
 * Error statistics endpoint
 * GET /api/monitoring/stats
 */
router.get('/stats', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const timeRanges = [
        { label: 'Last Hour', value: 3600000 },
        { label: 'Last 6 Hours', value: 21600000 },
        { label: 'Last 24 Hours', value: 86400000 },
        { label: 'Last 7 Days', value: 604800000 }
    ];

    const stats = {};
    timeRanges.forEach(range => {
        const errorStats = notificationSystem.getErrorStats(range.value);
        const notificationStats = notificationSystem.getNotificationStats(range.value);
        
        stats[range.label.toLowerCase().replace(/\s+/g, '_')] = {
            errors: errorStats,
            notifications: notificationStats,
            errorRate: (errorStats.total / (range.value / 60000)).toFixed(4) // errors per minute
        };
    });

    res.status(200).json({
        success: true,
        data: {
            statistics: stats,
            timestamp: new Date().toISOString()
        }
    });
}));

/**
 * Test notification endpoint
 * POST /api/monitoring/test-notification
 */
router.post('/test-notification', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const testError = {
        type: 'test_error',
        message: 'This is a test error notification from Eden Parfum API monitoring system',
        name: 'TestError',
        stack: 'TestError: This is a test error\n    at /api/monitoring/test-notification'
    };

    const testContext = {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: 500,
        source: 'manual_test'
    };

    try {
        const errorId = await notificationSystem.reportError(testError, testContext);
        
        logger.info('Test notification sent', {
            errorId,
            requestId: req.id,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            data: {
                message: 'Test notification sent successfully',
                errorId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Failed to send test notification', {
            error: error.message,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to send test notification',
                details: error.message
            }
        });
    }
}));

/**
 * Notification configuration endpoint
 * GET /api/monitoring/config
 */
router.get('/config', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const config = {
        email: {
            enabled: notificationSystem.config.enableEmail,
            configured: !!(notificationSystem.config.emailHost && notificationSystem.config.emailTo)
        },
        webhooks: {
            enabled: notificationSystem.config.enableWebhooks,
            slack: !!notificationSystem.config.slackWebhook,
            discord: !!notificationSystem.config.discordWebhook,
            custom: !!notificationSystem.config.customWebhook
        },
        limits: {
            maxNotificationsPerHour: notificationSystem.config.maxNotificationsPerHour,
            cooldownPeriod: notificationSystem.config.cooldownPeriod / 1000, // in seconds
            criticalErrorThreshold: notificationSystem.config.criticalErrorThreshold
        },
        thresholds: {
            errorRate: notificationSystem.config.errorRateThreshold,
            responseTime: notificationSystem.config.responseTimeThreshold
        }
    };

    res.status(200).json({
        success: true,
        data: config
    });
}));

/**
 * Health status of monitoring system
 * GET /api/monitoring/health
 */
router.get('/health', asyncHandler(async (req, res) => {
    const notificationSystem = getErrorNotificationSystem();
    
    const recentErrors = notificationSystem.getErrorStats(300000); // Last 5 minutes
    const recentNotifications = notificationSystem.getNotificationStats(300000);
    
    const health = {
        status: 'healthy',
        monitoring: {
            active: true,
            errorCount: recentErrors.total,
            notificationCount: recentNotifications.total,
            lastErrorTime: notificationSystem.errorHistory.length > 0 ? 
                notificationSystem.errorHistory[notificationSystem.errorHistory.length - 1].timestamp : null
        },
        configuration: {
            email: notificationSystem.config.enableEmail,
            webhooks: notificationSystem.config.enableWebhooks
        },
        timestamp: new Date().toISOString()
    };

    // Determine health status based on recent activity
    if (recentErrors.total > 10) {
        health.status = 'warning';
        health.message = 'High error rate detected';
    }

    if (recentNotifications.failed > recentNotifications.successful && recentNotifications.total > 0) {
        health.status = 'critical';
        health.message = 'Notification system failures detected';
    }

    res.status(health.status === 'critical' ? 503 : 200).json({
        success: health.status !== 'critical',
        data: health
    });
}));

/**
 * Environment validation endpoint
 * GET /api/monitoring/environment
 */
router.get('/environment', asyncHandler(async (req, res) => {
    const validator = getEnvironmentValidator();
    const validationResults = validator.validate();
    const environmentSummary = validator.getEnvironmentSummary();

    // Calculate security score based on configuration
    let securityScore = 0;
    const maxScore = 100;

    // Database security (30 points)
    if (environmentSummary.databaseConfigured) securityScore += 30;

    // Logging configuration (20 points)
    if (environmentSummary.loggingConfigured) securityScore += 20;

    // Monitoring configuration (20 points)
    if (environmentSummary.monitoringConfigured) securityScore += 20;

    // Error notifications (15 points)
    if (environmentSummary.notificationsConfigured) securityScore += 15;

    // Environment validation (15 points)
    if (validationResults.valid) securityScore += 15;

    const response = {
        success: true,
        data: {
            validation: {
                passed: validationResults.valid,
                errors: validationResults.errors?.length || 0,
                warnings: validationResults.warnings?.length || 0,
                missing: validationResults.missing?.length || 0,
                invalid: validationResults.invalid?.length || 0
            },
            summary: environmentSummary,
            security: {
                score: securityScore,
                maxScore,
                percentage: Math.round((securityScore / maxScore) * 100),
                level: securityScore >= 80 ? 'high' : securityScore >= 60 ? 'medium' : 'low'
            },
            recommendations: []
        }
    };

    // Add recommendations based on configuration gaps
    if (!environmentSummary.databaseConfigured) {
        response.data.recommendations.push({
            priority: 'critical',
            message: 'Database configuration is incomplete - check SUPABASE_URL and SUPABASE_ANON_KEY'
        });
    }

    if (!environmentSummary.loggingConfigured) {
        response.data.recommendations.push({
            priority: 'medium',
            message: 'Configure LOG_LEVEL for better debugging and monitoring'
        });
    }

    if (!environmentSummary.notificationsConfigured) {
        response.data.recommendations.push({
            priority: 'low',
            message: 'Enable error notifications (email or webhooks) for proactive monitoring'
        });
    }

    if (process.env.NODE_ENV === 'production' && !validationResults.valid) {
        response.data.recommendations.push({
            priority: 'critical',
            message: 'Fix environment validation errors before running in production'
        });
    }

    logger.info('Environment validation requested', {
        securityScore,
        validationPassed: validationResults.valid,
        errors: validationResults.errors?.length || 0,
        warnings: validationResults.warnings?.length || 0
    });

    res.json(response);
}));

/**
 * Environment validation details endpoint
 * GET /api/monitoring/environment/details
 */
router.get('/environment/details', asyncHandler(async (req, res) => {
    const validator = getEnvironmentValidator();
    const validationResults = validator.validate();

    // Remove sensitive information for security
    const sanitizedResults = {
        ...validationResults,
        errors: validationResults.errors?.map(error => ({
            key: error.key,
            message: error.message,
            category: error.rule?.category,
            required: error.rule?.required
        })),
        warnings: validationResults.warnings?.map(warning => ({
            key: warning.key,
            message: warning.message
        })),
        missing: validationResults.missing?.map(missing => ({
            key: missing.key,
            message: missing.message,
            category: missing.rule?.category,
            description: missing.rule?.description,
            hasDefault: missing.rule?.defaultValue !== undefined
        })),
        invalid: validationResults.invalid?.map(invalid => ({
            key: invalid.key,
            message: invalid.message,
            category: invalid.rule?.category,
            description: invalid.rule?.description
        }))
    };

    logger.info('Detailed environment validation requested', {
        validationPassed: validationResults.valid,
        issuesCount: (validationResults.errors?.length || 0) + 
                     (validationResults.warnings?.length || 0) + 
                     (validationResults.missing?.length || 0) + 
                     (validationResults.invalid?.length || 0)
    });

    res.json({
        success: true,
        data: sanitizedResults
    });
}));

/**
 * Generate .env.example file
 * GET /api/monitoring/environment/example
 */
router.get('/environment/example', asyncHandler(async (req, res) => {
    const validator = getEnvironmentValidator();
    const envExample = validator.generateEnvExample();

    res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename=".env.example"'
    });

    logger.info('Environment example file generated');

    res.send(envExample);
}));

module.exports = router;