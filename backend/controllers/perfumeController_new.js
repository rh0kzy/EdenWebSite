const { executeQuery } = require('../config/database');

// Helper function to get brand logo
function getBrandLogo(brandName) {
    const brandLogos = {
        'Chanel': 'photos/chanel.png',
        'Dior': 'photos/dior.png',
        'Gucci': 'photos/gucci-1-logo-black-and-white.png',
        'Versace': 'photos/versace.png',
        'Prada': 'photos/PRADA.png',
        'Armani': 'photos/armani.png',
        'Burberry': 'photos/BURBERRY.svg',
        'Calvin Klein': 'photos/calvin klein.svg',
        'Hugo Boss': 'photos/hugo boss.png',
        'Jean Paul Gaultier': 'photos/jean-paul-gaultier-vector-logo.png',
        'Marc Jacobs': 'photos/marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
        'Killian': 'photos/kilian paris logo_black_540x260px.png',
        'Bvlgari': 'photos/Bulgari_logo.svg.png',
        'Escada': 'photos/escada.png',
        'Diesel': 'photos/Diesel_Parfume_Logo.png',
        'Jimmy Choo': 'photos/Jimmy_choo.png',
        'Elisabeth Arden': 'photos/Elisabeth Arden.png',
        'Azzaro': 'photos/Logo_Azzaro.png',
        'Cerruti': 'photos/Cerruti.svg',
        'Zara': 'photos/zara.png',
        'Britney Spears': 'photos/Britney_Spears.png',
        'Roberto Cavalli': 'photos/Roberto-Cavalli-logo.png',
        'Repetto': 'photos/Repetto.jpg',
        'Chloe': 'photos/chloe-Converted.png',
        'Rochas': 'photos/Rochas.jpg',
        'Givenchy': 'photos/givenchy.png',
        'Lancome': 'photos/Lancome.png',
        'Kenzo': 'photos/61fd47dd1042bd46515add61_logo (1) kenzo.png',
        'Lacoste': 'photos/lacoste.png',
        'Paco Rabbane': 'photos/PACO RABBANE.png'
    };
    
    return brandLogos[brandName] || null;
}

