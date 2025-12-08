const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/supabaseBrandController');

// Get all brands
router.get('/', getAllBrands);

// Get brand by ID
router.get('/:id', getBrandById);

// Create new brand (admin)
router.post('/', createBrand);

// Update brand (admin)
router.put('/:id', updateBrand);

// Delete brand (admin)
router.delete('/:id', deleteBrand);

module.exports = router;