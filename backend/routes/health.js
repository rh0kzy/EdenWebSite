const express = require('express');
const router = express.Router();
const HealthMonitor = require('../config/healthMonitor');
const logger = require('../config/logger');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize health monitor
const healthMonitor = new HealthMonitor();

// Start monitoring when the module loads
healthMonitor.startMonitoring();

/**
 * Basic health check endpoint
 * GET /api/health
 */
router.get('/', asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
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
            responseTime: Date.now() - startTime
        };

        logger.info('Health Check', {
            requestId: req.id,
            responseTime: healthData.responseTime,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            data: healthData
        });
    } catch (error) {
        logger.error('Health Check Failed', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        res.status(503).json({
            success: false,
            error: {
                message: 'Health check failed',
                statusCode: 503
            },
            timestamp: new Date().toISOString()
        });
    }
}));

/**
 * Detailed system status endpoint
 * GET /api/health/status
 */
router.get('/status', asyncHandler(async (req, res) => {
    const healthReport = await healthMonitor.getCurrentHealth();
    const systemStats = healthMonitor.getSystemStats();
    const trends = healthMonitor.getHealthTrends();

    const statusData = {
        application: {
            name: 'Eden Parfum API',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
            timestamp: new Date().toISOString()
        },
        health: healthReport,
        system: systemStats,
        trends: trends,
        monitoring: {
            enabled: healthMonitor.isMonitoring,
            interval: healthMonitor.config.interval,
            lastCheck: healthMonitor.lastCheckTime,
            checksCount: healthMonitor.checks.size
        }
    };

    const statusCode = healthReport.overall === 'healthy' ? 200 : 
                      healthReport.overall === 'warning' ? 200 : 503;

    logger.info('Detailed Status Check', {
        requestId: req.id,
        overallHealth: healthReport.overall,
        systemHealth: trends.averageHealth,
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        success: healthReport.overall !== 'critical',
        data: statusData
    });
}));

/**
 * Health metrics endpoint for monitoring tools
 * GET /api/health/metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
    const healthReport = await healthMonitor.getCurrentHealth();
    const systemStats = healthMonitor.getSystemStats();
    
    // Format metrics in a monitoring-friendly format
    const metrics = {
        // System metrics
        'system_memory_used_mb': systemStats.memory.used,
        'system_memory_total_mb': systemStats.memory.total,
        'system_memory_usage_percent': (systemStats.memory.used / systemStats.memory.total) * 100,
        'system_uptime_seconds': systemStats.uptime,
        'system_cpu_user_microseconds': systemStats.cpu.user,
        'system_cpu_system_microseconds': systemStats.cpu.system,
        
        // Health metrics
        'health_overall_status': healthReport.overall === 'healthy' ? 1 : 0,
        'health_checks_total': Object.keys(healthReport.checks || {}).length,
        'health_checks_passing': Object.values(healthReport.checks || {}).filter(c => c.status === 'healthy').length,
        'health_checks_warning': Object.values(healthReport.checks || {}).filter(c => c.status === 'warning').length,
        'health_checks_critical': Object.values(healthReport.checks || {}).filter(c => c.status === 'critical').length,
        'health_execution_time_ms': healthReport.executionTime || 0,
        
        // Application metrics
        'app_version': process.env.npm_package_version || '1.0.0',
        'app_environment': process.env.NODE_ENV === 'production' ? 1 : 0,
        
        // Timestamp
        'last_updated': Date.now()
    };

    logger.debug('Health Metrics Retrieved', {
        metricsCount: Object.keys(metrics).length,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({
        success: true,
        data: {
            metrics,
            timestamp: new Date().toISOString(),
            format: 'key_value_pairs'
        }
    });
}));

/**
 * Health history endpoint
 * GET /api/health/history
 */
router.get('/history', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const history = healthMonitor.getHealthHistory(Math.min(limit, 100)); // Max 100 records

    logger.debug('Health History Retrieved', {
        recordsCount: history.length,
        limit: limit,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({
        success: true,
        data: {
            history,
            count: history.length,
            timestamp: new Date().toISOString()
        }
    });
}));

/**
 * Health trends endpoint
 * GET /api/health/trends
 */
router.get('/trends', asyncHandler(async (req, res) => {
    const trends = healthMonitor.getHealthTrends();

    logger.debug('Health Trends Retrieved', {
        trend: trends.trend,
        averageHealth: trends.averageHealth,
        timestamp: new Date().toISOString()
    });

    res.status(200).json({
        success: true,
        data: trends
    });
}));

/**
 * Force health check endpoint (for debugging)
 * POST /api/health/check
 */
router.post('/check', asyncHandler(async (req, res) => {
    logger.info('Manual Health Check Triggered', {
        requestId: req.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    const healthReport = await healthMonitor.runAllChecks();

    res.status(200).json({
        success: true,
        data: healthReport,
        message: 'Health check completed successfully'
    });
}));

/**
 * Readiness probe endpoint (for container orchestration)
 * GET /api/health/ready
 */
router.get('/ready', asyncHandler(async (req, res) => {
    const healthReport = await healthMonitor.getCurrentHealth();
    
    // Consider the service ready if overall health is not critical
    const isReady = healthReport.overall !== 'critical';

    const response = {
        ready: isReady,
        status: healthReport.overall,
        timestamp: new Date().toISOString()
    };

    res.status(isReady ? 200 : 503).json({
        success: isReady,
        data: response
    });
}));

/**
 * Liveness probe endpoint (for container orchestration)
 * GET /api/health/live
 */
router.get('/live', asyncHandler(async (req, res) => {
    // Simple liveness check - if we can respond, we're alive
    res.status(200).json({
        success: true,
        data: {
            alive: true,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }
    });
}));

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, stopping health monitoring');
    healthMonitor.stopMonitoring();
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, stopping health monitoring');
    healthMonitor.stopMonitoring();
});

module.exports = router;