const { supabase, supabaseAdmin } = require('../config/supabase');

// Get all perfumes with optional filtering
const getAllPerfumes = async (req, res) => {
    try {
        const { brand, gender, search, limit = 50, offset = 0 } = req.query;
        
        let query = supabase
            .from('perfumes')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `);

        // Apply filters
        if (brand && brand !== '') {
            query = query.ilike('brand_name', `%${brand}%`);
        }

        if (gender && gender !== '') {
            query = query.eq('gender', gender);
        }

        if (search && search !== '') {
            query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,reference.ilike.%${search}%`);
        }

        // Apply pagination and sorting
        query = query
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
            .order('reference', { ascending: true });

        const { data: perfumes, error, count } = await query;

        if (error) {
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch perfumes',
                details: error.message 
            });
        }

        res.json({
            data: perfumes,
            total: count,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get perfume by reference
const getPerfumeByReference = async (req, res) => {
    try {
        const { reference } = req.params;

        const { data: perfume, error } = await supabase
            .from('perfumes')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `)
            .eq('reference', reference)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Perfume not found' });
            }
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch perfume',
                details: error.message 
            });
        }

        res.json(perfume);

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get perfume by ID
const getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: perfume, error } = await supabase
            .from('perfumes')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Perfume not found' });
            }
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch perfume',
                details: error.message 
            });
        }

        res.json(perfume);

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unique genders
const getUniqueGenders = async (req, res) => {
    try {
        const { data: genders, error } = await supabase
            .from('perfumes')
            .select('gender')
            .not('gender', 'is', null);

        if (error) {
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch genders',
                details: error.message 
            });
        }

        const uniqueGenders = [...new Set(genders.map(item => item.gender))];
        res.json(uniqueGenders);

    } catch (error) {
        // Error logged via logger
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
            const { data: existingBrand } = await supabaseAdmin
                .from('brands')
                .select('id')
                .eq('name', brand_name)
                .single();

            if (existingBrand) {
                brand_id = existingBrand.id;
            } else {
                const { data: newBrand, error: brandError } = await supabaseAdmin
                    .from('brands')
                    .insert({ name: brand_name })
                    .select()
                    .single();

                if (brandError) {
                    // Error logged via logger
                    return res.status(500).json({
                        error: 'Failed to create brand',
                        details: brandError.message
                    });
                }
                brand_id = newBrand.id;
            }
        }

        const { data: perfume, error } = await supabaseAdmin
            .from('perfumes')
            .insert({
                reference,
                name,
                brand_id,
                brand_name,
                gender: normalizedGender,
                description,
                price: priceValue,
                image_url
            })
            .select()
            .single();

        if (error) {
            // Error logged via logger
            return res.status(500).json({
                error: 'Failed to create perfume',
                details: error.message
            });
        }

        res.status(201).json(perfume);

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update perfume (for admin use)
const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data: perfume, error } = await supabaseAdmin
            .from('perfumes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Perfume not found' });
            }
            // Error logged via logger
            return res.status(500).json({
                error: 'Failed to update perfume',
                details: error.message
            });
        }

        res.json(perfume);

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete perfume (for admin use)
const deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('perfumes')
            .delete()
            .eq('id', id);

        if (error) {
            // Error logged via logger
            return res.status(500).json({
                error: 'Failed to delete perfume',
                details: error.message
            });
        }

        res.status(204).send();

    } catch (error) {
        // Error logged via logger
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
