const { db } = require('../config/firebase');
const { logActivity } = require('../utils/activityLogger');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        // Fetch all brands
        const brandsQuery = db.collection('brands')
            .orderBy('name')
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        const brandsSnapshot = await brandsQuery.get();
        const brands = [];

        // For each brand, count the perfumes
        for (const brandDoc of brandsSnapshot.docs) {
            const brandData = brandDoc.data();

            // Count perfumes for this brand
            const perfumesQuery = db.collection('perfumes').where('brand_id', '==', brandDoc.id);
            const perfumesSnapshot = await perfumesQuery.get();

            brands.push({
                id: brandDoc.id,
                ...brandData,
                perfume_count: perfumesSnapshot.size
            });
        }

        // Get total count
        const totalSnapshot = await db.collection('brands').get();
        const total = totalSnapshot.size;

        res.json({
            data: brands,
            total: total,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get brand by ID
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const brandDoc = await db.collection('brands').doc(id).get();

        if (!brandDoc.exists) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        const brandData = brandDoc.data();

        // Get perfumes for this brand
        const perfumesSnapshot = await db.collection('perfumes')
            .where('brand_id', '==', id)
            .select('id', 'reference', 'name', 'gender', 'price', 'is_available')
            .get();

        const perfumes = [];
        perfumesSnapshot.forEach(doc => {
            perfumes.push({ id: doc.id, ...doc.data() });
        });

        const brand = {
            id: brandDoc.id,
            ...brandData,
            perfumes: perfumes
        };

        res.json(brand);

    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get brand by name
const getBrandByName = async (req, res) => {
    try {
        const { name } = req.params;

        const brandSnapshot = await db.collection('brands').where('name', '==', name).limit(1).get();

        if (brandSnapshot.empty) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        const brandDoc = brandSnapshot.docs[0];
        const brandData = brandDoc.data();

        // Get perfumes for this brand
        const perfumesSnapshot = await db.collection('perfumes')
            .where('brand_id', '==', brandDoc.id)
            .select('id', 'reference', 'name', 'gender', 'price', 'is_available')
            .get();

        const perfumes = [];
        perfumesSnapshot.forEach(doc => {
            perfumes.push({ id: doc.id, ...doc.data() });
        });

        const brand = {
            id: brandDoc.id,
            ...brandData,
            perfumes: perfumes
        };

        res.json(brand);

    } catch (error) {
        console.error('Error fetching brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get brands with perfume count
const getBrandsWithCount = async (req, res) => {
    try {
        const { data: brands, error } = await supabase
            .from('brands')
            .select(`
                *,
                perfumes (count)
            `)
            .order('name', { ascending: true });

        if (error) {
            // Error: Error fetching brands with count: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch brands',
                details: error.message 
            });
        }

        // Transform the data to include perfume count
        const brandsWithCount = brands.map(brand => ({
            ...brand,
            perfume_count: brand.perfumes[0]?.count || 0,
            perfumes: undefined // Remove the nested perfumes object
        }));

        res.json(brandsWithCount);

    } catch (error) {
        // Error: Server error: - logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new brand (for admin use)
const createBrand = async (req, res) => {
    try {
        const { name, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        // Check if brand already exists
        const existingBrand = await db.collection('brands').where('name', '==', name.trim()).limit(1).get();
        if (!existingBrand.empty) {
            return res.status(409).json({ error: 'Brand already exists' });
        }

        const brandData = {
            name: name.trim(),
            logo_url,
            created_at: new Date(),
            updated_at: new Date()
        };

        const docRef = await db.collection('brands').add(brandData);
        const brand = { id: docRef.id, ...brandData };

        // Log activity
        await logActivity({
            entityType: 'brand',
            entityId: brand.id,
            entityName: brand.name,
            actionType: 'create',
            details: {
                logo_url: brand.logo_url
            },
            req
        });

        res.status(201).json(brand);

    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update brand (for admin use)
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Get old brand data for logging
        const docRef = db.collection('brands').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        const oldBrand = { id: doc.id, ...doc.data() };

        // Check if new name conflicts with existing brand
        if (updates.name && updates.name !== oldBrand.name) {
            const existingBrand = await db.collection('brands').where('name', '==', updates.name.trim()).limit(1).get();
            if (!existingBrand.empty) {
                return res.status(409).json({ error: 'Brand name already exists' });
            }
        }

        const updateData = {
            ...updates,
            updated_at: new Date()
        };

        await docRef.update(updateData);

        // Get updated brand
        const updatedDoc = await docRef.get();
        const brand = { id: updatedDoc.id, ...updatedDoc.data() };

        // Log activity
        await logActivity({
            entityType: 'brand',
            entityId: brand.id,
            entityName: brand.name,
            actionType: 'update',
            details: {
                old: oldBrand,
                new: brand,
                changes: updates
            },
            req
        });

        res.json(brand);

    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete brand (for admin use)
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        // Get brand data before deletion for logging
        const docRef = db.collection('brands').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        const brandToDelete = { id: doc.id, ...doc.data() };

        await docRef.delete();

        // Log activity
        await logActivity({
            entityType: 'brand',
            entityId: brandToDelete.id,
            entityName: brandToDelete.name,
            actionType: 'delete',
            details: {
                deleted_brand: brandToDelete
            },
            req
        });

        res.status(204).send();

    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllBrands,
    getBrandById,
    getBrandByName,
    getBrandsWithCount,
    createBrand,
    updateBrand,
    deleteBrand
};
