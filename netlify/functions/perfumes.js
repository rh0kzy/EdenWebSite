const { initializeFirebase } = require('./firebase-config');

let db;

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
        const queryParams = event.queryStringParameters || {};
        const { search, brand, gender, category, page = 1, limit = 100 } = queryParams;

        // Cap limits to prevent resource exhaustion
        const MAX_LIMIT = 200;
        const requestedLimit = parseInt(limit, 10) || 100;
        const actualLimit = Math.min(requestedLimit, MAX_LIMIT);
        const pageNum = parseInt(page, 10) || 1;
        const offset = (pageNum - 1) * actualLimit;
        const limitWasCapped = requestedLimit > MAX_LIMIT;



        let query = db.collection('perfumes');

        // Apply filters
        if (brand && brand !== '') {
            query = query.where('brand_name', '>=', brand.toLowerCase())
                         .where('brand_name', '<=', brand.toLowerCase() + '\uf8ff');
        }

        if (gender && gender !== '') {
            query = query.where('gender', '==', gender);
        }

        // Apply pagination and sorting
        query = query.orderBy('reference').limit(actualLimit).offset(offset);

        const snapshot = await query.get();

        // Get brand data in parallel per perfume
        const perfumes = await Promise.all(snapshot.docs.map(async (doc) => {
            const perfumeData = doc.data();
            let brandData = null;

            try {
                if (perfumeData.brand_id) {
                    const brandDoc = await db.collection('brands').doc(perfumeData.brand_id).get();
                    if (brandDoc.exists) {
                        brandData = { id: brandDoc.id, ...brandDoc.data() };
                    }
                }
            } catch (err) {
                // Silent error
            }

            return {
                id: doc.id,
                ...perfumeData,
                brands: brandData
            };
        }));

        // Apply search filter (client-side since Firestore doesn't support OR queries)
        let filteredPerfumes = perfumes;
        if (search && search !== '') {
            const searchLower = search.toLowerCase();
            filteredPerfumes = perfumes.filter(p =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.brand_name?.toLowerCase().includes(searchLower) ||
                p.reference?.toLowerCase().includes(searchLower)
            );
        }

        // Get total count efficiently
        let total = snapshot.size + offset;
        try {
            if (!limitWasCapped) {
                const totalSnapshot = await db.collection('perfumes').get();
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
                data: filteredPerfumes || [],
                total: total,
                page: pageNum,
                limit: actualLimit,
                totalPages: Math.ceil(total / actualLimit),
                limit_was_capped: limitWasCapped
            })
        };

    } catch (error) {
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