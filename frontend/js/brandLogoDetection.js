// Brand Logo Detection Utility
// Automatically detects and loads brand logos from various sources

/**
 * Detect brand logo from multiple sources
 * Priority: 1. Database (logo_url) 2. Photos directory 3. Fallback
 * @param {string} brandName - Brand name to find logo for
 * @param {string} databaseLogoUrl - Logo URL from database (if any)
 * @returns {Promise<string|null>} Logo URL or null
 */
export async function detectBrandLogo(brandName, databaseLogoUrl = null) {
    // Priority 1: Use database logo if available
    if (databaseLogoUrl) {
        const exists = await checkImageExists(databaseLogoUrl);
        if (exists) return databaseLogoUrl;
    }
    
    // Priority 2: Try common logo filenames in photos directory
    const possiblePaths = generatePossibleLogoPaths(brandName);
    
    for (const path of possiblePaths) {
        const exists = await checkImageExists(path);
        if (exists) {
            console.log(`✅ Found logo for "${brandName}": ${path}`);
            return path;
        }
    }
    
    console.log(`⚠️ No logo found for "${brandName}"`);
    return null;
}

/**
 * Generate possible logo file paths for a brand
 * @param {string} brandName - Brand name
 * @returns {Array<string>} Array of possible paths
 */
function generatePossibleLogoPaths(brandName) {
    const paths = [];
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.avif'];
    
    // Try exact name
    extensions.forEach(ext => {
        paths.push(`photos/${brandName}${ext}`);
    });
    
    // Try lowercase
    extensions.forEach(ext => {
        paths.push(`photos/${brandName.toLowerCase()}${ext}`);
    });
    
    // Try with spaces replaced by underscores
    const underscored = brandName.replace(/\s+/g, '_');
    extensions.forEach(ext => {
        paths.push(`photos/${underscored}${ext}`);
    });
    
    // Try with spaces replaced by hyphens
    const hyphenated = brandName.replace(/\s+/g, '-');
    extensions.forEach(ext => {
        paths.push(`photos/${hyphenated}${ext}`);
    });
    
    // Try without spaces
    const noSpaces = brandName.replace(/\s+/g, '');
    extensions.forEach(ext => {
        paths.push(`photos/${noSpaces}${ext}`);
    });
    
    // Try with "logo" suffix
    extensions.forEach(ext => {
        paths.push(`photos/${brandName}_logo${ext}`);
        paths.push(`photos/${brandName}-logo${ext}`);
        paths.push(`photos/${brandName} logo${ext}`);
    });

    // Try normalized name (remove accents/diacritics)
    // e.g. "Lancôme" -> "Lancome"
    const normalized = brandName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    if (normalized !== brandName) {
        extensions.forEach(ext => {
            paths.push(`photos/${normalized}${ext}`);
            paths.push(`photos/${normalized.toLowerCase()}${ext}`);
        });
        
        // Try normalized with spaces replaced by underscores
        const normalizedUnderscored = normalized.replace(/\s+/g, '_');
        extensions.forEach(ext => {
            paths.push(`photos/${normalizedUnderscored}${ext}`);
        });
    }
    
    return paths;
}

/**
 * Check if an image exists at the given path
 * @param {string} imagePath - Path to check
 * @returns {Promise<boolean>} True if image exists
 */
async function checkImageExists(imagePath) {
    if (!imagePath) return false;
    
    try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Batch load brand logos for multiple brands
 * @param {Array<Object>} brands - Array of brand objects with name and logo_url
 * @returns {Promise<Object>} Object mapping brand names to logo URLs
 */
export async function batchLoadBrandLogos(brands) {
    const logoMap = {};
    const promises = brands.map(async (brand) => {
        const logo = await detectBrandLogo(brand.name, brand.logo_url);
        if (logo) {
            logoMap[brand.name] = logo;
        }
    });
    
    await Promise.all(promises);
    
    console.log(`✅ Loaded ${Object.keys(logoMap).length} brand logos from ${brands.length} brands`);
    return logoMap;
}

/**
 * Preload brand logo image to ensure it's cached
 * @param {string} logoUrl - URL of logo to preload
 * @returns {Promise<boolean>} True if preloaded successfully
 */
export function preloadBrandLogo(logoUrl) {
    return new Promise((resolve) => {
        if (!logoUrl) {
            resolve(false);
            return;
        }
        
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = logoUrl;
    });
}

/**
 * Get brand logo with caching
 * Cache logos in memory to avoid repeated API calls
 */
const brandLogoCache = new Map();

export function getCachedBrandLogo(brandName) {
    return brandLogoCache.get(brandName) || null;
}

export function setCachedBrandLogo(brandName, logoUrl) {
    if (brandName && logoUrl) {
        brandLogoCache.set(brandName, logoUrl);
    }
}

export function clearBrandLogoCache() {
    brandLogoCache.clear();
}
