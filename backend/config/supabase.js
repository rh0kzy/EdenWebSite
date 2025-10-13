const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL and anon key must be provided in environment variables');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
    process.exit(1);
}

// Create Supabase client for public operations (with RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for admin operations (bypasses RLS)
const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : createClient(supabaseUrl, supabaseAnonKey); // Fallback for development

module.exports = { supabase, supabaseAdmin };