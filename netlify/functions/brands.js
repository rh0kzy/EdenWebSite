const { initializeSupabase } = require('./supabase-config');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabase = initializeSupabase();
        const params = event.queryStringParameters || {};
        
        const MAX_LIMIT = 1000;
        const limitNum = Math.min(parseInt(params.limit, 10) || 100, MAX_LIMIT);
        const offsetNum = parseInt(params.offset, 10) || 0;

        const { data, error, count } = await supabase
            .from('brands')
            .select('*', { count: 'exact' })
            .order('name')
            .range(offsetNum, offsetNum + limitNum - 1);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: data,
                total: count,
                limit: limitNum,
                offset: offsetNum
            })
        };

    } catch (error) {
        console.error('Error fetching brands:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch brands',
                details: error.message,
                stack: error.stack
            })
        };
    }
};
