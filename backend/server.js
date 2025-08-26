const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database connection and initialization
const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const perfumeRoutes = require('./routes/perfumes');
const brandRoutes = require('./routes/brands');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files - serve frontend assets
app.use('/photos', express.static(path.join(__dirname, '../frontend/photos')));
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/perfumes', perfumeRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Eden Parfum API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔗 Testing database connection...');
        await testConnection();
        
        // Note: Skipping database re-initialization since it's already done
        console.log('� Database is ready!');
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🌸 Eden Parfum Backend Server running on port ${PORT}`);
            console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
            console.log(`📱 Frontend URL: http://localhost:${PORT}`);
            console.log(`💾 Database: Connected to MySQL`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
