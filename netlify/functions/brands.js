const { initializeFirebase } = require('./firebase-config');

let db;

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

    // Initialize Firebase if not already initialized
    try {
        if (!db) {
            db = initializeFirebase();
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Database initialization failed',
                details: error.message
            })
        };
    }

    try {
        // Parse query parameters with defensive caps
        const params = event.queryStringParameters || {};
        const MAX_LIMIT = 200;
        const requestedLimit = parseInt(params.limit, 10) || 100;
        const limitNum = Math.min(requestedLimit, MAX_LIMIT);
        const offsetNum = parseInt(params.offset, 10) || 0;
        const limitWasCapped = requestedLimit > MAX_LIMIT;
        const includeCounts = params.include_counts === 'true';

        // Fetch brands with pagination
        const brandsSnapshot = await db.collection('brands')
            .orderBy('name')
            .limit(limitNum)
            .offset(offsetNum)
            .get();

        let brands = brandsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            perfume_count: 0 // Default to 0 to save reads
        }));

        // Only count perfumes if explicitly requested
        // This saves massive amounts of reads (N+1 problem)
        if (includeCounts && brands.length > 0) {
            try {
                // Optimization: Fetch all perfumes (brand_id only) in one query
                // instead of N queries. This is much cheaper and faster.
                const perfumesSnapshot = await db.collection('perfumes')
                    .select('brand_id')
                    .get();
                
                const counts = {};
                perfumesSnapshot.forEach(doc => {
                    const brandId = doc.data().brand_id;
                    if (brandId) {
                        counts[brandId] = (counts[brandId] || 0) + 1;
                    }
                });

                brands = brands.map(brand => ({
                    ...brand,
                    perfume_count: counts[brand.id] || 0
                }));
            } catch (error) {
                console.error('Error counting perfumes:', error);
                // Continue with 0 counts
            }
        }

        // Try to get total count efficiently
        let total = brandsSnapshot.size + offsetNum;
        try {
            if (!limitWasCapped) {
                const totalSnapshot = await db.collection('brands').get();
                total = totalSnapshot.size;
            }
        } catch (err) {
            // Silent fallback
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: brands,
                total: total,
                page: Math.floor(offsetNum / limitNum) + 1,
                limit: limitNum,
                totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
                limit_was_capped: limitWasCapped
            })
        };

    } catch (error) {
        console.error('Error fetching brands:', error);
        
        // Handle Quota Exceeded specifically
        if (error.code === 8 || (error.message && error.message.includes('Quota exceeded'))) {
            return {
                statusCode: 429, // Too Many Requests
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Daily quota exceeded. Please try again tomorrow.',
                    details: error.message
                })
            };
        }

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
};
