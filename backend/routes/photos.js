const express = require('express');
const router = express.Router();
const {
    getPerfumesWithPhotos,
    getFeaturedPerfumes,
    getPhotoStats
} = require('../controllers/photoController');

// Get perfumes with complete photo information
router.get('/perfumes', getPerfumesWithPhotos);

// Get featured perfumes (with images)
router.get('/featured', getFeaturedPerfumes);

// Get photo statistics
router.get('/stats', getPhotoStats);

module.exports = router;