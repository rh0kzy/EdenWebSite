/**
 * Sync Brand IDs Script
 * This script ensures all perfumes have their brand_id properly set based on brand_name
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncBrandIds() {
    console.log('🔄 Starting brand ID synchronization...\n');

    try {
        // 1. Fetch all perfumes
        const { data: perfumes, error: perfumesError } = await supabase
            .from('perfumes')
            .select('id, name, brand_name, brand_id')
            .order('id');

        if (perfumesError) {
            throw new Error(`Failed to fetch perfumes: ${perfumesError.message}`);
        }

        console.log(`📦 Found ${perfumes.length} perfumes to check\n`);

        // 2. Fetch all brands
        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('id, name');

        if (brandsError) {
            throw new Error(`Failed to fetch brands: ${brandsError.message}`);
        }

        console.log(`🏷️  Found ${brands.length} brands\n`);

        // Create a map of brand names to IDs (case-insensitive)
        const brandMap = new Map();
        brands.forEach(brand => {
            brandMap.set(brand.name.toLowerCase().trim(), brand.id);
        });

        // 3. Process each perfume
        let updated = 0;
        let skipped = 0;
        let created = 0;
        const newBrands = new Set();

        for (const perfume of perfumes) {
            if (!perfume.brand_name) {
                console.log(`⚠️  Perfume #${perfume.id} "${perfume.name}" has no brand_name, skipping`);
                skipped++;
                continue;
            }

            const brandNameKey = perfume.brand_name.toLowerCase().trim();
            let brandId = brandMap.get(brandNameKey);

            // If brand doesn't exist, create it
            if (!brandId && !newBrands.has(brandNameKey)) {
                console.log(`➕ Creating new brand: "${perfume.brand_name}"`);
                const { data: newBrand, error: createError } = await supabase
                    .from('brands')
                    .insert({ name: perfume.brand_name })
                    .select()
                    .single();

                if (createError) {
                    console.error(`❌ Failed to create brand "${perfume.brand_name}": ${createError.message}`);
                    skipped++;
                    continue;
                }

                brandId = newBrand.id;
                brandMap.set(brandNameKey, brandId);
                newBrands.add(brandNameKey);
                created++;
            }

            // Update perfume if brand_id is different
            if (perfume.brand_id !== brandId) {
                const { error: updateError } = await supabase
                    .from('perfumes')
                    .update({ brand_id: brandId })
                    .eq('id', perfume.id);

                if (updateError) {
                    console.error(`❌ Failed to update perfume #${perfume.id}: ${updateError.message}`);
                    skipped++;
                } else {
                    console.log(`✅ Updated perfume #${perfume.id} "${perfume.name}" -> Brand: "${perfume.brand_name}" (ID: ${brandId})`);
                    updated++;
                }
            } else {
                // Already has correct brand_id
                skipped++;
            }
        }

        // 4. Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SYNCHRONIZATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Updated: ${updated} perfumes`);
        console.log(`➕ Created: ${created} new brands`);
        console.log(`⏭️  Skipped: ${skipped} perfumes (already correct or no brand)`);
        console.log(`📦 Total processed: ${perfumes.length} perfumes`);
        console.log('='.repeat(60) + '\n');

        // 5. Verify counts
        console.log('🔍 Verifying brand perfume counts...\n');
        
        const { data: updatedBrands, error: verifyError } = await supabase
            .from('brands')
            .select('id, name')
            .order('name');

        if (verifyError) {
            throw new Error(`Failed to verify brands: ${verifyError.message}`);
        }

        for (const brand of updatedBrands) {
            const { count, error: countError } = await supabase
                .from('perfumes')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id);

            if (!countError) {
                console.log(`   ${brand.name}: ${count} perfume${count !== 1 ? 's' : ''}`);
            }
        }

        console.log('\n✨ All done! You can now refresh the admin-brands.html page.\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncBrandIds();
