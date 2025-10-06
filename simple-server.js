const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase configuration missing!');
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
    console.error('Copy from backend/.env.example and configure your Supabase credentials');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.get('/api/v2/perfumes', async (req, res) => {
    try {
        const { search, brand, gender, category, page = 1, limit = 50 } = req.query;

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

        // Apply pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query = query
            .range(offset, offset + parseInt(limit) - 1)
            .order('reference', { ascending: true });

        const { data: perfumes, error, count } = await query;

        if (error) {
            console.error('Error fetching perfumes:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch perfumes',
                details: error.message
            });
        }

        res.json({
            success: true,
            data: perfumes || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / parseInt(limit))
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/api/v2/brands', async (req, res) => {
    try {
        const { data: brands, error, count } = await supabase
            .from('brands')
            .select('*', { count: 'exact' })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching brands:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch brands',
                details: error.message
            });
        }

        res.json({
            success: true,
            data: brands || [],
            total: count || 0
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/api/v2/photos/stats', async (req, res) => {
    try {
        const [brandsResult, perfumesResult, logosResult, imagesResult] = await Promise.all([
            supabase.from('brands').select('*', { count: 'exact', head: true }),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }),
            supabase.from('brands').select('*', { count: 'exact', head: true }).not('logo_url', 'is', null),
            supabase.from('perfumes').select('*', { count: 'exact', head: true }).not('image_url', 'is', null)
        ]);

        res.json({
            success: true,
            data: {
                totalBrands: brandsResult.count || 0,
                totalPerfumes: perfumesResult.count || 0,
                brandsWithPhotos: logosResult.count || 0,
                perfumesWithPhotos: imagesResult.count || 0
            }
        });

    } catch (error) {
        console.error('Error fetching photo stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/api/v2/photos/brands', async (req, res) => {
    try {
        const { data: brands, error } = await supabase
            .from('brands')
            .select(`
                *,
                perfumes (count)
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching brands with count:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch brands',
                details: error.message
            });
        }

        // Transform the data to include perfume count
        const brandsWithCount = brands.map(brand => ({
            ...brand,
            perfumeCount: brand.perfumes?.[0]?.count || 0,
            perfumes: undefined // Remove the nested perfumes object
        }));

        res.json({
            success: true,
            data: brandsWithCount,
            total: brandsWithCount.length
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Eden Parfum API with Supabase is running',
        database: 'Supabase'
    });
});

// Catch all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

app.listen(PORT, async () => {
    console.log(`🚀 Eden Parfum API server running on http://localhost:${PORT}`);
    console.log(`🗄️  Using Supabase database`);

    // Test database connection
    try {
        const { count, error } = await supabase.from('perfumes').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Database connection failed:', error.message);
        } else {
            console.log(`📊 Connected to Supabase - found ${count} perfumes in database`);
        }
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
    }
});