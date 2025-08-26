const { getUniqueBrands, getBrandLogo } = require('../data/perfumes');

// Get all brands
const getAllBrands = (req, res) => {
    try {
        const brands = getUniqueBrands();
        const brandsWithLogos = brands.map(brand => ({
            name: brand,
            logo: getBrandLogo(brand),
            slug: brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
        }));

        res.json({
            success: true,
            data: brandsWithLogos,
            total: brands.length
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
const getBrandByName = (req, res) => {
    try {
        const { name } = req.params;
        const brands = getUniqueBrands();
        const brand = brands.find(b => b.toLowerCase() === name.toLowerCase());

        if (!brand) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found',
                message: `Brand "${name}" not found`
            });
        }

        res.json({
            success: true,
            data: {
                name: brand,
                logo: getBrandLogo(brand),
                slug: brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            }
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

// Get featured brands (brands with most perfumes)
const getFeaturedBrands = (req, res) => {
    try {
        const { perfumesDatabase } = require('../data/perfumes');
        const { limit = 12 } = req.query;
        
        const brandCounts = {};
        perfumesDatabase.forEach(perfume => {
            if (perfume.brand) {
                brandCounts[perfume.brand] = (brandCounts[perfume.brand] || 0) + 1;
            }
        });

        const sortedBrands = Object.entries(brandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, parseInt(limit))
            .map(([brand, count]) => ({
                name: brand,
                logo: getBrandLogo(brand),
                slug: brand.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                perfumeCount: count
            }));

        res.json({
            success: true,
            data: sortedBrands
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

module.exports = {
    getAllBrands,
    getBrandByName,
    getFeaturedBrands
};
