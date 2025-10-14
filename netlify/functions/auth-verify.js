// Netlify Function for Token Verification
const bcrypt = require('bcryptjs');

// CORS headers
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

/**
 * Verify token handler
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

    // Only accept GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

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

        console.log('Token verified for user:', username);

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
};
