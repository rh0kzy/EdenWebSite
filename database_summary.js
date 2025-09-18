// Complete Eden Parfum Database Summary
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function showCompleteSummary() {
    console.log('🌸 EDEN PARFUM - COMPLETE DATABASE SUMMARY 🌸\n');
    
    try {
        // Get total counts
        const [brandsResult, perfumesResult, logosResult, imagesResult] = await Promise.all([
            supabase.from('brands').select('*', { count: 'exact', head: true }),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }),
            supabase.from('brands').select('*', { count: 'exact', head: true }).not('logo_url', 'is', null),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }).not('image_url', 'is', null)
        ]);

        console.log('📊 DATABASE STATISTICS:');
        console.log(`   Total Brands: ${brandsResult.count}`);
        console.log(`   Total Perfumes: ${perfumesResult.count}`);
        console.log(`   Brands with Logos: ${logosResult.count} (${((logosResult.count / brandsResult.count) * 100).toFixed(1)}%)`);
        console.log(`   Perfumes with Images: ${imagesResult.count} (${((imagesResult.count / perfumesResult.count) * 100).toFixed(1)}%)`);

        // Get gender distribution
        const { data: genderStats } = await supabase
            .from('perfumes')
            .select('gender');
        
        const genderCount = {};
        genderStats.forEach(p => {
            genderCount[p.gender] = (genderCount[p.gender] || 0) + 1;
        });

        console.log('\n👥 GENDER DISTRIBUTION:');
        Object.entries(genderCount).forEach(([gender, count]) => {
            console.log(`   ${gender}: ${count} perfumes`);
        });

        // Get top brands
        const { data: brandStats } = await supabase
            .from('brands')
            .select(`
                name,
                logo_url,
                perfumes (count)
            `)
            .order('name');

        const topBrands = brandStats
            .map(brand => ({
                name: brand.name,
                count: brand.perfumes[0]?.count || 0,
                hasLogo: !!brand.logo_url
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        console.log('\n🏆 TOP 10 BRANDS BY PERFUME COUNT:');
        topBrands.forEach((brand, index) => {
            const logoIcon = brand.hasLogo ? '🖼️' : '📷';
            console.log(`   ${index + 1}. ${brand.name}: ${brand.count} perfumes ${logoIcon}`);
        });

        // Sample perfumes with images
        const { data: samplePerfumes } = await supabase
            .from('perfumes')
            .select(`
                reference,
                name,
                brand_name,
                gender,
                image_url,
                brands (logo_url)
            `)
            .not('image_url', 'is', null)
            .limit(5);

        console.log('\n🌸 SAMPLE PERFUMES WITH IMAGES:');
        samplePerfumes.forEach(perfume => {
            const brandLogo = perfume.brands?.logo_url ? '🏷️' : '🔖';
            console.log(`   ${perfume.reference}: ${perfume.name} by ${perfume.brand_name} (${perfume.gender}) ${brandLogo}🖼️`);
        });

        console.log('\n🚀 AVAILABLE API ENDPOINTS:');
        console.log('   📋 Basic Data:');
        console.log('      GET /api/v2/brands - All brands');
        console.log('      GET /api/v2/perfumes - All perfumes');
        console.log('      GET /api/v2/perfumes?search=chanel - Search perfumes');
        console.log('      GET /api/v2/perfumes?gender=Women - Filter by gender');
        console.log('      GET /api/v2/perfumes?brand=Dior - Filter by brand');
        
        console.log('   📸 Photo Integration:');
        console.log('      GET /api/v2/photos/perfumes - Perfumes with complete photo URLs');
        console.log('      GET /api/v2/photos/featured - Featured perfumes with images');
        console.log('      GET /api/v2/photos/stats - Photo coverage statistics');

        console.log('\n💾 PHOTO STORAGE:');
        console.log('   Brand Logos: /frontend/photos/ (96 files)');
        console.log('   Perfume Images: /frontend/photos/Fragrances/ (499 files)');
        console.log('   Static Assets: Served by Express.js');

        console.log('\n🎯 UPGRADE ACHIEVEMENTS:');
        console.log('   ✅ Migrated from static JavaScript files to PostgreSQL database');
        console.log('   ✅ Integrated 96 brand logos and 499 perfume images');
        console.log('   ✅ Created professional REST API with versioning');
        console.log('   ✅ Implemented search and filtering capabilities');
        console.log('   ✅ Added French localization (Mixte for Unisex)');
        console.log('   ✅ Established brand-perfume relationships');
        console.log('   ✅ Set up photo URL management system');
        console.log('   ✅ Ready for e-commerce features (price, description fields)');

        console.log('\n🔮 READY FOR NEXT STEPS:');
        console.log('   📱 Update frontend to use new API endpoints');
        console.log('   🛒 Add shopping cart functionality');
        console.log('   💰 Implement price management');
        console.log('   📝 Add product descriptions');
        console.log('   👨‍💼 Create admin dashboard');
        console.log('   🔍 Enhance search with full-text search');
        console.log('   ⭐ Add product ratings and reviews');

        console.log('\n🎊 Your Eden Parfum website is now a professional, scalable e-commerce platform!');

    } catch (error) {
        console.error('Error generating summary:', error);
    }
}

showCompleteSummary();