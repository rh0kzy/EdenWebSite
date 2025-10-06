# NETLIFY DEPLOYMENT FIX GUIDE

## The Issue
The catalog shows only 40 perfumes instead of 506 when deployed on Netlify. This is due to:
1. API endpoint configuration issues
2. Environment variable problems 
3. Function deployment issues

## Fixed Files
✅ **apiClient.js** - Fixed URL construction for Netlify Functions
✅ **catalog.html** - Added debugging and fix scripts
✅ **netlify-fixes.js** - Added comprehensive Netlify debugging
✅ **netlify-debug.js** - Added detailed error logging

## Deployment Steps

### 1. Environment Variables on Netlify
Make sure these are set in your Netlify dashboard:

```
SUPABASE_URL=https://ztofzphjvcsuqsjglluk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b2Z6cGhqdmNzdXFzamdsbHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTY5MTMsImV4cCI6MjA3Mzc5MjkxM30.hMLOsqNXn9s5n2Mj_32jLxCdVv_BYqzTmXgub05_Wu8
```

### 2. Deploy These Files
- `frontend/js/apiClient.js` (updated)
- `frontend/catalog.html` (updated)  
- `frontend/netlify-fixes.js` (new)
- `frontend/netlify-debug.js` (new)
- `netlify/functions/perfumes.js` (verified)
- `netlify.toml` (verified)

### 3. After Deployment - Debug Steps

1. Open your Netlify site: `https://your-site.netlify.app/catalog.html`

2. Open browser DevTools Console

3. You should see detailed logging:
   ```
   🔧 Applying Netlify fixes...
   🔍 NETLIFY DEBUGGING STARTED
   🌐 Current location: https://your-site.netlify.app/catalog.html
   🚀 Is Netlify? true
   🔧 edenAPI available: true
   📍 API Base URL: /.netlify/functions
   ```

4. Test the function manually:
   ```javascript
   // Run this in console
   testNetlifyFunction('perfumes')
   ```

5. Check for API calls:
   ```javascript
   // Run this in console
   edenAPI.getPerfumes({limit: 506})
   ```

### 4. Common Issues & Solutions

**Issue**: "Function not found" (404)
**Solution**: Redeploy, ensure `netlify/functions/` directory is included

**Issue**: "Supabase credentials missing" (500)
**Solution**: Set environment variables in Netlify dashboard

**Issue**: CORS errors
**Solution**: Functions already have CORS headers, check preflight requests

**Issue**: Timeout errors
**Solution**: Increase function timeout in Netlify settings

### 5. Expected Results

✅ Console shows: "API SUCCESS!"
✅ Console shows: "Data count: 506" (or close to it)
✅ Page displays hundreds of perfume cards
✅ No "offline data" fallback messages

### 6. Remove Debug Scripts (After Fix)

Once working, remove these lines from `catalog.html`:
```html
<script src="netlify-fixes.js"></script>
<script src="netlify-debug.js"></script>
```

## Technical Details

### URL Construction Fix
**Before**: `new URL('/.netlify/functions/perfumes')` → Failed (Invalid URL)
**After**: `new URL('https://site.netlify.app/.netlify/functions/perfumes')` → Works

### API Flow
1. `edenAPI.getPerfumes()` called
2. Constructs: `https://site.netlify.app/.netlify/functions/perfumes?limit=506`
3. Netlify Function executes
4. Queries Supabase for all perfumes
5. Returns JSON with 506 perfumes
6. Frontend displays all cards

## Verification

After deployment, you should see in console:
```
✅ API SUCCESS!
📊 Response: {success: true, data: Array(506), total: 506}
📈 Data count: 506
🎉 EXCELLENT: Full catalog is loading!
```

If you see "⚠️ Still using offline data (40 perfumes)", the API call failed and needs debugging.