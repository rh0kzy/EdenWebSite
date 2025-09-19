/**
 * Frontend Error Monitoring and Logging System
 * Provides comprehensive error tracking, user-friendly error handling,
 * and fallback functionality for the Eden Parfum website
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors
        this.apiEndpoint = '/api/v2/errors'; // Backend endpoint for error reporting
        this.enabled = true;
        this.userId = this.generateUserId();
        this.sessionId = this.generateSessionId();
        
        this.initializeErrorHandling();
        this.setupPerformanceMonitoring();
    }

    /**
     * Initialize global error handlers
     */
    initializeErrorHandling() {
        // Global error handler for uncaught errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : 'No stack trace available',
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Global handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise_rejection',
                message: event.reason ? event.reason.toString() : 'Unhandled promise rejection',
                stack: event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available',
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Network error monitoring
        this.monitorNetworkErrors();
    }

    /**
     * Monitor network errors and API failures
     */
    monitorNetworkErrors() {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            try {
                const response = await originalFetch.apply(this, args);
                const endTime = performance.now();
                const duration = endTime - startTime;

                // Log slow requests
                if (duration > 2000) {
                    this.logError({
                        type: 'slow_request',
                        message: `Slow API request detected: ${duration.toFixed(2)}ms`,
                        url: args[0],
                        duration: duration,
                        timestamp: new Date().toISOString()
                    });
                }

                // Log failed requests
                if (!response.ok) {
                    this.logError({
                        type: 'api_error',
                        message: `API request failed: ${response.status} ${response.statusText}`,
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: new Date().toISOString()
                    });
                }

                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                this.logError({
                    type: 'network_error',
                    message: `Network request failed: ${error.message}`,
                    url: args[0],
                    error: error.toString(),
                    duration: duration,
                    timestamp: new Date().toISOString()
                });

                throw error;
            }
        };
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                    
                    // Log slow page loads
                    if (loadTime > 3000) {
                        this.logError({
                            type: 'slow_page_load',
                            message: `Slow page load detected: ${loadTime.toFixed(2)}ms`,
                            loadTime: loadTime,
                            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            }, 1000);
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedPercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                
                if (usedPercentage > 80) {
                    this.logError({
                        type: 'high_memory_usage',
                        message: `High memory usage detected: ${usedPercentage.toFixed(2)}%`,
                        usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                        totalMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                        timestamp: new Date().toISOString()
                    });
                }
            }, 30000); // Check every 30 seconds
        }
    }

    /**
     * Log an error with context information
     */
    logError(errorData) {
        if (!this.enabled) return;

        const enrichedError = {
            ...errorData,
            userId: this.userId,
            sessionId: this.sessionId,
            page: window.location.pathname,
            referrer: document.referrer,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: this.getConnectionInfo(),
            browserInfo: this.getBrowserInfo(),
            timestamp: errorData.timestamp || new Date().toISOString()
        };

        // Add to local error store
        this.errors.push(enrichedError);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // Remove oldest error
        }

        // Log to console in development
        if (this.isDevelopment()) {
            console.error('Error logged:', enrichedError);
        }

        // Send to backend (with rate limiting)
        this.sendErrorToBackend(enrichedError);
    }

    /**
     * Send error to backend with rate limiting
     */
    async sendErrorToBackend(errorData) {
        try {
            // Simple rate limiting: max 10 errors per minute
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            const recentErrors = this.errors.filter(e => 
                new Date(e.timestamp).getTime() > oneMinuteAgo
            );

            if (recentErrors.length > 10) {
                return; // Rate limited
            }

            // Send error to backend (if endpoint exists)
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorData)
            });

            if (!response.ok) {
                console.warn('Failed to send error to backend:', response.status);
            }
        } catch (error) {
            // Silently fail - don't create recursive error logging
            console.warn('Error reporting failed:', error.message);
        }
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return { effectiveType: 'unknown' };
    }

    /**
     * Get browser information
     */
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Generate unique user ID
     */
    generateUserId() {
        let userId = localStorage.getItem('eden_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('eden_user_id', userId);
        }
        return userId;
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * Check if in development mode
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname === '';
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recentErrors: 0
        };

        const oneHourAgo = Date.now() - 3600000;
        
        this.errors.forEach(error => {
            // Count by type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // Count recent errors
            if (new Date(error.timestamp).getTime() > oneHourAgo) {
                stats.recentErrors++;
            }
        });

        return stats;
    }

    /**
     * Clear error log
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Export errors for debugging
     */
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }

    /**
     * Disable error monitoring
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Enable error monitoring
     */
    enable() {
        this.enabled = true;
    }
}

/**
 * User-friendly error display system
 */
class UserErrorHandler {
    constructor(errorMonitor) {
        this.errorMonitor = errorMonitor;
        this.notificationContainer = null;
        this.createNotificationContainer();
    }

    /**
     * Create notification container for user-friendly error messages
     */
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'error-notifications';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    /**
     * Show user-friendly error notification
     */
    showError(message, type = 'error', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `error-notification error-${type}`;
        notification.style.cssText = `
            background: ${type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; padding: 0; margin-left: 10px;">×</button>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        // Add CSS animation keyframes if not already added
        if (!document.querySelector('#error-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'error-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Handle API errors with user-friendly messages
     */
    handleApiError(error, context = '') {
        let userMessage = 'Something went wrong. Please try again.';
        
        if (error.message) {
            if (error.message.includes('fetch')) {
                userMessage = 'Unable to connect to the server. Please check your internet connection.';
            } else if (error.message.includes('timeout')) {
                userMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('404')) {
                userMessage = 'The requested information was not found.';
            } else if (error.message.includes('500')) {
                userMessage = 'Server error. Our team has been notified.';
            }
        }

        if (context) {
            userMessage = `${context}: ${userMessage}`;
        }

        this.showError(userMessage);
        
        // Log the actual error for developers
        this.errorMonitor.logError({
            type: 'user_facing_error',
            message: error.message,
            stack: error.stack,
            context: context,
            userMessage: userMessage,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Handle form validation errors
     */
    handleValidationError(field, message) {
        this.showError(`${field}: ${message}`, 'warning');
    }

    /**
     * Show success messages
     */
    showSuccess(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 18px; padding: 0; margin-left: 10px;">×</button>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }
}

// Initialize global error monitoring
const errorMonitor = new ErrorMonitor();
const userErrorHandler = new UserErrorHandler(errorMonitor);

// Export for global use
window.ErrorMonitor = errorMonitor;
window.UserErrorHandler = userErrorHandler;

// Helper functions for easy error handling
window.logError = (error, context) => errorMonitor.logError({
    type: 'manual_error',
    message: error.message || error,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
});

window.showUserError = (message, context) => userErrorHandler.handleApiError(
    { message }, context
);

window.showUserSuccess = (message) => userErrorHandler.showSuccess(message);

// Remove export statements for browser compatibility
// Export the classes for environments that support modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorMonitor, UserErrorHandler };
}