const { createClient } = require('@supabase/supabase-js');
const { db } = require('./config/firebase');
require('dotenv').config();

// Supabase client for reading data
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateData() {
    try {
        console.log('🚀 Starting migration from Supabase to Firebase...');

        // Migrate brands
        console.log('📦 Migrating brands...');
        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('*');

        if (brandsError) {
            console.error('❌ Error fetching brands:', brandsError);
            return;
        }

        for (const brand of brands) {
            const brandData = {
                name: brand.name,
                logo_url: brand.logo_url,
                created_at: new Date(brand.created_at),
                updated_at: new Date(brand.updated_at)
            };

            await db.collection('brands').doc(brand.id.toString()).set(brandData);
            console.log(`✅ Migrated brand: ${brand.name}`);
        }

        // Migrate perfumes
        console.log('🫧 Migrating perfumes...');
        const { data: perfumes, error: perfumesError } = await supabase
            .from('perfumes')
            .select('*');

        if (perfumesError) {
            console.error('❌ Error fetching perfumes:', perfumesError);
            return;
        }

        for (const perfume of perfumes) {
            const perfumeData = {
                reference: perfume.reference,
                name: perfume.name,
                brand_id: perfume.brand_id ? perfume.brand_id.toString() : null,
                brand_name: perfume.brand_name,
                gender: perfume.gender,
                description: perfume.description,
                price: perfume.price,
                image_url: perfume.image_url,
                is_available: perfume.is_available,
                created_at: new Date(perfume.created_at),
                updated_at: new Date(perfume.updated_at)
            };

            await db.collection('perfumes').doc(perfume.id.toString()).set(perfumeData);
            console.log(`✅ Migrated perfume: ${perfume.name}`);
        }

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };