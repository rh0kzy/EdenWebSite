// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { supabase } = require('../backend/config/supabase');
const fs = require('fs');
const path = require('path');

// Import the existing perfumes data
const perfumesDataPath = path.join(__dirname, '../frontend/perfumes-data.js');
const perfumesDataContent = fs.readFileSync(perfumesDataPath, 'utf8');

// Extract the perfumes array from the file
const perfumesMatch = perfumesDataContent.match(/const perfumesDatabase = (\[[\s\S]*?\]);/);
if (!perfumesMatch) {
    console.error('Could not find perfumes data in file');
    process.exit(1);
}

const perfumesData = eval(perfumesMatch[1]);

async function migrateData() {
    try {
        console.log('Starting data migration to Supabase...');
        
        // Step 1: Extract unique brands
        const uniqueBrands = [...new Set(perfumesData.map(p => p.brand).filter(brand => brand && brand.trim()))];
        console.log(`Found ${uniqueBrands.length} unique brands`);
        
        // Step 2: Insert brands
        console.log('Inserting brands...');
        const brandInserts = uniqueBrands.map(brand => ({
            name: brand.trim(),
            logo_url: null // We'll update this later with the actual logo URLs
        }));
        
        const { data: insertedBrands, error: brandsError } = await supabase
            .from('brands')
            .insert(brandInserts)
            .select();
            
        if (brandsError) {
            console.error('Error inserting brands:', brandsError);
            return;
        }
        
        console.log(`Successfully inserted ${insertedBrands.length} brands`);
        
        // Step 3: Create brand name to ID mapping
        const brandMap = {};
        insertedBrands.forEach(brand => {
            brandMap[brand.name] = brand.id;
        });
        
        // Step 4: Insert perfumes
        console.log('Inserting perfumes...');
        const perfumeInserts = perfumesData.map(perfume => ({
            reference: perfume.reference,
            name: perfume.name,
            brand_id: perfume.brand && perfume.brand.trim() ? brandMap[perfume.brand.trim()] : null,
            brand_name: perfume.brand || null,
            gender: perfume.gender,
            description: null,
            price: null,
            image_url: null,
            is_available: true
        }));
        
        // Insert in batches to avoid size limits
        const batchSize = 100;
        let insertedCount = 0;
        
        for (let i = 0; i < perfumeInserts.length; i += batchSize) {
            const batch = perfumeInserts.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('perfumes')
                .insert(batch);
                
            if (error) {
                console.error(`Error inserting perfumes batch ${i / batchSize + 1}:`, error);
                continue;
            }
            
            insertedCount += batch.length;
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${perfumesData.length} perfumes`);
        }
        
        console.log(`✅ Migration completed successfully!`);
        console.log(`📊 Summary:`);
        console.log(`   - Brands: ${insertedBrands.length}`);
        console.log(`   - Perfumes: ${insertedCount}`);
        console.log('');
        console.log('Next steps:');
        console.log('1. Update your .env file with your Supabase credentials');
        console.log('2. Run the schema.sql file in your Supabase dashboard');
        console.log('3. Update your backend controllers to use Supabase');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };