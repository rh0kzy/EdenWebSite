const express = require('express');
const router = express.Router();
const {
    getAllPerfumes,
    getPerfumeById,
    getPerfumesByBrand,
    getPerfumesByGender,
    getRandomPerfumes,
    getPerfumeStats
} = require('../controllers/perfumeController');

// @route   GET /api/perfumes
// @desc    Get all perfumes with optional filtering
// @access  Public
router.get('/', getAllPerfumes);

// @route   GET /api/perfumes/random
// @desc    Get random perfumes for featured section
// @access  Public
router.get('/random', getRandomPerfumes);

// @route   GET /api/perfumes/stats
// @desc    Get perfume statistics
// @access  Public
router.get('/stats', getPerfumeStats);

// @route   GET /api/perfumes/brand/:brand
// @desc    Get perfumes by brand
// @access  Public
router.get('/brand/:brand', getPerfumesByBrand);

// @route   GET /api/perfumes/gender/:gender
// @desc    Get perfumes by gender
// @access  Public
router.get('/gender/:gender', getPerfumesByGender);

// @route   GET /api/perfumes/:id
// @desc    Get perfume by ID
// @access  Public
router.get('/:id', getPerfumeById);

module.exports = router;
