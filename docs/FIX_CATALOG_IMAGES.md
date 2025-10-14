# 🔧 Fix: Images not appearing in catalog

## Problem
When adding a perfume with a custom image, the image appeared in the admin management page but not in the catalog page.

## Root Cause
The API client (`apiClient.js`) was converting the `image_url` field to `image` only in the `convertToLegacyFormat` function. The catalog page was looking for `perfume.image_url` but it didn't exist in the converted data.

## Solution

### 1. Modified `frontend/js/apiClient.js`

**Function:** `convertToLegacyFormat()`

**Changes:**
- Added `image_url` field in addition to the legacy `image` field
- Both fields now contain the same value for compatibility
- Priority order: `perfume.image_url` → `perfume.photo_url` → fallback

**Before:**
```javascript
image: perfume.photo_url || `/photos/${perfume.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
```

**After:**
```javascript
const imageUrl = perfume.image_url || perfume.photo_url || `/photos/${perfume.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;

return {
    // ... other fields
    image: imageUrl,      // Legacy field
    image_url: imageUrl,  // Modern field - for compatibility
    // ... other fields
};
```

### 2. Modified `frontend/js/catalog.js`

**Function:** `createPerfumeItem(perfume)`

**Changes:**
- Added fallback to check `perfume.image` if `perfume.image_url` is not found
- Image priority order:
  1. `fragranceImage` (from fragranceData.js mapping)
  2. `perfume.image_url` (from database)
  3. `perfume.image` (legacy field)
  4. `'photos/placeholder.svg'` (fallback)

**Before:**
```javascript
let imageUrl = 'photos/placeholder.svg';
if (fragranceImage) {
    imageUrl = fragranceImage;
} else if (perfume.image_url) {
    imageUrl = perfume.image_url;
}
```

**After:**
```javascript
let imageUrl = 'photos/placeholder.svg';
if (fragranceImage) {
    imageUrl = fragranceImage;
} else if (perfume.image_url) {
    imageUrl = perfume.image_url;
} else if (perfume.image) {
    imageUrl = perfume.image;
}
```

## Testing

1. Open `http://localhost:3000/catalog.html`
2. Verify that all perfumes display their images correctly
3. Check that newly added perfumes with custom images appear properly

## Impact

- ✅ Images now display correctly in both admin and catalog pages
- ✅ Backward compatibility maintained with legacy `image` field
- ✅ No database migration required
- ✅ Works with both mapped images (fragranceData.js) and custom images

## Files Modified

1. `frontend/js/apiClient.js` - convertToLegacyFormat() function
2. `frontend/js/catalog.js` - createPerfumeItem() function
