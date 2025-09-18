const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import Supabase routes
const supabasePerfumeRoutes = require('./routes/supabasePerfumes');
const supabaseBrandRoutes = require('./routes/supabaseBrands');
const photoRoutes = require('./routes/photos');

// Middleware
app.use(helmet());

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
            console.warn(`CORS blocked origin: ${origin}`);
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
// Supabase API v2 (current)
app.use('/api/v2/perfumes', supabasePerfumeRoutes);
app.use('/api/v2/brands', supabaseBrandRoutes);
app.use('/api/v2/photos', photoRoutes);

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

// Initialize and start server
function startServer() {
    // Start the server
    app.listen(PORT, () => {
        console.log(`🌸 Eden Parfum Backend Server running on port ${PORT}`);
        console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
        console.log(`📱 Frontend URL: http://localhost:${PORT}`);
    });
}

// Start the server
startServer();

module.exports = app;
