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
        const brandsSnapshot = await db.collection('brands')
            .orderBy('name')
            .get();

        const brands = [];
        for (const brandDoc of brandsSnapshot.docs) {
            const brandData = brandDoc.data();

            // Count perfumes for this brand
            const perfumesQuery = db.collection('perfumes').where('brand_id', '==', brandDoc.id);
            const perfumesSnapshot = await perfumesQuery.get();

            brands.push({
                id: brandDoc.id,
                ...brandData,
                perfume_count: perfumesSnapshot.size
            });
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: brands,
                total: brands.length
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
                details: error.message
            })
        };
    }
};
