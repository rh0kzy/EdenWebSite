// Validation middleware for API requests

const validateSearchQuery = (req, res, next) => {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid search query',
            message: 'Search query must be a non-empty string'
        });
    }
    
    if (q.length > 100) {
        return res.status(400).json({
            success: false,
            error: 'Search query too long',
            message: 'Search query must be less than 100 characters'
        });
    }
    
    next();
};

const validatePaginationParams = (req, res, next) => {
    const { limit, offset } = req.query;
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid limit parameter',
            message: 'Limit must be a number between 1 and 100'
        });
    }
    
    if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid offset parameter',
            message: 'Offset must be a non-negative number'
        });
    }
    
    next();
};

const validateReferenceParam = (req, res, next) => {
    const { reference } = req.params;
    
    if (!reference || typeof reference !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Invalid reference parameter',
            message: 'Reference must be a valid string'
        });
    }
    
    // Basic format validation for reference (should be 4 digits)
    if (!/^\d{4}$/.test(reference)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid reference format',
            message: 'Reference must be a 4-digit number'
        });
    }
    
    next();
};

const validateBrandParam = (req, res, next) => {
    const { brand } = req.params;
    
    if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid brand parameter',
            message: 'Brand must be a non-empty string'
        });
    }
    
    next();
};

const validateGenderParam = (req, res, next) => {
    const { gender } = req.params;
    const validGenders = ['men', 'women', 'mixte'];
    
    if (!gender || !validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
            success: false,
            error: 'Invalid gender parameter',
            message: `Gender must be one of: ${validGenders.join(', ')}`
        });
    }
    
    next();
};

module.exports = {
    validateSearchQuery,
    validatePaginationParams,
    validateReferenceParam,
    validateBrandParam,
    validateGenderParam
};
