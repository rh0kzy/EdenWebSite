const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Environment Validation - MUST be done before other imports
const EnvironmentValidator = require('./config/environmentValidator');
const envValidator = new EnvironmentValidator();

// Validate environment variables before starting server
// Validating environment configuration
const validationResults = envValidator.validate();

if (!validationResults.valid) {
    console.error('\n❌ Environment validation failed! Server cannot start with invalid configuration.');
    console.error('📝 Please check your .env file and fix the issues above.\n');
    
    // In production, we should exit immediately
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 Production environment detected - exiting immediately for security.');
        process.exit(1);
    } else {
        console.warn('⚠️  Development environment detected - continuing with warnings.');
        console.warn('   Please fix these issues before deploying to production.\n');
    }
} else {
    // Environment validation passed - starting server
}

// Import logger and error handling middleware
const logger = require('./config/logger');
const { 
    errorHandler, 
    notFoundHandler, 
    asyncHandler, 
    requestLogger, 
    healthCheck, 
    performanceMonitor 
} = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Log application startup with environment summary
const envSummary = envValidator.getEnvironmentSummary();
logger.info('Eden Parfum Backend Starting', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    environmentValidation: {
        passed: validationResults.valid,
        databaseConfigured: envSummary.databaseConfigured,
        loggingConfigured: envSummary.loggingConfigured,
        monitoringConfigured: envSummary.monitoringConfigured,
        notificationsConfigured: envSummary.notificationsConfigured
    }
});

// Import Supabase routes
const supabasePerfumeRoutes = require('./routes/supabasePerfumes');
const supabaseBrandRoutes = require('./routes/supabaseBrands');
const photoRoutes = require('./routes/photos');
const healthRoutes = require('./routes/health');
const monitoringRoutes = require('./routes/monitoring');
const socialRoutes = require('./routes/social');

// Middleware
const isDevelopment = process.env.NODE_ENV !== 'production';
app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: [
                "'self'",
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:8080", 
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
                "http://127.0.0.1:8080",
                "https://edenparfum.netlify.app",
                process.env.FRONTEND_URL
            ].filter(Boolean),
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Performance monitoring
app.use(performanceMonitor);

// Request logging
app.use(requestLogger);

// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Define allowed origins
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
            process.env.FRONTEND_URL,
            // Add your Netlify domain (update with your actual domain)
            'https://edenparfum.netlify.app',
            'https://your-custom-domain.com'
        ].filter(Boolean); // Remove undefined values
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.logSecurityEvent('CORS Violation', {
                origin,
                ip: 'unknown',
                timestamp: new Date().toISOString()
            });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting with enhanced error logging
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
        logger.logSecurityEvent('Rate Limit Exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            success: false,
            error: {
                message: 'Too many requests from this IP, please try again later.',
                statusCode: 429
            },
            timestamp: new Date().toISOString()
        });
    }
});
app.use('/api/', limiter);

// Cache Busting Middleware
const CacheBustingMiddleware = require('./middleware/cacheBusting');
const cacheBustingMiddleware = new CacheBustingMiddleware({
    mode: 'timestamp', // Use timestamp for development, 'hash' for production
    baseDir: path.join(__dirname, '../frontend')
});

// Add cache busting helpers to all responses
app.use(cacheBustingMiddleware.middleware());

// Enhanced static file serving with cache busting
app.use('/photos', cacheBustingMiddleware.staticFileMiddleware(
    path.join(__dirname, '../frontend/photos'),
    { maxAge: '1y' } // Long cache for photos since they rarely change
));

app.use(cacheBustingMiddleware.staticFileMiddleware(
    path.join(__dirname, '../frontend'),
    { maxAge: '5m' } // Default cache for other static files
));

// HTML cache busting injection (for dynamically served HTML)
app.use(cacheBustingMiddleware.htmlCacheBustingMiddleware());

// API Routes
// Health monitoring routes (before rate limiting for external monitoring)
app.use('/api/health', healthRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Cache busting API endpoints
app.get('/api/cache-manifest', cacheBustingMiddleware.getManifestEndpoint());
app.get('/api/versioned-url', cacheBustingMiddleware.getVersionedUrlEndpoint());
app.post('/api/clear-cache', cacheBustingMiddleware.getClearCacheEndpoint());

// Apply rate limiting to other API routes
app.use('/api/', limiter);

// Supabase API v2 (current)
app.use('/api/v2/perfumes', supabasePerfumeRoutes);
app.use('/api/v2/brands', supabaseBrandRoutes);
app.use('/api/v2/photos', photoRoutes);

// Social Media Integration API
app.use('/api/social', socialRoutes);

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        logger.warn('API Route Not Found', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
        return res.status(404).json({ 
            success: false,
            error: {
                message: 'API endpoint not found',
                statusCode: 404
            },
            timestamp: new Date().toISOString()
        });
    }
    
    logger.debug('Serving Frontend', {
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize and start server with comprehensive error handling
function startServer() {
    try {
        // Start the server
        const server = app.listen(PORT, () => {
            // Log successful startup
            logger.info('Server Started Successfully', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                pid: process.pid,
                timestamp: new Date().toISOString()
            });
            
            // Server is running (production logs removed for security)
            logger.info(`Eden Parfum Backend Server running on port ${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            logger.error('Server Error', {
                error: error.message,
                stack: error.stack,
                port: PORT,
                timestamp: new Date().toISOString()
            });
            
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
                process.exit(1);
            }
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            console.log('Graceful Shutdown Initiated', {
                signal,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
            
            server.close(() => {
                console.log('Server Closed Successfully');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                console.error('Forced Shutdown - Server did not close gracefully');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        return server;
    } catch (error) {
        logger.error('Server Startup Failed', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
