const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function initializeSupabase() {
    if (supabase) {
        return supabase;
    }

    // Supabase URL is public and not sensitive
    const supabaseUrl = process.env.SUPABASE_URL || 'https://ztofzphjvcsuqsjglluk.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials:', { 
            hasUrl: !!supabaseUrl, 
            hasKey: !!supabaseKey 
        });
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
