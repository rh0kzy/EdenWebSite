const { executeQuery } = require('../config/database');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM brands
            WHERE isActive = 1
            ORDER BY name ASC
        `;

        const result = await executeQuery(query);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        const brandsWithData = result.data.map(brand => ({
            id: brand.id,
            name: brand.name,
            logo: brand.logoUrl,
            description: brand.description,
            origin: brand.origin,
            website: brand.website,
            slug: brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            perfumeCount: brand.perfumeCount,
            featured: brand.featured
        }));

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
        
        const query = `
            SELECT *
            FROM brands
            WHERE name = ? AND isActive = 1
        `;

        const result = await executeQuery(query, [name]);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        if (result.data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Brand not found',
                message: `Brand "${name}" not found`
            });
        }

        const brand = result.data[0];
        res.json({
            success: true,
            data: {
                id: brand.id,
                name: brand.name,
                logo: brand.logoUrl,
                description: brand.description,
                origin: brand.origin,
                website: brand.website,
                slug: brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                perfumeCount: brand.perfumeCount,
                featured: brand.featured
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
const getFeaturedBrands = async (req, res) => {
    try {
        const { limit = 12 } = req.query;
        
        const query = `
            SELECT *
            FROM brands
            WHERE isActive = 1 AND perfumeCount > 0
            ORDER BY perfumeCount DESC, name ASC
            LIMIT ?
        `;

        const result = await executeQuery(query, [parseInt(limit)]);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        const featuredBrands = result.data.map(brand => ({
            id: brand.id,
            name: brand.name,
            logo: brand.logoUrl,
            description: brand.description,
            origin: brand.origin,
            website: brand.website,
            slug: brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            perfumeCount: brand.perfumeCount,
            featured: brand.featured
        }));

        res.json({
            success: true,
            data: featuredBrands
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
