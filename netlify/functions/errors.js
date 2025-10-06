// Netlify Function: Error Logging
// Simple error collector for frontend error monitoring

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const errorData = JSON.parse(event.body || '{}');
        
        // Log error data (in production, you'd save to database/monitoring service)
        console.log('Frontend Error:', {
            timestamp: new Date().toISOString(),
            type: errorData.type,
            message: errorData.message,
            url: errorData.url,
            userAgent: event.headers['user-agent'],
            stack: errorData.stack,
            userId: errorData.userId,
            sessionId: errorData.sessionId
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Error logged successfully'
            })
        };

    } catch (error) {
        console.error('Error logging failed:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to log error'
            })
        };
    }
};