// Complete migration with gender mapping and data clearing
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role for migration (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL and service role key must be provided');
    process.exit(1);
}

// Create Supabase client with service role
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

// Map gender values
function mapGender(gender) {
    if (!gender) return null;
    const normalizedGender = gender.toLowerCase();
    if (normalizedGender === 'unisex') return 'Mixte';
    if (normalizedGender === 'women') return 'Women';
    if (normalizedGender === 'men') return 'Men';
    if (normalizedGender === 'mixte') return 'Mixte';
    return gender; // Return as-is if not recognized
}

async function clearExistingData() {
    console.log('🧹 Clearing existing data...');
    
    // Delete perfumes first (due to foreign key constraint)
    const { error: perfumesError } = await supabase
        .from('perfumes')
        .delete()
        .gte('id', 0); // Delete all records
        
    if (perfumesError) {
        console.error('Error clearing perfumes:', perfumesError);
        return false;
    }
    
    // Delete brands
    const { error: brandsError } = await supabase
        .from('brands')
        .delete()
        .gte('id', 0); // Delete all records
        
    if (brandsError) {
        console.error('Error clearing brands:', brandsError);
        return false;
    }
    
    console.log('✅ Existing data cleared');
    return true;
}

async function completeMigration() {
    try {
        console.log('🚀 Starting complete migration to Supabase...');
        console.log('Using service role for migration (bypasses RLS)');
        
        // Clear existing data
        const cleared = await clearExistingData();
        if (!cleared) {
            console.error('Failed to clear existing data');
            return;
        }
        
        // Step 1: Extract unique brands
        const uniqueBrands = [...new Set(perfumesData.map(p => p.brand).filter(brand => brand && brand.trim()))];
        console.log(`Found ${uniqueBrands.length} unique brands`);
        
        // Step 2: Insert brands
        console.log('📝 Inserting brands...');
        const brandInserts = uniqueBrands.map(brand => ({
            name: brand.trim(),
            logo_url: null
        }));
        
        const { data: insertedBrands, error: brandsError } = await supabase
            .from('brands')
            .insert(brandInserts)
            .select();
            
        if (brandsError) {
            console.error('Error inserting brands:', brandsError);
            return;
        }
        
        console.log(`✅ Successfully inserted ${insertedBrands.length} brands`);
        
        // Step 3: Create brand name to ID mapping
        const brandMap = {};
        insertedBrands.forEach(brand => {
            brandMap[brand.name] = brand.id;
        });
        
        // Step 4: Prepare perfume data with gender mapping
        console.log('🌸 Preparing perfumes data...');
        const perfumeInserts = perfumesData.map(perfume => ({
            reference: perfume.reference,
            name: perfume.name,
            brand_id: perfume.brand && perfume.brand.trim() ? brandMap[perfume.brand.trim()] : null,
            brand_name: perfume.brand || null,
            gender: mapGender(perfume.gender),
            description: null,
            price: null,
            image_url: null,
            is_available: true
        }));
        
        console.log(`Prepared ${perfumeInserts.length} perfumes for insertion`);
        
        // Check gender distribution
        const genderCount = {};
        perfumeInserts.forEach(p => {
            genderCount[p.gender] = (genderCount[p.gender] || 0) + 1;
        });
        console.log('Gender distribution:', genderCount);
        
        // Step 5: Insert perfumes in batches
        console.log('💫 Inserting perfumes...');
        const batchSize = 50; // Smaller batches to avoid errors
        let insertedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < perfumeInserts.length; i += batchSize) {
            const batch = perfumeInserts.slice(i, i + batchSize);
            const { data, error } = await supabase
                .from('perfumes')
                .insert(batch);
                
            if (error) {
                console.error(`❌ Error inserting perfumes batch ${Math.floor(i / batchSize) + 1}:`, error);
                errorCount += batch.length;
                
                // Try inserting one by one for this batch
                console.log('   🔄 Trying individual inserts for this batch...');
                for (const perfume of batch) {
                    const { error: singleError } = await supabase
                        .from('perfumes')
                        .insert([perfume]);
                        
                    if (singleError) {
                        console.log(`   ❌ Failed to insert ${perfume.reference}: ${perfume.name} - ${singleError.message}`);
                    } else {
                        insertedCount++;
                    }
                }
            } else {
                insertedCount += batch.length;
                console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${perfumesData.length} perfumes inserted`);
            }
        }
        
        console.log(`\n🎉 Migration completed!`);
        console.log(`📊 Final Summary:`);
        console.log(`   - Brands: ${insertedBrands.length}`);
        console.log(`   - Perfumes: ${insertedCount} successfully inserted`);
        console.log(`   - Errors: ${errorCount} perfumes failed`);
        console.log(`   - Success rate: ${((insertedCount / perfumesData.length) * 100).toFixed(1)}%`);
        console.log('');
        console.log('🎊 Your Eden Parfum database is fully migrated!');
        console.log('');
        console.log('🚀 Next steps:');
        console.log('1. Test the API: http://localhost:3000/api/v2/perfumes');
        console.log('2. Update frontend to use Supabase');
        console.log('3. Consider adding product images and prices');
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
    }
}

// Run migration if called directly
if (require.main === module) {
    completeMigration();
}

module.exports = { completeMigration };