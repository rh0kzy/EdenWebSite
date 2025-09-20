const { supabase } = require('../config/supabase');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const { limit = 100, offset = 0 } = req.query;

        const { data: brands, error, count } = await supabase
            .from('brands')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            // Error fetching brands - logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch brands',
                details: error.message 
            });
        }

        res.json({
            data: brands,
            total: count,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        // Error: Server error: - logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get brand by ID
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: brand, error } = await supabase
            .from('brands')
            .select(`
                *,
                perfumes (
                    id,
                    reference,
                    name,
                    gender,
                    price,
                    is_available
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Brand not found' });
            }
            // Error: Error fetching brand: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch brand',
                details: error.message 
            });
        }

        res.json(brand);

    } catch (error) {
        // Error: Server error: - logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get brand by name
const getBrandByName = async (req, res) => {
    try {
        const { name } = req.params;

        const { data: brand, error } = await supabase
            .from('brands')
            .select(`
                *,
                perfumes (
                    id,
                    reference,
                    name,
                    gender,
                    price,
                    is_available
                )
            `)
            .ilike('name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Brand not found' });
            }
            // Error: Error fetching brand: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch brand',
                details: error.message 
            });
        }

        res.json(brand);

    } catch (error) {
        // Error: Server error: - logged via logger
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

        const { data: brand, error } = await supabase
            .from('brands')
            .insert({
                name: name.trim(),
                logo_url
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'Brand already exists' });
            }
            // Error: Error creating brand: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to create brand',
                details: error.message 
            });
        }

        res.status(201).json(brand);

    } catch (error) {
        // Error: Server error: - logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update brand (for admin use)
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data: brand, error } = await supabase
            .from('brands')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Brand not found' });
            }
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'Brand name already exists' });
            }
            // Error: Error updating brand: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to update brand',
                details: error.message 
            });
        }

        res.json(brand);

    } catch (error) {
        // Error: Server error: - logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete brand (for admin use)
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) {
            // Error: Error deleting brand: - logged via logger
            return res.status(500).json({ 
                error: 'Failed to delete brand',
                details: error.message 
            });
        }

        res.status(204).send();

    } catch (error) {
        // Error: Server error: - logged via logger
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
