// Test Supabase integration
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSupabaseIntegration() {
    // Testing Supabase Integration
    
    try {
        // Test 1: Count brands
        const { count: brandCount, error: brandError } = await supabase
            .from('brands')
            .select('*', { count: 'exact', head: true });
            
        if (brandError) throw brandError;
        // Brands: ${brandCount} records
        
        // Test 2: Count perfumes
        const { count: perfumeCount, error: perfumeError } = await supabase
            .from('perfumes')
            .select('*', { count: 'exact', head: true });
            
        if (perfumeError) throw perfumeError;
        // Perfumes: ${perfumeCount} records
        
        // Test 3: Get sample brands
        const { data: brands, error: sampleBrandsError } = await supabase
            .from('brands')
            .select('*')
            .limit(5);
            
        if (sampleBrandsError) throw sampleBrandsError;
        // Sample Brands retrieved
        
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
        // Sample Perfumes retrieved
        
        // Test 5: Search functionality
        const { data: searchResults, error: searchError } = await supabase
            .from('perfumes')
            .select('reference, name, brand_name')
            .ilike('name', '%love%')
            .limit(3);
            
        if (searchError) throw searchError;
        // Search functionality tested
        
        // Supabase integration test completed successfully
        // Database Status: ${brandCount} brands, ${perfumeCount} perfumes
        
        return {
            success: true,
            brandCount,
            perfumeCount,
            message: 'Supabase integration test completed successfully'
        };
        
    } catch (error) {
        // Error testing Supabase
        return {
            success: false,
            error: error.message
        };
    }
}

// Only run test if this file is executed directly
if (require.main === module) {
    testSupabaseIntegration().then(result => {
        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    });
}

module.exports = testSupabaseIntegration;