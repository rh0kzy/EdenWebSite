const { supabase } = require('../config/supabase');

// Get perfumes with complete photo information
const getPerfumesWithPhotos = async (req, res) => {
    try {
        const { brand, gender, search, limit = 20, offset = 0 } = req.query;
        
        let query = supabase
            .from('perfumes')
            .select(`
                id,
                reference,
                name,
                gender,
                brand_name,
                image_url,
                price,
                description,
                is_available,
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

        // Apply pagination and ordering
        query = query
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
            .order('created_at', { ascending: false });

        const { data: perfumes, error, count } = await query;

        if (error) {
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch perfumes',
                details: error.message 
            });
        }

        // Transform data to include complete photo URLs
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const transformedPerfumes = perfumes.map(perfume => ({
            ...perfume,
            image_url: perfume.image_url ? `${baseUrl}/${perfume.image_url}` : null,
            brand_logo: perfume.brands?.logo_url ? `${baseUrl}/${perfume.brands.logo_url}` : null
        }));

        res.json({
            data: transformedPerfumes,
            total: count,
            page: Math.floor(offset / limit) + 1,
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
            has_images: transformedPerfumes.filter(p => p.image_url).length,
            has_logos: transformedPerfumes.filter(p => p.brand_logo).length
        });

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get featured perfumes (with images)
const getFeaturedPerfumes = async (req, res) => {
    try {
        const { data: perfumes, error } = await supabase
            .from('perfumes')
            .select(`
                id,
                reference,
                name,
                gender,
                brand_name,
                image_url,
                brands (
                    name,
                    logo_url
                )
            `)
            .not('image_url', 'is', null)
            .limit(12)
            .order('created_at', { ascending: false });

        if (error) {
            // Error logged via logger
            return res.status(500).json({ 
                error: 'Failed to fetch featured perfumes',
                details: error.message 
            });
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const transformedPerfumes = perfumes.map(perfume => ({
            ...perfume,
            image_url: `${baseUrl}/${perfume.image_url}`,
            brand_logo: perfume.brands?.logo_url ? `${baseUrl}/${perfume.brands.logo_url}` : null
        }));

        res.json({
            data: transformedPerfumes,
            total: transformedPerfumes.length
        });

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get photo statistics
const getPhotoStats = async (req, res) => {
    try {
        const [brandsResult, perfumesResult, logosResult, imagesResult] = await Promise.all([
            supabase.from('brands').select('*', { count: 'exact', head: true }),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }),
            supabase.from('brands').select('*', { count: 'exact', head: true }).not('logo_url', 'is', null),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }).not('image_url', 'is', null)
        ]);

        res.json({
            total_brands: brandsResult.count,
            total_perfumes: perfumesResult.count,
            brands_with_logos: logosResult.count,
            perfumes_with_images: imagesResult.count,
            logo_coverage: `${((logosResult.count / brandsResult.count) * 100).toFixed(1)}%`,
            image_coverage: `${((imagesResult.count / perfumesResult.count) * 100).toFixed(1)}%`
        });

    } catch (error) {
        // Error logged via logger
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getPerfumesWithPhotos,
    getFeaturedPerfumes,
    getPhotoStats
};
