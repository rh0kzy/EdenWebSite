const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function initializeSupabase() {
    if (supabase) {
        return supabase;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials in environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });

    return supabase;
}

module.exports = { initializeSupabase };
