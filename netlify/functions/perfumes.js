const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
try {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials missing');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error('Supabase initialization error:', error);
}

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

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Check if Supabase is initialized
    if (!supabase) {
        console.error('Supabase not initialized:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            urlLength: supabaseUrl?.length,
            keyLength: supabaseKey?.length
        });
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Database connection not available',
                debug: {
                    hasUrl: !!supabaseUrl,
                    hasKey: !!supabaseKey,
                    nodeEnv: process.env.NODE_ENV
                }
            })
        };
    }

    try {
        const queryParams = event.queryStringParameters || {};
        const { search, brand, gender, category, page = 1, limit = 1000 } = queryParams;

        // Ensure reasonable limits for performance
        const maxLimit = 1000;
        const actualLimit = Math.min(parseInt(limit) || 1000, maxLimit);

        console.log('Query params:', queryParams);
        console.log('Applied limit:', actualLimit);

        let query = supabase
            .from('perfumes')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `, { count: 'exact' });

        // Apply filters
        if (brand && brand !== '') {
            query = query.ilike('brand_name', `%${brand}%`);
        }

        if (gender && gender !== '') {
            query = query.eq('gender', gender);
        }

        if (search && search !== '') {
            query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,reference.ilike.%${search}%`);
        }

        // Apply pagination
        const offset = (parseInt(page) - 1) * actualLimit;
        query = query
            .range(offset, offset + actualLimit - 1)
            .order('reference', { ascending: true });

        const { data: perfumes, error, count } = await query;

        if (error) {
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: perfumes || [],
                total: count || 0,
                page: parseInt(page),
                totalPages: Math.ceil((count || 0) / actualLimit)
            })
        };

    } catch (error) {
        console.error('Server error:', error);
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