// Netlify Function for Authentication
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Main handler for authentication endpoints
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

    const path = event.path.replace('/.netlify/functions/auth', '');
    
    // Route to appropriate handler
    if (path === '/login' && event.httpMethod === 'POST') {
        return handleLogin(event);
    } else if (path === '/verify' && event.httpMethod === 'GET') {
        return handleVerify(event);
    } else if (path === '/logout' && event.httpMethod === 'POST') {
        return handleLogout(event);
    } else {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
    }
};

/**
 * Handle login request
 */
async function handleLogin(event) {
    try {
        const { username, password } = JSON.parse(event.body);

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
}

/**
 * Handle token verification
 */
function handleVerify(event) {
    try {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'No token provided'
                })
            };
        }

        // Decode and verify token
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [username, timestamp] = decoded.split(':');

        // Token valid for 24 hours
        const tokenAge = Date.now() - parseInt(timestamp);
        const maxAge = 24 * 60 * 60 * 1000;

        if (tokenAge > maxAge) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Token expired'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                username: username
            })
        };
    } catch (error) {
        console.error('Verify error:', error);
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Invalid token'
            })
        };
    }
}

/**
 * Handle logout request
 */
function handleLogout(event) {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Logout successful'
        })
    };
}
