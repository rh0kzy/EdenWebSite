const { perfumesDatabase, getUniqueBrands, getUniqueGenders, getBrandLogo } = require('../data/perfumes');

// Get all perfumes with optional filtering
const getAllPerfumes = (req, res) => {
    try {
        const { brand, gender, search, limit, offset = 0 } = req.query;
        let filteredPerfumes = [...perfumesDatabase];

        // Filter by brand
        if (brand && brand !== 'all') {
            filteredPerfumes = filteredPerfumes.filter(perfume => 
                perfume.brand.toLowerCase() === brand.toLowerCase()
            );
        }

        // Filter by gender
        if (gender && gender !== 'all') {
            filteredPerfumes = filteredPerfumes.filter(perfume => 
                perfume.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        // Search functionality
        if (search) {
            const searchLower = search.toLowerCase();
            filteredPerfumes = filteredPerfumes.filter(perfume =>
                perfume.name.toLowerCase().includes(searchLower) ||
                perfume.brand.toLowerCase().includes(searchLower) ||
                perfume.reference.toLowerCase().includes(searchLower)
            );
        }

        // Pagination
        const total = filteredPerfumes.length;
        const startIndex = parseInt(offset);
        const endIndex = limit ? startIndex + parseInt(limit) : filteredPerfumes.length;
        
        const paginatedPerfumes = filteredPerfumes.slice(startIndex, endIndex);

        // Add brand logos to perfumes
        const perfumesWithLogos = paginatedPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand),
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            pagination: {
                total,
                offset: startIndex,
                limit: limit ? parseInt(limit) : total,
                hasMore: endIndex < total
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

// Get perfume by reference
const getPerfumeByReference = (req, res) => {
    try {
        const { reference } = req.params;
        const perfume = perfumesDatabase.find(p => p.reference === reference);

        if (!perfume) {
            return res.status(404).json({
                success: false,
                error: 'Perfume not found',
                message: `No perfume found with reference: ${reference}`
            });
        }

        res.json({
            success: true,
            data: {
                ...perfume,
                brandLogo: getBrandLogo(perfume.brand),
                imageUrl: `/photos/Fragrances/${perfume.name}.avif`
            }
        });
    } catch (error) {
        console.error('Error in getPerfumeByReference:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get perfumes by brand
const getPerfumesByBrand = (req, res) => {
    try {
        const { brand } = req.params;
        const { limit, offset = 0 } = req.query;
        
        const brandPerfumes = perfumesDatabase.filter(perfume => 
            perfume.brand.toLowerCase() === brand.toLowerCase()
        );

        if (brandPerfumes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No perfumes found',
                message: `No perfumes found for brand: ${brand}`
            });
        }

        // Pagination
        const total = brandPerfumes.length;
        const startIndex = parseInt(offset);
        const endIndex = limit ? startIndex + parseInt(limit) : brandPerfumes.length;
        
        const paginatedPerfumes = brandPerfumes.slice(startIndex, endIndex);

        const perfumesWithLogos = paginatedPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand),
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            pagination: {
                total,
                offset: startIndex,
                limit: limit ? parseInt(limit) : total,
                hasMore: endIndex < total
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
const getPerfumesByGender = (req, res) => {
    try {
        const { gender } = req.params;
        const { limit, offset = 0 } = req.query;
        
        const genderPerfumes = perfumesDatabase.filter(perfume => 
            perfume.gender.toLowerCase() === gender.toLowerCase()
        );

        if (genderPerfumes.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No perfumes found',
                message: `No perfumes found for gender: ${gender}`
            });
        }

        // Pagination
        const total = genderPerfumes.length;
        const startIndex = parseInt(offset);
        const endIndex = limit ? startIndex + parseInt(limit) : genderPerfumes.length;
        
        const paginatedPerfumes = genderPerfumes.slice(startIndex, endIndex);

        const perfumesWithLogos = paginatedPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand),
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            pagination: {
                total,
                offset: startIndex,
                limit: limit ? parseInt(limit) : total,
                hasMore: endIndex < total
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
const getRandomPerfumes = (req, res) => {
    try {
        const { count = 6 } = req.query;
        const shuffled = [...perfumesDatabase].sort(() => 0.5 - Math.random());
        const randomPerfumes = shuffled.slice(0, parseInt(count));

        const perfumesWithLogos = randomPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand),
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`
        }));

        res.json({
            success: true,
            data: perfumesWithLogos
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
const getPerfumeStats = (req, res) => {
    try {
        const total = perfumesDatabase.length;
        const byGender = getUniqueGenders().map(gender => ({
            gender,
            count: perfumesDatabase.filter(p => p.gender === gender).length
        }));
        const byBrand = getUniqueBrands().map(brand => ({
            brand,
            count: perfumesDatabase.filter(p => p.brand === brand).length
        })).sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: {
                total,
                totalBrands: getUniqueBrands().length,
                byGender,
                topBrands: byBrand.slice(0, 10)
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
    getPerfumeByReference,
    getPerfumesByBrand,
    getPerfumesByGender,
    getRandomPerfumes,
    getPerfumeStats
};
