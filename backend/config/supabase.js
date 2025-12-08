const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ FATAL: Missing Supabase credentials in .env file');
    console.error('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓ Set' : '✗ Missing');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('✅ Supabase client initialized successfully');

module.exports = { supabase };