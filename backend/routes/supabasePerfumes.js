const express = require('express');
const router = express.Router();
const {
    getAllPerfumes,
    getPerfumeByReference,
    getPerfumeById,
    getUniqueGenders,
    createPerfume,
    updatePerfume,
    deletePerfume
} = require('../controllers/supabasePerfumeController');

// Get all perfumes with optional filtering
router.get('/', getAllPerfumes);

// Get unique genders
router.get('/genders', getUniqueGenders);

// Get perfume by reference
router.get('/reference/:reference', getPerfumeByReference);

// Get perfume by ID
router.get('/:id', getPerfumeById);

// Create new perfume (admin)
router.post('/', createPerfume);

// Update perfume (admin)
router.put('/:id', updatePerfume);

// Delete perfume (admin)
router.delete('/:id', deletePerfume);

module.exports = router;