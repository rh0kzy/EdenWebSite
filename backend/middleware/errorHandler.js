const logger = require('../config/logger');
const ErrorNotificationSystem = require('../config/errorNotificationSystem');

// Initialize error notification system
const errorNotificationSystem = new ErrorNotificationSystem();

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error with context
    const errorContext = {
        url: req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
        timestamp: new Date().toISOString()
    };

    logger.logError(err, errorContext);

    // Report error to notification system
    errorNotificationSystem.reportError(err, {
        ...errorContext,
        statusCode: err.statusCode || 500
    }).catch(notificationError => {
        logger.error('Failed to send error notification', {
            originalError: err.message,
            notificationError: notificationError.message,
            timestamp: new Date().toISOString()
        });
    });

    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        error.details = Object.values(err.errors).map(val => val.message);
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Supabase specific errors
    if (err.code === 'PGRST116') {
        statusCode = 404;
        message = 'Resource not found';
    }

    if (err.code === 'PGRST301') {
        statusCode = 400;
        message = 'Invalid request format';
    }

    // Rate limiting errors
    if (err.status === 429) {
        statusCode = 429;
        message = 'Too many requests';
    }

    // Security events logging
    if (statusCode === 401 || statusCode === 403) {
        logger.logSecurityEvent('Authentication/Authorization Failed', {
            ip: req.ip,
            url: req.url,
            method: req.method,
            userAgent: req.get('User-Agent')
        });
    }

    // Don't leak error details in production
    const response = {
        success: false,
        error: {
            message,
            statusCode
        },
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        response.error.details = error.details;
    }

    res.status(statusCode).json(response);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const message = `Route ${req.originalUrl} not found`;
    
    logger.warn('404 Route Not Found', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    res.status(404).json({
        success: false,
        error: {
            message,
            statusCode: 404
        },
        timestamp: new Date().toISOString()
    });
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Add request ID for tracking
    req.id = Math.random().toString(36).substr(2, 9);

    // Log request start
    logger.info('Request Started', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(body) {
        const responseTime = Date.now() - startTime;
        
        logger.logRequest(req, res, responseTime);
        
        // Log response details
        logger.info('Request Completed', {
            requestId: req.id,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString()
        });

        return originalJson.call(this, body);
    };

    next();
};

// Health check with error monitoring
const healthCheck = (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
        },
        cpu: process.cpuUsage()
    };

    logger.info('Health Check', {
        requestId: req.id,
        healthData,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({
        success: true,
        data: healthData
    });
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            logger.warn('Slow Request Detected', {
                url: req.url,
                method: req.method,
                duration: `${duration.toFixed(2)}ms`,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
            });
        }

        // Log performance metrics
        logger.debug('Performance Metrics', {
            url: req.url,
            method: req.method,
            duration: `${duration.toFixed(2)}ms`,
            statusCode: res.statusCode,
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        });
    });

    next();
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    requestLogger,
    healthCheck,
    performanceMonitor
};