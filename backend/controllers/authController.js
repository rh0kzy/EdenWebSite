// Admin Authentication Controller
const bcrypt = require('bcryptjs');

// ⚠️ CONFIGURATION - CHANGE THESE VALUES!
// For security, these should be stored in environment variables
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    // Password: 'EDENPARFUM1974'
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$aeaE2xjelcNBC.ar4mstXuK.QF8egdIlnjwfoej4wlGtlIRYQfUpq'
};

// You can generate a password hash using:
// const bcrypt = require('bcryptjs');
// const hash = bcrypt.hashSync('your-password', 10);
// console.log(hash);

/**
 * Login endpoint
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // For initial setup, allow plain text password comparison
        // TODO: Remove this after setting up proper password hash
        const isPasswordValid = password === 'admin123' || 
                                bcrypt.compareSync(password, ADMIN_CREDENTIALS.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate simple token (in production, use JWT)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            username: username
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Logout endpoint
 */
const logout = (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

/**
 * Verify token endpoint
 */
const verify = (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    // Simple verification (in production, verify JWT)
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [username, timestamp] = decoded.split(':');
        
        // Token valid for 24 hours
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        res.json({
            success: true,
            username: username
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

module.exports = {
    login,
    logout,
    verify
};
