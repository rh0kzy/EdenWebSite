# Deploying the Simple API Server to Render

## Steps to Deploy

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `rh0kzy/EdenWebSite`
   - Set the root directory to: `/` (root of the repo)

3. **Configure the Service**:
   - **Name**: `eden-parfum-simple-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run simple-api`
   - **Plan**: Free

4. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: `https://ztofzphjvcsuqsjglluk.supabase.co`
   - `SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTY5MTMsImV4cCI6MjA3Mzc5MjkxM30.hMLOsqNXn9s5n2Mj_32jLxCdVv_BYqzTmXgub05_Wu8`
   - `PORT`: `10000`

5. **Deploy**: Click "Create Web Service"

6. **Update Netlify Configuration**:
   - Once deployed, Render will give you a URL like: `https://eden-parfum-simple-api.onrender.com`
   - Update the `netlify.toml` file to use this URL instead of the placeholder
   - Redeploy your Netlify site

## Testing

After deployment, test the API:
- Health check: `https://your-render-url.onrender.com/health`
- Perfumes: `https://your-render-url.onrender.com/api/v2/perfumes?page=1&limit=5`

The frontend should now show all 506 perfumes instead of just 20!