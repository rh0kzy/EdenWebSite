# Getting your Supabase API Keys

## Steps to get your Supabase credentials:

1. **Go to your Supabase Dashboard**: https://app.supabase.com/
2. **Select your project**: ztofzphjvcsuqsjglluk
3. **Go to Settings** (gear icon in the sidebar)
4. **Click on "API"** in the settings menu
5. **Copy the following values**:
   - **Project URL**: `https://ztofzphjvcsuqsjglluk.supabase.co`
   - **anon/public key**: This is your `SUPABASE_ANON_KEY`
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY`

## Update your .env file:

Replace these placeholder values in `/backend/.env`:
```
SUPABASE_ANON_KEY=your_actual_anon_key_from_dashboard
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_from_dashboard
```

## Next: Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the content from `/database/schema.sql`
3. Run the SQL to create your tables

## Then run the migration:

```bash
cd backend
node ../database/migrate.js
```