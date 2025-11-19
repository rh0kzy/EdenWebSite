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
        const queryParams = event.queryStringParameters || {};
        const { search, brand, gender, category, page = 1, limit = 1000 } = queryParams;

        // Ensure reasonable limits for performance
        const maxLimit = 1000;
        const actualLimit = Math.min(parseInt(limit) || 1000, maxLimit);

        console.log('Query params:', queryParams);
        console.log('Applied limit:', actualLimit);

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
        const offset = (parseInt(page) - 1) * actualLimit;
        query = query.orderBy('reference').limit(actualLimit).offset(offset);

        const snapshot = await query.get();
        const perfumes = [];

        // Get brand data for each perfume
        for (const doc of snapshot.docs) {
            const perfumeData = doc.data();
            let brandData = null;

            if (perfumeData.brand_id) {
                const brandDoc = await db.collection('brands').doc(perfumeData.brand_id).get();
                if (brandDoc.exists) {
                    brandData = { id: brandDoc.id, ...brandDoc.data() };
                }
            }

            perfumes.push({
                id: doc.id,
                ...perfumeData,
                brands: brandData
            });
        }

        // Apply search filter (since Firestore doesn't support OR queries easily)
        let filteredPerfumes = perfumes;
        if (search && search !== '') {
            const searchLower = search.toLowerCase();
            filteredPerfumes = perfumes.filter(p =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.brand_name?.toLowerCase().includes(searchLower) ||
                p.reference?.toLowerCase().includes(searchLower)
            );
        }

        // Get total count
        const totalSnapshot = await db.collection('perfumes').get();
        const total = totalSnapshot.size;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: filteredPerfumes || [],
                total: total,
                page: parseInt(page),
                totalPages: Math.ceil(total / actualLimit)
            })
        };

    } catch (error) {
        console.error('Server error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};