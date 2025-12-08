const { supabase } = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

// Get all brands with optional filtering
const getAllBrands = async (req, res) => {
    try {
        const { search, limit = 100, page = 1 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = supabase
            .from('brands')
            .select('*', { count: 'exact' });

        // Apply search filter
        if (search && search !== '') {
            query = query.ilike('name', `%${search}%`);
        }

        // Apply sorting and pagination
        query = query
            .order('name', { ascending: true })
            .range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        res.json({
            data: data || [],
            total: count || 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil((count || 0) / parseInt(limit))
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

        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        res.json({ data });

    } catch (error) {
        console.error('Error fetching brand by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new brand (admin)
const createBrand = async (req, res) => {
    try {
        const brandData = req.body;

        const { data, error } = await supabase
            .from('brands')
            .insert([brandData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        await logActivity('brand_created', { brand_id: data.id });

        res.status(201).json({ data });

    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update brand (admin)
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const brandData = req.body;

        const { data, error } = await supabase
            .from('brands')
            .update(brandData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        await logActivity('brand_updated', { brand_id: id });

        res.json({ data });

    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete brand (admin)
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        await logActivity('brand_deleted', { brand_id: id });

        res.json({ message: 'Brand deleted successfully' });

    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
