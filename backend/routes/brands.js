const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    getBrandByName,
    getFeaturedBrands
} = require('../controllers/brandController');

// @route   GET /api/brands
// @desc    Get all brands
// @access  Public
router.get('/', getAllBrands);

// @route   GET /api/brands/featured
// @desc    Get featured brands (brands with most perfumes)
// @access  Public
router.get('/featured', getFeaturedBrands);

// @route   GET /api/brands/:name
// @desc    Get brand by name
// @access  Public
router.get('/:name', getBrandByName);

module.exports = router;
