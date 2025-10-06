const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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

    // Handle different photo endpoints based on path
    const path = event.path;
    
    try {
        if (path.includes('/stats')) {
            // Photo statistics endpoint
            const [brandsResult, perfumesResult, logosResult, imagesResult] = await Promise.all([
                supabase.from('brands').select('*', { count: 'exact', head: true }),
                supabase.from('perfumes').select('*', { count: 'exact', head: true }),
                supabase.from('brands').select('*', { count: 'exact', head: true }).not('logo_url', 'is', null),
                supabase.from('perfumes').select('*', { count: 'exact', head: true }).not('image_url', 'is', null)
            ]);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        totalBrands: brandsResult.count || 0,
                        totalPerfumes: perfumesResult.count || 0,
                        brandsWithPhotos: logosResult.count || 0,
                        perfumesWithPhotos: imagesResult.count || 0
                    }
                })
            };
        } else if (path.includes('/brands')) {
            // Brands with perfume count endpoint
            const { data: brands, error } = await supabase
                .from('brands')
                .select(`
                    *,
                    perfumes (count)
                `)
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching brands with count:', error);
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Failed to fetch brands',
                        details: error.message
                    })
                };
            }

            // Transform the data to include perfume count
            const brandsWithCount = brands.map(brand => ({
                ...brand,
                perfumeCount: brand.perfumes?.[0]?.count || 0,
                perfumes: undefined // Remove the nested perfumes object
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: brandsWithCount,
                    total: brandsWithCount.length
                })
            };
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Photo endpoint not found' })
            };
        }

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