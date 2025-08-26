const express = require('express');
const router = express.Router();
const {
    upload,
    getAllBrandsAdmin,
    createBrand,
    updateBrand,
    deleteBrand,
    getAllPerfumesAdmin,
    createPerfume,
    updatePerfume,
    deletePerfume,
    getPerfumeByIdAdmin,
    getAnalytics
} = require('../controllers/adminController');

// Analytics
router.get('/analytics', getAnalytics);

// Brand routes
router.get('/brands', getAllBrandsAdmin);
router.post('/brands', upload.single('logo'), createBrand);
router.put('/brands/:id', upload.single('logo'), updateBrand);
router.delete('/brands/:id', deleteBrand);

// Perfume routes
router.get('/perfumes', getAllPerfumesAdmin);
router.get('/perfumes/:id', getPerfumeByIdAdmin);
router.post('/perfumes', upload.single('image'), createPerfume);
router.put('/perfumes/:id', upload.single('image'), updatePerfume);
router.delete('/perfumes/:id', deletePerfume);

module.exports = router;
