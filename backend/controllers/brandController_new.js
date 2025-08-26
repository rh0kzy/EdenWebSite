const { getUniqueBrands, getBrandLogo, perfumesDatabase } = require('../data/perfumes');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const uniqueBrands = getUniqueBrands();
        
        const brandsWithData = uniqueBrands.map(brandName => {
            const perfumeCount = perfumesDatabase.filter(p => p.brand === brandName).length;
            
            return {
                id: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                name: brandName,
                logo: getBrandLogo(brandName),
                description: `Discover ${brandName} fragrances`,
                slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                perfumeCount: perfumeCount,
                featured: perfumeCount > 5 // Consider brands with more than 5 perfumes as featured
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            data: brandsWithData,
            total: brandsWithData.length
        });
    } catch (error) {
        console.error('Error in getAllBrands:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get brand by name
const getBrandByName = async (req, res) => {
    try {
        const { name } = req.params;
        
        const uniqueBrands = getUniqueBrands();
        const brandName = uniqueBrands.find(brand => 
            brand.toLowerCase() === name.toLowerCase() ||
            brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') === name.toLowerCase()
        );
        
        if (!brandName) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found'
            });
        }
        
        const perfumeCount = perfumesDatabase.filter(p => p.brand === brandName).length;
        
        const brandData = {
            id: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            name: brandName,
            logo: getBrandLogo(brandName),
            description: `Discover ${brandName} fragrances`,
            slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            perfumeCount: perfumeCount,
            featured: perfumeCount > 5
        };

        res.json({
            success: true,
            data: brandData
        });
    } catch (error) {
        console.error('Error in getBrandByName:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get featured brands (brands with more than 5 perfumes)
const getFeaturedBrands = async (req, res) => {
    try {
        const uniqueBrands = getUniqueBrands();
        
        const featuredBrands = uniqueBrands.map(brandName => {
            const perfumeCount = perfumesDatabase.filter(p => p.brand === brandName).length;
            
            return {
                id: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                name: brandName,
                logo: getBrandLogo(brandName),
                description: `Discover ${brandName} fragrances`,
                slug: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                perfumeCount: perfumeCount,
                featured: true
            };
        }).filter(brand => brand.perfumeCount > 5)
          .sort((a, b) => b.perfumeCount - a.perfumeCount)
          .slice(0, 12); // Get top 12 featured brands

        res.json({
            success: true,
            data: featuredBrands,
            total: featuredBrands.length
        });
    } catch (error) {
        console.error('Error in getFeaturedBrands:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get brand statistics
const getBrandStats = async (req, res) => {
    try {
        const uniqueBrands = getUniqueBrands();
        const totalBrands = uniqueBrands.length;
        
        // Get brand distribution
        const brandStats = uniqueBrands.map(brandName => {
            const perfumes = perfumesDatabase.filter(p => p.brand === brandName);
            const womenCount = perfumes.filter(p => p.gender === 'Women').length;
            const menCount = perfumes.filter(p => p.gender === 'Men').length;
            const unisexCount = perfumes.filter(p => p.gender === 'Unisex').length;
            
            return {
                name: brandName,
                totalPerfumes: perfumes.length,
                womenPerfumes: womenCount,
                menPerfumes: menCount,
                unisexPerfumes: unisexCount,
                logo: getBrandLogo(brandName)
            };
        }).sort((a, b) => b.totalPerfumes - a.totalPerfumes);

        res.json({
            success: true,
            data: {
                totalBrands,
                brandDistribution: brandStats,
                topBrands: brandStats.slice(0, 10)
            }
        });
    } catch (error) {
        console.error('Error in getBrandStats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllBrands,
    getBrandByName,
    getFeaturedBrands,
    getBrandStats
};
