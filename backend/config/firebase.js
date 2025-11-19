const admin = require('firebase-admin');
require('dotenv').config();

// Firebase configuration
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

if (!serviceAccount.project_id || !serviceAccount.private_key) {
    console.error('❌ FATAL: Missing Firebase credentials in .env file');
    console.error('FIREBASE_PROJECT_ID:', serviceAccount.project_id ? '✓ Set' : '✗ Missing');
    console.error('FIREBASE_PRIVATE_KEY:', serviceAccount.private_key ? '✓ Set' : '✗ Missing');
    process.exit(1);
}

console.log('🔥 Initializing Firebase Admin SDK...');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        process.exit(1);
    }
}

const db = admin.firestore();
console.log('✅ Firestore client ready');

module.exports = { db, admin };