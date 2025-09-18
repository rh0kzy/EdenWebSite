// Supabase configuration for frontend
import { createClient } from '@supabase/supabase-js';

// These should match your Supabase project
const supabaseUrl = 'https://ztofzphjvcsuqsjglluk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTY5MTMsImV4cCI6MjA3Mzc5MjkxM30.hMLOsqNXn9s5n2Mj_32jLxCdVv_BYqzTmXgub05_Wu8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Perfume service functions
export const perfumeService = {
    // Get all perfumes with filtering
    async getAllPerfumes(filters = {}) {
        const { brand, gender, search, limit = 50, offset = 0 } = filters;
        
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

        if (brand) {
            query = query.ilike('brand_name', `%${brand}%`);
        }

        if (gender) {
            query = query.eq('gender', gender);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%,reference.ilike.%${search}%`);
        }

        query = query
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
            data,
            total: count,
            page: Math.floor(offset / limit) + 1,
            limit,
            totalPages: Math.ceil(count / limit)
        };
    },

    // Get perfume by reference
    async getPerfumeByReference(reference) {
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

        if (error) throw error;
        return data;
    },

    // Get unique genders
    async getUniqueGenders() {
        const { data, error } = await supabase
            .from('perfumes')
            .select('gender')
            .not('gender', 'is', null);

        if (error) throw error;
        
        return [...new Set(data.map(item => item.gender))];
    }
};

// Brand service functions
export const brandService = {
    // Get all brands
    async getAllBrands() {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Get brands with perfume count
    async getBrandsWithCount() {
        const { data, error } = await supabase
            .from('brands')
            .select(`
                *,
                perfumes (count)
            `)
            .order('name', { ascending: true });

        if (error) throw error;
        
        return data.map(brand => ({
            ...brand,
            perfume_count: brand.perfumes[0]?.count || 0,
            perfumes: undefined
        }));
    }
};