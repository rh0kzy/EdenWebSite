// Netlify Function: Social Analytics
// Simple analytics collector for social media interactions

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
        const data = JSON.parse(event.body || '{}');
        
        // Log analytics data (in production, you'd save to database)
        console.log('Social Analytics Event:', {
            timestamp: new Date().toISOString(),
            event: data.event,
            platform: data.platform,
            url: data.url,
            userAgent: event.headers['user-agent']
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Analytics event logged'
            })
        };

    } catch (error) {
        console.error('Analytics error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to log analytics'
            })
        };
    }
};