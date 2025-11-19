const { db } = require('./config/firebase');
require('dotenv').config();

async function verifyData() {
    try {
        console.log('🔍 Verifying Firebase data...');

        // Count brands
        const brandsSnapshot = await db.collection('brands').get();
        console.log(`✅ Brands count: ${brandsSnapshot.size}`);

        // Count perfumes
        const perfumesSnapshot = await db.collection('perfumes').get();
        console.log(`✅ Perfumes count: ${perfumesSnapshot.size}`);

        if (brandsSnapshot.size > 0 && perfumesSnapshot.size > 0) {
            console.log('🎉 Data verification successful! Data exists in Firestore.');
            
            // Show a sample brand
            const sampleBrand = brandsSnapshot.docs[0].data();
            console.log('\n📝 Sample Brand:', JSON.stringify(sampleBrand, null, 2));

            // Show a sample perfume
            const samplePerfume = perfumesSnapshot.docs[0].data();
            console.log('\n📝 Sample Perfume:', JSON.stringify(samplePerfume, null, 2));
        } else {
            console.log('⚠️ Warning: One or more collections are empty.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

// Run verification
verifyData();
