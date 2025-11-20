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
        console.error('Firebase initialization error:', error);
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

        // Fetch brands with pagination
        const brandsSnapshot = await db.collection('brands')
            .orderBy('name')
            .limit(limitNum)
            .offset(offsetNum)
            .get();

        // Count perfumes in parallel per brand (safer and faster)
        const brands = await Promise.all(brandsSnapshot.docs.map(async (brandDoc) => {
            const brandData = brandDoc.data();
            try {
                const perfumesSnapshot = await db.collection('perfumes')
                    .where('brand_id', '==', brandDoc.id)
                    .get();

                return {
                    id: brandDoc.id,
                    ...brandData,
                    perfume_count: perfumesSnapshot.size
                };
            } catch (err) {
                console.error('Error counting perfumes for brand', brandDoc.id, err);
                return {
                    id: brandDoc.id,
                    ...brandData,
                    perfume_count: 0
                };
            }
        }));

        // Try to get total count efficiently
        let total = brandsSnapshot.size + offsetNum;
        try {
            if (!limitWasCapped) {
                const totalSnapshot = await db.collection('brands').get();
                total = totalSnapshot.size;
            }
        } catch (err) {
            console.warn('Could not compute total count efficiently', err);
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
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
