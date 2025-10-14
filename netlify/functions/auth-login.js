// Netlify Function for Login
const bcrypt = require('bcryptjs');

// Admin credentials (should be in environment variables)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$aeaE2xjelcNBC.ar4mstXuK.QF8egdIlnjwfoej4wlGtlIRYQfUpq'
};

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Login handler
 */
exports.handler = async (event, context) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        console.log('Login attempt for user:', username);

        if (!username || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Username and password are required'
                })
            };
        }

        // Check username
        if (username !== ADMIN_CREDENTIALS.username) {
            console.log('Invalid username');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid credentials'
                })
            };
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid credentials'
                })
            };
        }

        // Generate token (simple base64 encoding)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');

        console.log('Login successful for user:', username);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Login successful',
                token: token,
                username: username
            })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};
