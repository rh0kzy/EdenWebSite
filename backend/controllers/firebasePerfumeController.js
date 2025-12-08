const { db } = require('../config/firebase');
const { logActivity } = require('../utils/activityLogger');

// Get all perfumes with optional filtering
const getAllPerfumes = async (req, res) => {
    try {
        const { brand, gender, search, limit = 50, offset = 0 } = req.query;

        let query = db.collection('perfumes');

        // Apply filters
        if (brand && brand !== '') {
            query = query.where('brand_name', '>=', brand.toLowerCase())
                         .where('brand_name', '<=', brand.toLowerCase() + '\uf8ff');
        }

        if (gender && gender !== '') {
            query = query.where('gender', '==', gender);
        }

        // Apply sorting and pagination
        query = query.orderBy('reference').limit(parseInt(limit)).offset(parseInt(offset));

        const snapshot = await query.get();
        const perfumes = [];

        // OPTIMIZATION: Batch brand fetches to reduce reads
        const brandIds = new Set();
        const perfumeDataList = [];
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            perfumeDataList.push({ id: doc.id, ...data });
            if (data.brand_id) {
                brandIds.add(data.brand_id);
            }
        });

        // Fetch all unique brands in one go
        const brandCache = {};
        if (brandIds.size > 0) {
            const brandPromises = Array.from(brandIds).map(async (brandId) => {
                const brandDoc = await db.collection('brands').doc(brandId).get();
                if (brandDoc.exists) {
                    brandCache[brandId] = { id: brandDoc.id, ...brandDoc.data() };
                }
            });
            await Promise.all(brandPromises);
        }

        // Assemble perfumes with cached brand data
        perfumeDataList.forEach(perfumeData => {
            perfumes.push({
                ...perfumeData,
                brands: perfumeData.brand_id ? brandCache[perfumeData.brand_id] : null
            });
        });

        // Apply search filter if provided (since Firestore doesn't support OR queries easily)
        let filteredPerfumes = perfumes;
        if (search && search !== '') {
            const searchLower = search.toLowerCase();
            filteredPerfumes = perfumes.filter(p =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.brand_name?.toLowerCase().includes(searchLower) ||
                p.reference?.toLowerCase().includes(searchLower)
            );
        }

        // IMPORTANT: Use estimated count to avoid extra query
        // For accurate count, we'd need to fetch all docs which wastes quota
        const estimatedTotal = 506; // Update this manually or use a counter document

        res.json({
            data: filteredPerfumes,
            total: estimatedTotal,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit),
            totalPages: Math.ceil(estimatedTotal / limit)
        });

    } catch (error) {
        console.error('Error fetching perfumes:', error);
        
        // Check if it's a quota error
        if (error.code === 8 || error.message?.includes('Quota exceeded')) {
            res.status(429).json({ 
                error: 'Database quota exceeded. Please try again later.',
                code: 'QUOTA_EXCEEDED'
            });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// Get perfume by reference
const getPerfumeByReference = async (req, res) => {
    try {
        const { reference } = req.params;

        const snapshot = await db.collection('perfumes').where('reference', '==', reference).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        const doc = snapshot.docs[0];
        const perfumeData = doc.data();
        let brandData = null;

        if (perfumeData.brand_id) {
            const brandDoc = await db.collection('brands').doc(perfumeData.brand_id).get();
            if (brandDoc.exists) {
                brandData = { id: brandDoc.id, ...brandDoc.data() };
            }
        }

        const perfume = {
            id: doc.id,
            ...perfumeData,
            brands: brandData
        };

        res.json(perfume);

    } catch (error) {
        console.error('Error fetching perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get perfume by ID
const getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await db.collection('perfumes').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        const perfumeData = doc.data();
        let brandData = null;

        if (perfumeData.brand_id) {
            const brandDoc = await db.collection('brands').doc(perfumeData.brand_id).get();
            if (brandDoc.exists) {
                brandData = { id: brandDoc.id, ...brandDoc.data() };
            }
        }

        const perfume = {
            id: doc.id,
            ...perfumeData,
            brands: brandData
        };

        res.json(perfume);

    } catch (error) {
        console.error('Error fetching perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unique genders
const getUniqueGenders = async (req, res) => {
    try {
        const snapshot = await db.collection('perfumes').select('gender').get();
        const genders = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.gender) {
                genders.push(data.gender);
            }
        });

        let uniqueGenders = [...new Set(genders)];

        // Normalize display: Show "Unisex" instead of "Mixte" for better international compatibility
        uniqueGenders = uniqueGenders.map(g => g === 'Mixte' ? 'Unisex' : g);

        res.json(uniqueGenders);

    } catch (error) {
        console.error('Error fetching genders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper: normalize and validate gender values to match DB constraints
const normalizeGender = (raw) => {
    if (raw === undefined || raw === null) return null;
    const str = String(raw).trim();
    if (!str) return null;
    const map = {
        men: 'Men',
        man: 'Men',
        male: 'Men',
        women: 'Women',
        woman: 'Women',
        female: 'Women',
        mixte: 'Mixte',
        "mix": 'Mixte',
        unisex: 'Mixte' // map 'unisex' to 'Mixte' for compatibility with current DB constraint
    };
    const key = str.toLowerCase();
    if (map[key]) return map[key];
    // If already in correct form (case-insensitive), normalize capitalization
    const cap = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const allowed = ['Men', 'Women', 'Mixte', 'Unisex'];
    if (allowed.includes(cap)) return cap === 'Unisex' ? 'Mixte' : cap; // normalize Unisex -> Mixte for compatibility
    return null;
};

// Create new perfume (for admin use)
const createPerfume = async (req, res) => {
    try {
        const { reference, name, brand_name, gender, description, price, image_url } = req.body;

        // Basic validation and normalization
        // Normalize gender to values accepted by the DB to avoid constraint violations
        const normalizedGender = normalizeGender(gender);
        if (gender && !normalizedGender) {
            return res.status(400).json({
                error: 'Invalid gender value',
                details: "Allowed values: Men, Women, Mixte (also accepts 'unisex', 'male', 'female')"
            });
        }

        // Validate price if provided
        let priceValue = null;
        if (price !== undefined && price !== null && price !== '') {
            priceValue = parseFloat(price);
            if (Number.isNaN(priceValue)) {
                return res.status(400).json({
                    error: 'Invalid price value',
                    details: 'Price must be a valid number'
                });
            }
        }

        // Check if brand exists, create if not
        let brand_id = null;
        if (brand_name) {
            const brandSnapshot = await db.collection('brands').where('name', '==', brand_name).limit(1).get();

            if (!brandSnapshot.empty) {
                brand_id = brandSnapshot.docs[0].id;
            } else {
                const newBrandRef = await db.collection('brands').add({
                    name: brand_name,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                brand_id = newBrandRef.id;
            }
        }

        const perfumeData = {
            reference,
            name,
            brand_id,
            brand_name,
            gender: normalizedGender,
            description,
            price: priceValue,
            image_url,
            is_available: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        const docRef = await db.collection('perfumes').add(perfumeData);
        const perfume = { id: docRef.id, ...perfumeData };

        // Log activity
        await logActivity({
            entityType: 'perfume',
            entityId: perfume.id,
            entityName: perfume.name,
            actionType: 'create',
            details: {
                reference: perfume.reference,
                brand_name: perfume.brand_name,
                gender: perfume.gender,
                price: perfume.price
            },
            req
        });

        res.status(201).json(perfume);

    } catch (error) {
        console.error('Error creating perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update perfume (for admin use)
const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Get old perfume data for logging
        const docRef = db.collection('perfumes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        const oldPerfume = { id: doc.id, ...doc.data() };

        // Prepare update data
        const updateData = {
            ...updates,
            updated_at: new Date()
        };

        // Handle brand creation if brand_name is provided and brand doesn't exist
        if (updates.brand_name && !updates.brand_id) {
            const brandSnapshot = await db.collection('brands').where('name', '==', updates.brand_name).limit(1).get();

            if (!brandSnapshot.empty) {
                updateData.brand_id = brandSnapshot.docs[0].id;
            } else {
                const newBrandRef = await db.collection('brands').add({
                    name: updates.brand_name,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                updateData.brand_id = newBrandRef.id;
            }
        }

        await docRef.update(updateData);

        // Get updated perfume
        const updatedDoc = await docRef.get();
        const perfume = { id: updatedDoc.id, ...updatedDoc.data() };

        // Log activity
        await logActivity({
            entityType: 'perfume',
            entityId: perfume.id,
            entityName: perfume.name,
            actionType: 'update',
            details: {
                old: oldPerfume,
                new: perfume,
                changes: updates
            },
            req
        });

        res.json(perfume);

    } catch (error) {
        console.error('Error updating perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete perfume (for admin use)
const deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;

        // Get perfume data before deletion for logging
        const docRef = db.collection('perfumes').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        const perfumeToDelete = { id: doc.id, ...doc.data() };

        await docRef.delete();

        // Log activity
        await logActivity({
            entityType: 'perfume',
            entityId: perfumeToDelete.id,
            entityName: perfumeToDelete.name,
            actionType: 'delete',
            details: {
                deleted_perfume: perfumeToDelete
            },
            req
        });

        res.status(204).send();

    } catch (error) {
        console.error('Error deleting perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllPerfumes,
    getPerfumeByReference,
    getPerfumeById,
    getUniqueGenders,
    createPerfume,
    updatePerfume,
    deletePerfume
};
