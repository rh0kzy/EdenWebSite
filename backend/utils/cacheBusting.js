/**
 * Automated Cache Busting System for Eden Parfum
 * Automatically generates cache busters based on file modification times or content hashes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CacheBustingManager {
    constructor(options = {}) {
        this.options = {
            mode: options.mode || 'timestamp', // 'timestamp', 'hash', or 'version'
            baseDir: options.baseDir || path.join(__dirname, '../frontend'),
            manifestFile: options.manifestFile || path.join(__dirname, 'cache-manifest.json'),
            hashLength: options.hashLength || 8,
            ...options
        };
        
        this.manifest = this.loadManifest();
    }

    /**
     * Load existing cache manifest or create new one
     */
    loadManifest() {
        try {
            if (fs.existsSync(this.options.manifestFile)) {
                return JSON.parse(fs.readFileSync(this.options.manifestFile, 'utf8'));
            }
        } catch (error) {
            console.warn('Failed to load cache manifest, creating new one');
        }
        return {};
    }

    /**
     * Save cache manifest to file
     */
    saveManifest() {
        try {
            fs.writeFileSync(this.options.manifestFile, JSON.stringify(this.manifest, null, 2));
        } catch (error) {
            console.error('Failed to save cache manifest:', error);
        }
    }

    /**
     * Generate cache buster for a file
     */
    generateCacheBuster(filePath) {
        const fullPath = path.resolve(this.options.baseDir, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            return Date.now().toString();
        }

        switch (this.options.mode) {
            case 'hash':
                return this.generateFileHash(fullPath);
            case 'timestamp':
                return this.getFileTimestamp(fullPath);
            case 'version':
                return this.getVersionNumber(filePath);
            default:
                return Date.now().toString();
        }
    }

    /**
     * Generate MD5 hash of file content
     */
    generateFileHash(filePath) {
        try {
            const content = fs.readFileSync(filePath);
            const hash = crypto.createHash('md5').update(content).digest('hex');
            return hash.substring(0, this.options.hashLength);
        } catch (error) {
            console.error(`Failed to generate hash for ${filePath}:`, error);
            return Date.now().toString();
        }
    }

    /**
     * Get file modification timestamp
     */
    getFileTimestamp(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return Math.floor(stats.mtime.getTime() / 1000).toString();
        } catch (error) {
            console.error(`Failed to get timestamp for ${filePath}:`, error);
            return Date.now().toString();
        }
    }

    /**
     * Get or increment version number for file
     */
    getVersionNumber(filePath) {
        if (!this.manifest[filePath]) {
            this.manifest[filePath] = { version: 1 };
        }
        return this.manifest[filePath].version.toString();
    }

    /**
     * Increment version number for a file
     */
    incrementVersion(filePath) {
        if (!this.manifest[filePath]) {
            this.manifest[filePath] = { version: 1 };
        } else {
            this.manifest[filePath].version += 1;
        }
        this.saveManifest();
        return this.manifest[filePath].version;
    }

    /**
     * Get cache buster for a file (cached result)
     */
    getCacheBuster(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        const cacheKey = `cache_${normalizedPath}`;
        
        // Check if we have a cached result
        if (this.manifest[cacheKey]) {
            const cached = this.manifest[cacheKey];
            const fullPath = path.resolve(this.options.baseDir, normalizedPath);
            
            // Verify file hasn't changed (for hash and timestamp modes)
            if (this.options.mode === 'version') {
                return cached.value;
            }
            
            try {
                const stats = fs.statSync(fullPath);
                if (cached.lastModified === stats.mtime.getTime()) {
                    return cached.value;
                }
            } catch (error) {
                // File might not exist, generate new cache buster
            }
        }

        // Generate new cache buster
        const cacheBuster = this.generateCacheBuster(normalizedPath);
        
        // Cache the result
        try {
            const fullPath = path.resolve(this.options.baseDir, normalizedPath);
            const stats = fs.statSync(fullPath);
            this.manifest[cacheKey] = {
                value: cacheBuster,
                lastModified: stats.mtime.getTime(),
                generated: Date.now()
            };
            this.saveManifest();
        } catch (error) {
            // If we can't stat the file, just cache the value without lastModified
            this.manifest[cacheKey] = {
                value: cacheBuster,
                generated: Date.now()
            };
            this.saveManifest();
        }

        return cacheBuster;
    }

    /**
     * Get versioned URL for a static asset
     */
    getVersionedUrl(filePath, baseUrl = '') {
        const cacheBuster = this.getCacheBuster(filePath);
        const separator = filePath.includes('?') ? '&' : '?';
        return `${baseUrl}${filePath}${separator}v=${cacheBuster}`;
    }

    /**
     * Update all cache busters (useful for build process)
     */
    updateAllCacheBuilders() {
        const updated = {};
        
        // Common static assets that need cache busting
        const staticAssets = [
            'styles.css',
            'script.js',
            'perfumes-data.js',
            'perfume-detail.js',
            'js/apiClient.js',
            'js/fastImageLoader.js',
            'js/offlineData.js',
            'js/errorMonitor.js',
            'js/supabaseClient.js'
        ];

        staticAssets.forEach(asset => {
            const fullPath = path.resolve(this.options.baseDir, asset);
            if (fs.existsSync(fullPath)) {
                updated[asset] = this.getCacheBuster(asset);
            }
        });

        return updated;
    }

    /**
     * Get cache busting info for Express.js middleware
     */
    getExpressMiddleware() {
        return (req, res, next) => {
            // Add cache buster helper to response locals
            res.locals.cacheBuster = (filePath) => {
                return this.getCacheBuster(filePath);
            };
            
            res.locals.versionedUrl = (filePath, baseUrl = '') => {
                return this.getVersionedUrl(filePath, baseUrl);
            };
            
            next();
        };
    }

    /**
     * Generate cache manifest for frontend JavaScript consumption
     */
    generateClientManifest() {
        const clientManifest = {};
        
        // Only include cache busters, not internal metadata
        Object.keys(this.manifest).forEach(key => {
            if (key.startsWith('cache_')) {
                const filePath = key.replace('cache_', '');
                clientManifest[filePath] = this.manifest[key].value;
            }
        });

        return clientManifest;
    }

    /**
     * Clear cache for specific files or all files
     */
    clearCache(filePaths = null) {
        if (filePaths) {
            // Clear cache for specific files
            const pathsArray = Array.isArray(filePaths) ? filePaths : [filePaths];
            pathsArray.forEach(filePath => {
                const normalizedPath = filePath.replace(/\\/g, '/');
                const cacheKey = `cache_${normalizedPath}`;
                delete this.manifest[cacheKey];
            });
        } else {
            // Clear all cache
            Object.keys(this.manifest).forEach(key => {
                if (key.startsWith('cache_')) {
                    delete this.manifest[key];
                }
            });
        }
        
        this.saveManifest();
    }
}

module.exports = CacheBustingManager;