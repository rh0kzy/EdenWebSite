// Complete Eden Parfum Database Summary
require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function showCompleteSummary() {
    // EDEN PARFUM - COMPLETE DATABASE SUMMARY
    
    try {
        // Get total counts
        const [brandsResult, perfumesResult, logosResult, imagesResult] = await Promise.all([
            supabase.from('brands').select('*', { count: 'exact', head: true }),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }),
            supabase.from('brands').select('*', { count: 'exact', head: true }).not('logo_url', 'is', null),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }).not('image_url', 'is', null)
        ]);

        // Database statistics
        const stats = {
            totalBrands: brandsResult.count,
            totalPerfumes: perfumesResult.count,
            brandsWithLogos: logosResult.count,
            perfumesWithImages: imagesResult.count,
            logoPercentage: ((logosResult.count / brandsResult.count) * 100).toFixed(1),
            imagePercentage: ((imagesResult.count / perfumesResult.count) * 100).toFixed(1)
        };

        // Get gender distribution
        const { data: genderStats } = await supabase
            .from('perfumes')
            .select('gender');
        
        const genderCount = {};
        genderStats.forEach(p => {
            genderCount[p.gender] = (genderCount[p.gender] || 0) + 1;
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

        // Summary data collected successfully
        return {
            success: true,
            statistics: stats,
            genderDistribution: genderCount,
            topBrands: topBrands,
            samplePerfumes: samplePerfumes,
            message: 'Database summary generated successfully'
        };

    } catch (error) {
        // Error generating summary
        return {
            success: false,
            error: error.message
        };
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    showCompleteSummary().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = showCompleteSummary;