// Load environment variables from backend directory
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role for migration (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL and service role key must be provided');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
    process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        console.log('Using service role for migration (bypasses RLS)');
        
        // Check if data already exists
        const { count: existingBrands } = await supabase
            .from('brands')
            .select('*', { count: 'exact', head: true });
            
        const { count: existingPerfumes } = await supabase
            .from('perfumes')
            .select('*', { count: 'exact', head: true });
            
        if (existingBrands > 0 || existingPerfumes > 0) {
            console.log(`⚠️  Data already exists:`);
            console.log(`   - Brands: ${existingBrands}`);
            console.log(`   - Perfumes: ${existingPerfumes}`);
            console.log('');
            console.log('To re-migrate, first clear the existing data or use a fresh database.');
            return;
        }
        
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
        console.log('🎉 Your Eden Parfum database is now ready!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test the new API endpoints: /api/v2/perfumes and /api/v2/brands');
        console.log('2. Update your frontend to use the new Supabase integration');
        console.log('3. Consider adding admin features for managing inventory');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };