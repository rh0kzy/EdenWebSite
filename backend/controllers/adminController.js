const { executeQuery } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../frontend/photos');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Keep original filename
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// BRAND OPERATIONS

// Get all brands for admin
const getAllBrandsAdmin = async (req, res) => {
    try {
        const query = `
            SELECT b.*, 
                   COUNT(p.id) as perfume_count
            FROM brands b
            LEFT JOIN perfumes p ON b.name = p.brand AND p.isActive = 1
            GROUP BY b.id
            ORDER BY b.name
        `;
        
        const result = await executeQuery(query);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Error fetching brands for admin:', error);
        res.status(500).json({ error: 'Failed to fetch brands' });
    }
};

// Create new brand
const createBrand = async (req, res) => {
    try {
        const { name, description, country, founded } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        // Check if brand already exists
        const existingBrand = await executeQuery(
            'SELECT id FROM brands WHERE name = ?',
            [name]
        );

        if (existingBrand.success && existingBrand.data.length > 0) {
            return res.status(400).json({ error: 'Brand already exists' });
        }

        const query = `
            INSERT INTO brands (name, description, country, founded, logoUrl)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const logoUrl = req.file ? `photos/${req.file.filename}` : null;
        
        const result = await executeQuery(query, [
            name,
            description || null,
            country || null,
            founded || null,
            logoUrl
        ]);
        
        res.status(201).json({
            id: result.insertId,
            name,
            description,
            country,
            founded,
            logoUrl,
            message: 'Brand created successfully'
        });
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ error: 'Failed to create brand' });
    }
};

// Update brand
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, country, founded } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        // Check if brand exists
        const existingBrand = await executeQuery(
            'SELECT * FROM brands WHERE id = ?',
            [id]
        );

        if (!existingBrand.success || existingBrand.data.length === 0) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        let logoUrl = existingBrand.data[0].logoUrl;
        if (req.file) {
            logoUrl = `photos/${req.file.filename}`;
            
            // Delete old logo file if it exists
            if (existingBrand[0].logoUrl) {
                const oldLogoPath = path.join(__dirname, '../../frontend', existingBrand[0].logoUrl);
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
        }

        const query = `
            UPDATE brands 
            SET name = ?, description = ?, country = ?, founded = ?, logoUrl = ?
            WHERE id = ?
        `;
        
        await executeQuery(query, [
            name,
            description || null,
            country || null,
            founded || null,
            logoUrl,
            id
        ]);
        
        res.json({
            id,
            name,
            description,
            country,
            founded,
            logoUrl,
            message: 'Brand updated successfully'
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ error: 'Failed to update brand' });
    }
};

// Delete brand
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if brand exists
        const existingBrand = await executeQuery(
            'SELECT * FROM brands WHERE id = ?',
            [id]
        );

        if (!existingBrand.success || existingBrand.data.length === 0) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        // Check if brand has perfumes
        const perfumeCount = await executeQuery(
            'SELECT COUNT(*) as count FROM perfumes WHERE brand = ? AND isActive = 1',
            [existingBrand.data[0].name]
        );

        if (perfumeCount.success && perfumeCount.data[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete brand with active perfumes. Delete or deactivate perfumes first.' 
            });
        }

        // Delete logo file if it exists
        if (existingBrand[0].logoUrl) {
            const logoPath = path.join(__dirname, '../../frontend', existingBrand[0].logoUrl);
            if (fs.existsSync(logoPath)) {
                fs.unlinkSync(logoPath);
            }
        }

        await executeQuery('DELETE FROM brands WHERE id = ?', [id]);
        
        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Failed to delete brand' });
    }
};

// PERFUME OPERATIONS

// Get all perfumes for admin (including inactive)
const getAllPerfumesAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, brand, search } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT p.*
            FROM perfumes p
            WHERE 1=1
        `;
        
        const params = [];
        
        if (brand) {
            query += ' AND p.brand = ?';
            params.push(brand);
        }
        
        if (search) {
            query += ' AND (p.name LIKE ? OR p.brand LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY p.name';
        
        // Get total count
        const countQuery = query.replace('SELECT p.*', 'SELECT COUNT(*) as total');
        const totalResult = await executeQuery(countQuery, params);
        
        if (!totalResult.success) {
            return res.status(500).json({ error: totalResult.error });
        }
        
        const total = totalResult.data[0].total;
        
        // Get paginated results
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const perfumesResult = await executeQuery(query, params);
        
        if (!perfumesResult.success) {
            return res.status(500).json({ error: perfumesResult.error });
        }
        
        res.json({
            perfumes: perfumesResult.data,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total,
                total_pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching perfumes for admin:', error);
        res.status(500).json({ error: 'Failed to fetch perfumes' });
    }
};

// Create new perfume
const createPerfume = async (req, res) => {
    try {
        const {
            name,
            brand,
            gender,
            size,
            price,
            description,
            fragrance_notes,
            longevity,
            sillage,
            season,
            occasion,
            isActive = 1
        } = req.body;
        
        if (!name || !brand || !gender) {
            return res.status(400).json({ 
                error: 'Name, brand, and gender are required' 
            });
        }

        // Check if brand exists
        const brandExists = await executeQuery(
            'SELECT id FROM brands WHERE name = ?',
            [brand]
        );

        if (!brandExists.success || brandExists.data.length === 0) {
            return res.status(400).json({ error: 'Brand does not exist' });
        }

        const query = `
            INSERT INTO perfumes (
                name, brand, gender, size, price, description,
                fragrance_notes, longevity, sillage, season, occasion,
                imageUrl, isActive
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const imageUrl = req.file ? `photos/${req.file.filename}` : null;
        
        const result = await executeQuery(query, [
            name,
            brand,
            gender,
            size || null,
            price || null,
            description || null,
            fragrance_notes || null,
            longevity || null,
            sillage || null,
            season || null,
            occasion || null,
            imageUrl,
            isActive
        ]);
        
        res.status(201).json({
            id: result.insertId,
            name,
            brand,
            gender,
            size,
            price,
            description,
            fragrance_notes,
            longevity,
            sillage,
            season,
            occasion,
            imageUrl,
            isActive,
            message: 'Perfume created successfully'
        });
    } catch (error) {
        console.error('Error creating perfume:', error);
        res.status(500).json({ error: 'Failed to create perfume' });
    }
};

// Update perfume
const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            brand,
            gender,
            size,
            price,
            description,
            fragrance_notes,
            longevity,
            sillage,
            season,
            occasion,
            isActive
        } = req.body;
        
        if (!name || !brand || !gender) {
            return res.status(400).json({ 
                error: 'Name, brand, and gender are required' 
            });
        }

        // Check if perfume exists
        const existingPerfume = await executeQuery(
            'SELECT * FROM perfumes WHERE id = ?',
            [id]
        );

        if (!existingPerfume.success || existingPerfume.data.length === 0) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        // Check if brand exists
        const brandExists = await executeQuery(
            'SELECT id FROM brands WHERE name = ?',
            [brand]
        );

        if (!brandExists.success || brandExists.data.length === 0) {
            return res.status(400).json({ error: 'Brand does not exist' });
        }

        let imageUrl = existingPerfume.data[0].imageUrl;
        if (req.file) {
            imageUrl = `photos/${req.file.filename}`;
            
            // Delete old image file if it exists
            if (existingPerfume[0].imageUrl) {
                const oldImagePath = path.join(__dirname, '../../frontend', existingPerfume[0].imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const query = `
            UPDATE perfumes 
            SET name = ?, brand = ?, gender = ?, size = ?, price = ?,
                description = ?, fragrance_notes = ?, longevity = ?,
                sillage = ?, season = ?, occasion = ?, imageUrl = ?, isActive = ?
            WHERE id = ?
        `;
        
        await executeQuery(query, [
            name,
            brand,
            gender,
            size || null,
            price || null,
            description || null,
            fragrance_notes || null,
            longevity || null,
            sillage || null,
            season || null,
            occasion || null,
            imageUrl,
            isActive,
            id
        ]);
        
        res.json({
            id,
            name,
            brand,
            gender,
            size,
            price,
            description,
            fragrance_notes,
            longevity,
            sillage,
            season,
            occasion,
            imageUrl,
            isActive,
            message: 'Perfume updated successfully'
        });
    } catch (error) {
        console.error('Error updating perfume:', error);
        res.status(500).json({ error: 'Failed to update perfume' });
    }
};

// Delete perfume (soft delete)
const deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent = false } = req.query;
        
        // Check if perfume exists
        const existingPerfume = await executeQuery(
            'SELECT * FROM perfumes WHERE id = ?',
            [id]
        );

        if (!existingPerfume.success || existingPerfume.data.length === 0) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        if (permanent === 'true') {
            // Permanent delete
            if (existingPerfume.data[0].imageUrl) {
                const imagePath = path.join(__dirname, '../../frontend', existingPerfume.data[0].imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            
            await executeQuery('DELETE FROM perfumes WHERE id = ?', [id]);
            res.json({ message: 'Perfume permanently deleted' });
        } else {
            // Soft delete
            await executeQuery('UPDATE perfumes SET isActive = 0 WHERE id = ?', [id]);
            res.json({ message: 'Perfume deactivated successfully' });
        }
    } catch (error) {
        console.error('Error deleting perfume:', error);
        res.status(500).json({ error: 'Failed to delete perfume' });
    }
};

// Get perfume by ID for admin
const getPerfumeByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT p.*, b.logoUrl as brand_logo
            FROM perfumes p
            LEFT JOIN brands b ON p.brand = b.name
            WHERE p.id = ?
        `;
        
        const perfumes = await executeQuery(query, [id]);
        
        if (!perfumes.success || perfumes.data.length === 0) {
            return res.status(404).json({ error: 'Perfume not found' });
        }
        
        res.json(perfumes.data[0]);
    } catch (error) {
        console.error('Error fetching perfume:', error);
        res.status(500).json({ error: 'Failed to fetch perfume' });
    }
};

// Analytics
const getAnalytics = async (req, res) => {
    try {
        const queries = [
            // Total brands
            executeQuery('SELECT COUNT(*) as total FROM brands'),
            // Total perfumes
            executeQuery('SELECT COUNT(*) as total FROM perfumes WHERE isActive = 1'),
            // Total inactive perfumes
            executeQuery('SELECT COUNT(*) as total FROM perfumes WHERE isActive = 0'),
            // Top brands by perfume count
            executeQuery(`
                SELECT b.name, COUNT(p.id) as perfume_count
                FROM brands b
                LEFT JOIN perfumes p ON b.name = p.brand AND p.isActive = 1
                GROUP BY b.id, b.name
                ORDER BY perfume_count DESC
                LIMIT 5
            `),
            // Gender distribution
            executeQuery(`
                SELECT gender, COUNT(*) as count
                FROM perfumes
                WHERE isActive = 1
                GROUP BY gender
            `)
        ];

        const results = await Promise.all(queries);

        // Check if all queries were successful
        const allSuccessful = results.every(result => result.success);
        if (!allSuccessful) {
            const failedQuery = results.find(result => !result.success);
            throw new Error(failedQuery.error);
        }

        res.json({
            total_brands: results[0].data[0]?.total || 0,
            total_perfumes: results[1].data[0]?.total || 0,
            inactive_perfumes: results[2].data[0]?.total || 0,
            top_brands: results[3].data || [],
            gender_distribution: results[4].data || []
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

module.exports = {
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
};
