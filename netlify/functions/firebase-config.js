const admin = require('firebase-admin');

let db;

// Initialize Firebase Admin SDK
function initializeFirebase() {
    if (admin.apps.length === 0) {
        // More robust private key handling for Netlify environment
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Handle multiple newline encoding scenarios
        if (privateKey) {
            // Replace literal \n with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
            
            // Ensure proper PEM format with clean newlines
            privateKey = privateKey.trim();
            
            // If it's all on one line, reconstruct it properly
            if (!privateKey.includes('\n')) {
                // Extract the key content between BEGIN and END
                const match = privateKey.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/);
                if (match && match[1]) {
                    const keyContent = match[1].replace(/\s/g, '');
                    // Split into 64-character lines (standard PEM format)
                    const lines = keyContent.match(/.{1,64}/g) || [];
                    privateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
                }
            }
        }

        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: privateKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };

        // Detailed error logging for debugging
        if (!serviceAccount.project_id) {
            throw new Error('Firebase credentials missing: FIREBASE_PROJECT_ID');
        }
        if (!serviceAccount.private_key) {
            throw new Error('Firebase credentials missing: FIREBASE_PRIVATE_KEY');
        }
        if (!serviceAccount.client_email) {
            throw new Error('Firebase credentials missing: FIREBASE_CLIENT_EMAIL');
        }

        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (error) {
            throw error;
        }
    }

    db = admin.firestore();
    return db;
}

module.exports = { initializeFirebase };
