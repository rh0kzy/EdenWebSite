const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    getBrandById,
    getBrandByName,
    getBrandsWithCount,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/supabaseBrandController');

// Get all brands
router.get('/', getAllBrands);

// Get brands with perfume count
router.get('/with-count', getBrandsWithCount);

// Get brand by name
router.get('/name/:name', getBrandByName);

// Get brand by ID
router.get('/:id', getBrandById);

// Create new brand (admin)
router.post('/', createBrand);

// Update brand (admin)
router.put('/:id', updateBrand);

// Delete brand (admin)
router.delete('/:id', deleteBrand);

module.exports = router;