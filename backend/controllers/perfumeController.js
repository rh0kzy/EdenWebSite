const { perfumesDatabase, getUniqueBrands, getUniqueGenders, getBrandLogo } = require('../data/perfumes');

// Get all perfumes with optional filtering
const getAllPerfumes = (req, res) => {
    try {
        const { brand, gender, search, limit, offset } = req.query;
        let filteredPerfumes = [...perfumesDatabase];

        // Apply filters
        if (brand && brand !== '') {
            filteredPerfumes = filteredPerfumes.filter(perfume => 
                perfume.brand.toLowerCase().includes(brand.toLowerCase())
            );
        }

        if (gender && gender !== '') {
            filteredPerfumes = filteredPerfumes.filter(perfume => 
                perfume.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        if (search && search !== '') {
            const searchTerm = search.toLowerCase();
            filteredPerfumes = filteredPerfumes.filter(perfume => 
                perfume.name.toLowerCase().includes(searchTerm) ||
                perfume.brand.toLowerCase().includes(searchTerm) ||
                perfume.reference.toLowerCase().includes(searchTerm)
            );
        }

        // Apply pagination
        const startIndex = parseInt(offset) || 0;
        const limitNum = parseInt(limit) || filteredPerfumes.length;
        const paginatedPerfumes = filteredPerfumes.slice(startIndex, startIndex + limitNum);

        // Add brand logos to perfumes
        const perfumesWithLogos = paginatedPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            total: filteredPerfumes.length,
            count: paginatedPerfumes.length,
            offset: startIndex,
            limit: limitNum
        });
    } catch (error) {
        console.error('Error fetching perfumes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get perfume by ID/reference
const getPerfumeById = (req, res) => {
    try {
        const { id } = req.params;
        const perfume = perfumesDatabase.find(p => 
            p.reference === id || p.reference === id.toString()
        );

        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }

        const perfumeWithLogo = {
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand)
        };

        res.json({
            success: true,
            data: perfumeWithLogo
        });
    } catch (error) {
        console.error('Error fetching perfume:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get perfumes by brand
const getPerfumesByBrand = (req, res) => {
    try {
        const { brand } = req.params;
        const perfumes = perfumesDatabase.filter(perfume => 
            perfume.brand.toLowerCase() === brand.toLowerCase()
        );

        const perfumesWithLogos = perfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            count: perfumes.length
        });
    } catch (error) {
        console.error('Error fetching perfumes by brand:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get perfumes by gender
const getPerfumesByGender = (req, res) => {
    try {
        const { gender } = req.params;
        const perfumes = perfumesDatabase.filter(perfume => 
            perfume.gender.toLowerCase() === gender.toLowerCase()
        );

        const perfumesWithLogos = perfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            count: perfumes.length
        });
    } catch (error) {
        console.error('Error fetching perfumes by gender:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get random perfumes for featured section
const getRandomPerfumes = (req, res) => {
    try {
        const { count = 6 } = req.query;
        const shuffled = [...perfumesDatabase].sort(() => 0.5 - Math.random());
        const randomPerfumes = shuffled.slice(0, parseInt(count));

        const perfumesWithLogos = randomPerfumes.map(perfume => ({
            ...perfume,
            brandLogo: getBrandLogo(perfume.brand)
        }));

        res.json({
            success: true,
            data: perfumesWithLogos,
            count: randomPerfumes.length
        });
    } catch (error) {
        console.error('Error fetching random perfumes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get perfume statistics
const getPerfumeStats = (req, res) => {
    try {
        const brands = getUniqueBrands();
        const genders = getUniqueGenders();
        
        const stats = {
            totalPerfumes: perfumesDatabase.length,
            totalBrands: brands.length,
            genderDistribution: genders.map(gender => ({
                gender,
                count: perfumesDatabase.filter(p => p.gender === gender).length
            })),
            topBrands: brands.map(brand => ({
                brand,
                count: perfumesDatabase.filter(p => p.brand === brand).length,
                logo: getBrandLogo(brand)
            })).sort((a, b) => b.count - a.count).slice(0, 10)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching perfume stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
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