// Get all perfumes with optional filtering
const getAllPerfumes = async (req, res) => {
    try {
        const { brand, gender, search, limit, offset = 0 } = req.query;
        
        // Build the base query
        let query = `
            SELECT p.*
            FROM perfumes p
            WHERE p.isActive = 1
        `;
        
        const params = [];

        // Filter by brand
        if (brand && brand !== 'all') {
            query += ` AND p.brand = ?`;
            params.push(brand);
        }

        // Filter by gender
        if (gender && gender !== 'all') {
            query += ` AND p.gender = ?`;
            params.push(gender);
        }

        // Search functionality
        if (search) {
            query += ` AND (p.searchField LIKE ? OR p.name LIKE ? OR p.brand LIKE ? OR p.reference LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // Get total count for pagination
        const countQuery = query.replace('SELECT p.* FROM perfumes p', 'SELECT COUNT(*) as total FROM perfumes p');
        
        const countResult = await executeQuery(countQuery, params);
        const total = countResult.success ? countResult.data[0].total : 0;

        // Add pagination
        query += ` ORDER BY p.name ASC`;
        if (limit) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));
        } else {
            query += ` OFFSET ?`;
            params.push(parseInt(offset));
        }

        const result = await executeQuery(query, params);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        // Process the results
        const perfumesWithImages = result.data.map(perfume => ({
            ...perfume,
            imageUrl: perfume.imageUrl || `/photos/Fragrances/${perfume.name}.avif`,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithImages,
            pagination: {
                total,
                offset: parseInt(offset),
                limit: limit ? parseInt(limit) : total,
                hasMore: parseInt(offset) + (limit ? parseInt(limit) : total) < total
            }
        });
    } catch (error) {
        console.error('Error in getAllPerfumes:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get perfume by ID
const getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT p.*
            FROM perfumes p
            WHERE p.id = ? AND p.isActive = 1
        `;

        const result = await executeQuery(query, [id]);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        if (result.data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Perfume not found',
                message: `No perfume found with ID: ${id}`
            });
        }

        const perfume = result.data[0];
        res.json({
            success: true,
            data: {
                ...perfume,
                imageUrl: perfume.imageUrl || `/photos/Fragrances/${perfume.name}.avif`,
                brandLogo: getBrandLogo(perfume.brand)
            }
        });
    } catch (error) {
        console.error('Error in getPerfumeById:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get perfumes by brand
const getPerfumesByBrand = async (req, res) => {
    try {
        const { brand } = req.params;
        const { limit, offset = 0 } = req.query;
        
        const query = `
            SELECT p.*
            FROM perfumes p
            WHERE p.brand = ? AND p.isActive = 1
            ORDER BY p.name ASC
            ${limit ? 'LIMIT ? OFFSET ?' : 'OFFSET ?'}
        `;

        const params = limit ? [brand, parseInt(limit), parseInt(offset)] : [brand, parseInt(offset)];
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM perfumes p
            WHERE p.brand = ? AND p.isActive = 1
        `;
        
        const countResult = await executeQuery(countQuery, [brand]);
        const total = countResult.success ? countResult.data[0].total : 0;

        const result = await executeQuery(query, params);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        if (result.data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No perfumes found',
                message: `No perfumes found for brand: ${brand}`
            });
        }

        const perfumesWithImages = result.data.map(perfume => ({
            ...perfume,
            imageUrl: perfume.imageUrl || `/photos/Fragrances/${perfume.name}.avif`,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithImages,
            pagination: {
                total,
                offset: parseInt(offset),
                limit: limit ? parseInt(limit) : total,
                hasMore: parseInt(offset) + (limit ? parseInt(limit) : total) < total
            }
        });
    } catch (error) {
        console.error('Error in getPerfumesByBrand:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get perfumes by gender
const getPerfumesByGender = async (req, res) => {
    try {
        const { gender } = req.params;
        const { limit, offset = 0 } = req.query;
        
        const query = `
            SELECT p.*
            FROM perfumes p
            WHERE p.gender = ? AND p.isActive = 1
            ORDER BY p.name ASC
            ${limit ? 'LIMIT ? OFFSET ?' : 'OFFSET ?'}
        `;

        const params = limit ? [gender, parseInt(limit), parseInt(offset)] : [gender, parseInt(offset)];
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM perfumes p
            WHERE p.gender = ? AND p.isActive = 1
        `;
        
        const countResult = await executeQuery(countQuery, [gender]);
        const total = countResult.success ? countResult.data[0].total : 0;

        const result = await executeQuery(query, params);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        if (result.data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No perfumes found',
                message: `No perfumes found for gender: ${gender}`
            });
        }

        const perfumesWithImages = result.data.map(perfume => ({
            ...perfume,
            imageUrl: perfume.imageUrl || `/photos/Fragrances/${perfume.name}.avif`,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithImages,
            pagination: {
                total,
                offset: parseInt(offset),
                limit: limit ? parseInt(limit) : total,
                hasMore: parseInt(offset) + (limit ? parseInt(limit) : total) < total
            }
        });
    } catch (error) {
        console.error('Error in getPerfumesByGender:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get random perfumes (for featured section)
const getRandomPerfumes = async (req, res) => {
    try {
        const { count = 6 } = req.query;
        
        const query = `
            SELECT p.*
            FROM perfumes p
            WHERE p.isActive = 1
            ORDER BY RAND()
            LIMIT ?
        `;

        const result = await executeQuery(query, [parseInt(count)]);
        
        if (!result.success) {
            throw new Error(result.error);
        }

        const perfumesWithImages = result.data.map(perfume => ({
            ...perfume,
            imageUrl: perfume.imageUrl || `/photos/Fragrances/${perfume.name}.avif`,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithImages
        });
    } catch (error) {
        console.error('Error in getRandomPerfumes:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get perfume statistics
const getPerfumeStats = async (req, res) => {
    try {
        // Get total perfumes
        const totalQuery = 'SELECT COUNT(*) as total FROM perfumes WHERE isActive = 1';
        const totalResult = await executeQuery(totalQuery);
        const total = totalResult.success ? totalResult.data[0].total : 0;

        // Get total brands
        const brandsQuery = 'SELECT COUNT(*) as total FROM brands WHERE isActive = 1';
        const brandsResult = await executeQuery(brandsQuery);
        const totalBrands = brandsResult.success ? brandsResult.data[0].total : 0;

        // Get by gender
        const genderQuery = `
            SELECT gender, COUNT(*) as count 
            FROM perfumes 
            WHERE isActive = 1
            GROUP BY gender 
            ORDER BY count DESC
        `;
        const genderResult = await executeQuery(genderQuery);
        const byGender = genderResult.success ? genderResult.data : [];

        // Get top brands
        const topBrandsQuery = `
            SELECT brand, COUNT(*) as count
            FROM perfumes
            WHERE isActive = 1
            GROUP BY brand
            ORDER BY count DESC
            LIMIT 10
        `;
        const topBrandsResult = await executeQuery(topBrandsQuery);
        const topBrands = topBrandsResult.success ? topBrandsResult.data : [];

        res.json({
            success: true,
            data: {
                total,
                totalBrands,
                byGender,
                topBrands
            }
        });
    } catch (error) {
        console.error('Error in getPerfumeStats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllPerfumes,
    getPerfumeById,
    getPerfumesByBrand,
    getPerfumesByGender,
    getRandomPerfumes,
    getPerfumeStats
};
