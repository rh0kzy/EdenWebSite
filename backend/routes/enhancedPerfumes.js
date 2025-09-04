const express = require('express');
const router = express.Router();
const {
    getEnhancedPerfumeDetails,
    getFragrancePyramid,
    getSimilarPerfumes,
    getBrandInfo
} = require('../controllers/enhancedPerfumeController');

// Get complete enhanced perfume details
router.get('/enhanced/:reference', getEnhancedPerfumeDetails);

// Get fragrance pyramid and notes
router.get('/pyramid/:reference', getFragrancePyramid);

// Get similar fragrances
router.get('/similar/:reference', getSimilarPerfumes);

// Get brand information
router.get('/brand/:reference', getBrandInfo);

module.exports = router;
