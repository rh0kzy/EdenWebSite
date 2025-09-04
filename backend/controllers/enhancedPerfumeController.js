const { getEnhancedPerfume, getSimilarFragrances } = require('../data/enhancedPerfumes');

// Get enhanced perfume details
const getEnhancedPerfumeDetails = (req, res) => {
    try {
        const { reference } = req.params;
        const perfume = getEnhancedPerfume(reference);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }
        
        res.json({
            success: true,
            data: perfume
        });
    } catch (error) {
        console.error('Error fetching enhanced perfume:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get fragrance pyramid data
const getFragrancePyramid = (req, res) => {
    try {
        const { reference } = req.params;
        const perfume = getEnhancedPerfume(reference);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }
        
        const pyramidData = {
            notes: perfume.fragranceNotes,
            pyramid: perfume.fragrancePyramid,
            characteristics: perfume.characteristics,
            wearabilityGuide: perfume.wearabilityGuide
        };
        
        res.json({
            success: true,
            data: pyramidData
        });
    } catch (error) {
        console.error('Error fetching fragrance pyramid:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get similar fragrances
const getSimilarPerfumes = (req, res) => {
    try {
        const { reference } = req.params;
        const { limit = 3 } = req.query;
        
        const similarPerfumes = getSimilarFragrances(reference, parseInt(limit));
        
        res.json({
            success: true,
            data: similarPerfumes
        });
    } catch (error) {
        console.error('Error fetching similar perfumes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get brand information
const getBrandInfo = (req, res) => {
    try {
        const { reference } = req.params;
        const perfume = getEnhancedPerfume(reference);
        
        if (!perfume) {
            return res.status(404).json({
                success: false,
                message: 'Perfume not found'
            });
        }
        
        res.json({
            success: true,
            data: perfume.brandInfo
        });
    } catch (error) {
        console.error('Error fetching brand info:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getEnhancedPerfumeDetails,
    getFragrancePyramid,
    getSimilarPerfumes,
    getBrandInfo
};
