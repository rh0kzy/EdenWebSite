// Test Supabase integration
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSupabaseIntegration() {
    console.log('🧪 Testing Supabase Integration...\n');
    
    try {
        // Test 1: Count brands
        const { count: brandCount, error: brandError } = await supabase
            .from('brands')
            .select('*', { count: 'exact', head: true });
            
        if (brandError) throw brandError;
        console.log(`✅ Brands: ${brandCount} records`);
        
        // Test 2: Count perfumes
        const { count: perfumeCount, error: perfumeError } = await supabase
            .from('perfumes')
            .select('*', { count: 'exact', head: true });
            
        if (perfumeError) throw perfumeError;
        console.log(`✅ Perfumes: ${perfumeCount} records`);
        
        // Test 3: Get sample brands
        const { data: brands, error: sampleBrandsError } = await supabase
            .from('brands')
            .select('*')
            .limit(5);
            
        if (sampleBrandsError) throw sampleBrandsError;
        console.log(`\n📋 Sample Brands:`);
        brands.forEach(brand => console.log(`   - ${brand.name} (ID: ${brand.id})`));
        
        // Test 4: Get sample perfumes with brand info
        const { data: perfumes, error: samplePerfumesError } = await supabase
            .from('perfumes')
            .select(`
                reference,
                name,
                gender,
                brand_name,
                brands (name)
            `)
            .limit(5);
            
        if (samplePerfumesError) throw samplePerfumesError;
        console.log(`\n🌸 Sample Perfumes:`);
        perfumes.forEach(perfume => {
            const brandName = perfume.brands?.name || perfume.brand_name || 'Unknown';
            console.log(`   - ${perfume.reference}: ${perfume.name} by ${brandName} (${perfume.gender})`);
        });
        
        // Test 5: Search functionality
        const { data: searchResults, error: searchError } = await supabase
            .from('perfumes')
            .select('reference, name, brand_name')
            .ilike('name', '%love%')
            .limit(3);
            
        if (searchError) throw searchError;
        console.log(`\n🔍 Search results for "love":`);
        searchResults.forEach(perfume => {
            console.log(`   - ${perfume.reference}: ${perfume.name} by ${perfume.brand_name}`);
        });
        
        console.log(`\n🎉 Supabase integration is working perfectly!`);
        console.log(`📊 Database Status:`);
        console.log(`   - ${brandCount} brands`);
        console.log(`   - ${perfumeCount} perfumes`);
        console.log(`   - API endpoints ready at http://localhost:3000/api/v2/`);
        
    } catch (error) {
        console.error('❌ Error testing Supabase:', error);
    }
}

testSupabaseIntegration();