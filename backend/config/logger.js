const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels and colors
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

winston.addColors(logColors);

// Custom format for structured logging
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (stack) {
            log += `\n${stack}`;
        }
        if (Object.keys(metadata).length > 0) {
            log += `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return log;
    })
);

// Create transports array
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            level: 'debug',
            format: consoleFormat
        })
    );
}

// File transport for all logs
transports.push(
    new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_RETENTION_DAYS || '14d',
        level: 'info',
        format: logFormat
    })
);

// Error log file
transports.push(
    new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_RETENTION_DAYS || '30d',
        level: 'error',
        format: logFormat
    })
);

// HTTP access log file
transports.push(
    new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, 'access-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: '7d', // Keep access logs for 7 days only
        level: 'http',
        format: logFormat
    })
);

// Create the logger with environment-based configuration
const logger = winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: logFormat,
    defaultMeta: { 
        service: 'eden-parfum-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        instance: process.env.INSTANCE_ID || 'default'
    },
    transports,
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'exceptions.log'),
            maxsize: parseInt(process.env.LOG_MAX_SIZE_BYTES) || 5242880, // 5MB default
            maxFiles: 5
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'rejections.log'),
            maxsize: parseInt(process.env.LOG_MAX_SIZE_BYTES) || 5242880, // 5MB default
            maxFiles: 5
        })
    ],
    exitOnError: false // Don't exit on uncaught exceptions in production
});

// Helper methods for structured logging
logger.logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
        logger.warn('HTTP Request Error', logData);
    } else {
        logger.http('HTTP Request', logData);
    }
};

logger.logError = (error, context = {}) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        timestamp: new Date().toISOString(),
        ...context
    };

    logger.error('Application Error', errorData);
};

logger.logApiCall = (endpoint, method, params, responseTime, statusCode) => {
    const apiData = {
        endpoint,
        method,
        params: JSON.stringify(params),
        responseTime: `${responseTime}ms`,
        statusCode,
        timestamp: new Date().toISOString()
    };

    if (statusCode >= 400) {
        logger.warn('API Call Error', apiData);
    } else {
        logger.info('API Call Success', apiData);
    }
};

logger.logDatabaseOperation = (operation, table, duration, success, error = null) => {
    const dbData = {
        operation,
        table,
        duration: `${duration}ms`,
        success,
        timestamp: new Date().toISOString()
    };

    if (error) {
        dbData.error = error.message;
        logger.error('Database Operation Failed', dbData);
    } else {
        logger.debug('Database Operation', dbData);
    }
};

logger.logSecurityEvent = (event, details) => {
    const securityData = {
        event,
        details,
        timestamp: new Date().toISOString(),
        severity: 'high'
    };

    logger.warn('Security Event', securityData);
};

// Graceful shutdown handler
const gracefulShutdown = () => {
    logger.info('Logger shutdown initiated');
    
    // Close all transports gracefully
    logger.transports.forEach(transport => {
        if (transport.close) {
            transport.close();
        }
    });
    
    // Explicitly end the logger
    if (logger.end) {
        logger.end();
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown();
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
    process.exit(1);
});

module.exports = logger;