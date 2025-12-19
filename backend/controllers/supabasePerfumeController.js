const { supabase } = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

// Get all perfumes with optional filtering
const getAllPerfumes = async (req, res) => {
    try {
        const { brand, gender, search, limit = 50, page = 1 } = req.query;
        const safeLimit = Math.min(parseInt(limit), 500);
        const offset = (parseInt(page) - 1) * safeLimit;

        let query = supabase
            .from('perfumes')
            .select(`
                *,
                brands (
                    id,
                    name,
                    logo_url
                )
            `, { count: 'exact' });

        // Apply filters
        if (brand && brand !== '') {
            query = query.ilike('brand_name', `%${brand}%`);
        }

        if (gender && gender !== '') {
            query = query.eq('gender', gender);
        }

        // Apply search filter
        if (search && search !== '') {
            query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,reference.ilike.%${search}%`);
        }

        // Apply sorting and pagination
        query = query
            .order('reference', { ascending: true })
            .range(offset, offset + safeLimit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.json({
            data: data || [],
            total: count || 0,
            page: parseInt(page),
            limit: safeLimit,
            totalPages: Math.ceil((count || 0) / safeLimit)
        });

    } catch (error) {
        console.error('Error fetching perfumes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get perfume by reference
const getPerfumeByReference = async (req, res) => {
    try {
        const { reference } = req.params;

        const { data, error } = await supabase
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

        if (error || !data) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        res.json({ data });

    } catch (error) {
        console.error('Error fetching perfume by reference:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get perfume by ID
const getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
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

        if (error || !data) {
            return res.status(404).json({ error: 'Perfume not found' });
        }

        res.json({ data });

    } catch (error) {
        console.error('Error fetching perfume by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get unique genders
const getUniqueGenders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('perfumes')
            .select('gender');

        if (error) {
            throw error;
        }

        const genders = [...new Set(data.map(p => p.gender))].filter(Boolean);

        res.json({ data: genders });

    } catch (error) {
        console.error('Error fetching genders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new perfume (admin)
const createPerfume = async (req, res) => {
    try {
        const perfumeData = req.body;

        const { data, error } = await supabase
            .from('perfumes')
            .insert([perfumeData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        await logActivity('perfume_created', { perfume_id: data.id });

        res.status(201).json({ data });

    } catch (error) {
        console.error('Error creating perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update perfume (admin)
const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const perfumeData = req.body;

        const { data, error } = await supabase
            .from('perfumes')
            .update(perfumeData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        await logActivity('perfume_updated', { perfume_id: id });

        res.json({ data });

    } catch (error) {
        console.error('Error updating perfume:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete perfume (admin)
const deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('perfumes')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logActivity('perfume_deleted', { perfume_id: id });

        res.json({ message: 'Perfume deleted successfully' });

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
