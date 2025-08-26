const express = require('express');
const router = express.Router();
const {
    searchPerfumes,
    getSearchSuggestions,
    advancedSearch
} = require('../controllers/searchController');

// @route   GET /api/search
// @desc    Search perfumes
// @access  Public
router.get('/', searchPerfumes);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// @route   GET /api/search/advanced
// @desc    Advanced search with multiple filters
// @access  Public
router.get('/advanced', advancedSearch);

module.exports = router;
