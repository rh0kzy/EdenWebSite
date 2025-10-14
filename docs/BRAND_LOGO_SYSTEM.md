# 🎨 Dynamic Brand Logo System

## Problem Fixed
Previously, when adding a new brand with a logo, the logo wouldn't appear because it wasn't in the hardcoded `brandLogos` map in `fragranceData.js`.

## Solution
The system now automatically loads brand logos from the database via the API, with a fallback to the static map.

## How It Works

### 1. Priority System
```
1. Database (logo_url from API) - HIGHEST PRIORITY
2. Static Map (fragranceData.js) - FALLBACK
3. null (no logo found)
```

### 2. Automatic Loading
When the page loads:
1. `fragranceData.js` initializes
2. Calls `loadBrandLogosFromAPI()`
3. Fetches all brands from `/api/v2/brands`
4. Stores logos in `dynamicBrandLogos` object
5. Triggers `brandLogosLoaded` event
6. Catalog refreshes to show new logos

### 3. Real-Time Updates
- Catalog listens for `brandLogosLoaded` event
- Automatically refreshes display when logos load
- No page reload required

## Files Modified

### 1. `frontend/js/fragranceData.js`

**Added:**
- `dynamicBrandLogos` object - Stores API-loaded logos
- `brandsLoaded` flag - Prevents duplicate loading
- `loadBrandLogosFromAPI()` method - Loads logos from database
- Enhanced `getBrandLogo()` - Checks dynamic logos first

**Changes:**
```javascript
// Before
getBrandLogo(brand) {
    return this.brandLogos[brand] || null;
}

// After
getBrandLogo(brand) {
    // Priority: Dynamic (API) > Static (hardcoded)
    if (this.dynamicBrandLogos[brand]) {
        return this.dynamicBrandLogos[brand];
    }
    return this.brandLogos[brand] || null;
}
```

### 2. `frontend/js/catalog.js`

**Added:**
- Event listener for `brandLogosLoaded`
- Automatic display refresh when logos load

```javascript
window.addEventListener('brandLogosLoaded', (event) => {
    console.log('🎨 Brand logos updated, refreshing display...');
    this.displayPerfumes();
});
```

### 3. `frontend/js/brandLogoDetection.js` (NEW)

Utility module for advanced logo detection:
- `detectBrandLogo()` - Detect logo from multiple sources
- `generatePossibleLogoPaths()` - Try common filename patterns
- `batchLoadBrandLogos()` - Load logos for multiple brands
- `preloadBrandLogo()` - Preload image for caching
- Logo cache system for performance

## Usage

### Adding a New Brand

#### Option 1: With Logo URL (Recommended)
1. Go to Admin > Manage Brands
2. Click "Add Brand"
3. Enter brand name: `"Tom Ford"`
4. Enter logo URL: `"photos/tom-ford.png"`
5. Click "Add Brand"
6. ✅ Logo appears immediately in catalog

#### Option 2: Without Logo URL
1. Upload logo to `frontend/photos/` folder
2. Name it: `BrandName.png` (exact match) or `brandname.png` (lowercase)
3. Add brand in admin (leave logo_url empty)
4. System tries to auto-detect from photos folder
5. ✅ Logo appears if file matches common patterns

### Logo File Naming Patterns

The system tries these patterns in order:
```
BrandName.png
BrandName.jpg
brandname.png
Brand_Name.png
Brand-Name.png
BrandName_logo.png
BrandName-logo.png
```

Supported extensions: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.avif`

## API Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dior",
      "logo_url": "photos/dior.png",
      "perfume_count": 50
    },
    {
      "id": 2,
      "name": "Chanel",
      "logo_url": "photos/chanel.png",
      "perfume_count": 45
    }
  ]
}
```

## Events

### `brandLogosLoaded`
Triggered when brand logos are loaded from API.

**Event Detail:**
```javascript
{
  count: 45,  // Number of logos loaded
  brands: [...]  // Array of brand objects
}
```

**Listen for it:**
```javascript
window.addEventListener('brandLogosLoaded', (event) => {
    console.log(`${event.detail.count} logos loaded`);
    // Refresh your UI
});
```

## Performance

### Caching Strategy
1. **API Call:** Made once on page load
2. **Memory Cache:** Logos stored in `dynamicBrandLogos`
3. **Browser Cache:** Images cached by browser
4. **No Reload:** Events trigger UI updates without page reload

### Optimization
- Single API call for all brands
- Async loading (non-blocking)
- Event-driven updates (efficient)
- Fallback to static map (reliable)

## Testing

### Test 1: Add Brand with Logo
1. Add new brand with logo URL
2. Open catalog
3. ✅ Logo should appear immediately

### Test 2: Refresh After Adding
1. Add brand with logo
2. Refresh catalog page
3. ✅ Logo should still appear

### Test 3: Brand Without Logo
1. Add brand without logo URL
2. Open catalog
3. ✅ Brand name appears without logo (graceful degradation)

### Test 4: Invalid Logo URL
1. Add brand with invalid logo URL
2. Open catalog
3. ✅ Fallback to no logo (no broken images)

## Console Messages

### Success
```
✅ Loaded 45 brand logos from database
🎨 Brand logos updated, refreshing display...
```

### Warnings
```
⚠️ Could not load brand logos from API
⚠️ No logo found for "New Brand"
```

## Troubleshooting

### Logo Not Appearing

**Check 1: Database**
- Verify `logo_url` is set in database
- Check URL is correct
- Test URL directly in browser

**Check 2: File Exists**
```bash
# Check if file exists
ls frontend/photos/brandname.png
```

**Check 3: Console**
- Open browser console (F12)
- Look for error messages
- Check network tab for 404s

**Check 4: Cache**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)

### Logo URL Format

**✅ Correct:**
```
photos/dior.png
photos/chanel.svg
/photos/gucci.jpg
```

**❌ Incorrect:**
```
C:\Users\...\photos\dior.png  (absolute path)
file:///photos/dior.png  (file protocol)
https://example.com/logo.png  (external URL without CORS)
```

## Future Enhancements

### Planned
- [ ] Automatic logo scraping from brand websites
- [ ] Image optimization (resize, compress)
- [ ] CDN integration
- [ ] Lazy loading for logos
- [ ] Logo placeholder/skeleton

### Possible
- [ ] AI-generated brand logos
- [ ] Multiple logo variants (dark/light mode)
- [ ] Logo color extraction for themes
- [ ] Logo format conversion (SVG preferred)

## Migration Notes

### For Existing Brands
No migration needed! The system:
1. Loads from database first (dynamic)
2. Falls back to static map (existing brands)
3. Works with both old and new brands

### Adding Database Logo URLs
Update existing brands:
```sql
UPDATE brands 
SET logo_url = 'photos/brandname.png' 
WHERE name = 'Brand Name';
```

## Best Practices

### Logo Files
- **Format:** SVG (scalable) > PNG (transparent) > JPG
- **Size:** Max 200KB per logo
- **Dimensions:** 200x200px to 400x400px
- **Background:** Transparent (PNG/SVG)
- **Location:** `frontend/photos/` directory

### Naming Convention
- Use exact brand name from database
- Keep consistent (spaces, hyphens, underscores)
- Example: `Giorgio Armani.png` not `armani.png`

### Database Storage
- Store relative path: `photos/logo.png`
- Not absolute path or URL
- Keep consistent with other images

## Support

For issues:
1. Check browser console
2. Verify API response
3. Test logo URL directly
4. Check file permissions
5. Clear cache and retry

---

**Status:** ✅ FULLY IMPLEMENTED AND TESTED
