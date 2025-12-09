const { initializeSupabase } = require('./supabase-config');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        const queryParams = event.queryStringParameters || {};
        const { search, brand, gender, category, page = 1, limit = 100 } = queryParams;

        const MAX_LIMIT = 200;
        const actualLimit = Math.min(parseInt(limit, 10) || 100, MAX_LIMIT);
        const pageNum = parseInt(page, 10) || 1;
        const offset = (pageNum - 1) * actualLimit;

        let query = supabase
            .from('perfumes')
            .select('*, brands(id, name, logo_url)', { count: 'exact' });

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,reference.ilike.%${search}%`);
        }
        if (brand) {
            query = query.ilike('brand_name', `%${brand}%`);
        }
        if (gender) {
            query = query.eq('gender', gender);
        }

        // Apply pagination
        query = query.range(offset, offset + actualLimit - 1).order('reference');

        const { data, error, count } = await query;

        if (error) throw error;

        // Transform data to match expected format
        const perfumes = data.map(perfume => ({
            ...perfume,
            brand_id: perfume.brands?.id,
            brand_name: perfume.brands?.name || perfume.brand_name
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: perfumes,
                total: count,
                page: pageNum,
                limit: actualLimit,
                totalPages: Math.ceil(count / actualLimit)
            })
        };

    } catch (error) {
        console.error('Error fetching perfumes:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch perfumes',
                details: error.message
            })
        };
    }
};