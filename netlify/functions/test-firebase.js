const { initializeFirebase } = require('./firebase-config');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };

    try {
        // Check environment variables
        const envCheck = {
            FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
            FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
            FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
            FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
            FIREBASE_PRIVATE_KEY_HAS_NEWLINES: process.env.FIREBASE_PRIVATE_KEY?.includes('\n') || false,
            FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
            FIREBASE_CLIENT_ID: !!process.env.FIREBASE_CLIENT_ID,
            FIREBASE_CLIENT_X509_CERT_URL: !!process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

        console.log('Environment check:', envCheck);

        // Try to initialize Firebase
        const db = initializeFirebase();
        
        // Try a simple query
        const testSnapshot = await db.collection('brands').limit(1).get();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Firebase initialized successfully',
                envCheck,
                testQuerySize: testSnapshot.size
            })
        };
    } catch (error) {
        console.error('Test failed:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack
            })
        };
    }
};
