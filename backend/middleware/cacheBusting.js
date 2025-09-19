/**
 * Cache Busting Middleware for Express.js
 * Provides dynamic cache busting for static assets
 */

const CacheBustingManager = require('../utils/cacheBusting');
const path = require('path');

class CacheBustingMiddleware {
    constructor(options = {}) {
        this.cacheBuster = new CacheBustingManager({
            mode: options.mode || 'timestamp',
            baseDir: options.baseDir || path.join(__dirname, '../../frontend'),
            ...options
        });
    }

    /**
     * Express middleware for adding cache busting helpers
     */
    middleware() {
        return (req, res, next) => {
            // Add cache buster helper to response locals
            res.locals.cacheBuster = (filePath) => {
                return this.cacheBuster.getCacheBuster(filePath);
            };
            
            res.locals.versionedUrl = (filePath, baseUrl = '') => {
                return this.cacheBuster.getVersionedUrl(filePath, baseUrl);
            };
            
            // Add cache manifest to locals for template rendering
            res.locals.cacheManifest = this.cacheBuster.generateClientManifest();
            
            next();
        };
    }

    /**
     * API endpoint for getting cache manifest
     */
    getManifestEndpoint() {
        return (req, res) => {
            try {
                const manifest = this.cacheBuster.generateClientManifest();
                
                res.set({
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=300', // 5 minutes cache
                    'ETag': `"${Date.now()}"`,
                    'Last-Modified': new Date().toUTCString()
                });
                
                res.json({
                    success: true,
                    manifest,
                    generated: new Date().toISOString(),
                    count: Object.keys(manifest).length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate cache manifest',
                    message: error.message
                });
            }
        };
    }

    /**
     * API endpoint for getting versioned URL
     */
    getVersionedUrlEndpoint() {
        return (req, res) => {
            try {
                const { filePath, baseUrl = '' } = req.query;
                
                if (!filePath) {
                    return res.status(400).json({
                        success: false,
                        error: 'filePath parameter is required'
                    });
                }
                
                const versionedUrl = this.cacheBuster.getVersionedUrl(filePath, baseUrl);
                const cacheBuster = this.cacheBuster.getCacheBuster(filePath);
                
                res.json({
                    success: true,
                    filePath,
                    versionedUrl,
                    cacheBuster,
                    generated: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate versioned URL',
                    message: error.message
                });
            }
        };
    }

    /**
     * API endpoint for clearing cache
     */
    getClearCacheEndpoint() {
        return (req, res) => {
            try {
                const { files } = req.body;
                
                this.cacheBuster.clearCache(files);
                
                res.json({
                    success: true,
                    message: 'Cache cleared successfully',
                    clearedFiles: files || 'all',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to clear cache',
                    message: error.message
                });
            }
        };
    }

    /**
     * Enhanced static file serving with automatic cache busting
     */
    staticFileMiddleware(staticPath, options = {}) {
        const express = require('express');
        
        return (req, res, next) => {
            // Check if this is a request for a static file that needs cache busting
            const filePath = req.path;
            const isStaticAsset = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i.test(filePath);
            
            if (isStaticAsset) {
                // Set cache headers based on whether we have a version parameter
                const hasVersion = req.query.v || req.query.version;
                
                if (hasVersion) {
                    // Long cache for versioned assets (1 year)
                    res.set({
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Expires': new Date(Date.now() + 31536000000).toUTCString()
                    });
                } else {
                    // Short cache for non-versioned assets (5 minutes)
                    res.set({
                        'Cache-Control': 'public, max-age=300',
                        'Expires': new Date(Date.now() + 300000).toUTCString()
                    });
                }
                
                // Add ETag based on file path and version
                const cacheBuster = this.cacheBuster.getCacheBuster(filePath.substring(1));
                res.set('ETag', `"${cacheBuster}"`);
            }
            
            // Continue with normal static file serving
            express.static(staticPath, options)(req, res, next);
        };
    }

    /**
     * HTML response modifier to inject cache busters
     */
    htmlCacheBustingMiddleware() {
        return (req, res, next) => {
            // Only process HTML responses
            if (!req.path.endsWith('.html') && !req.path.endsWith('/')) {
                return next();
            }
            
            const originalSend = res.send;
            
            res.send = (content) => {
                if (typeof content === 'string' && content.includes('<html')) {
                    // Inject cache busters into HTML content
                    content = this.injectCacheBusters(content);
                }
                
                originalSend.call(res, content);
            };
            
            next();
        };
    }

    /**
     * Inject cache busters into HTML content
     */
    injectCacheBusters(html) {
        try {
            // Replace CSS links
            html = html.replace(
                /(<link[^>]*href=")([^"]*\.css)(?:\?[^"]*)?("[^>]*>)/g,
                (match, prefix, filePath, suffix) => {
                    if (filePath.startsWith('http')) return match;
                    const versionedUrl = this.cacheBuster.getVersionedUrl(filePath);
                    return prefix + versionedUrl + suffix;
                }
            );
            
            // Replace JS scripts
            html = html.replace(
                /(<script[^>]*src=")([^"]*\.js)(?:\?[^"]*)?("[^>]*>)/g,
                (match, prefix, filePath, suffix) => {
                    if (filePath.startsWith('http')) return match;
                    const versionedUrl = this.cacheBuster.getVersionedUrl(filePath);
                    return prefix + versionedUrl + suffix;
                }
            );
            
            return html;
        } catch (error) {
            console.error('Error injecting cache busters:', error);
            return html;
        }
    }

    /**
     * Get cache statistics for monitoring
     */
    getCacheStats() {
        const manifest = this.cacheBuster.manifest;
        const stats = {
            totalFiles: 0,
            cacheEntries: 0,
            oldestEntry: null,
            newestEntry: null,
            totalSize: 0
        };
        
        Object.keys(manifest).forEach(key => {
            if (key.startsWith('cache_')) {
                stats.cacheEntries++;
                const entry = manifest[key];
                
                if (!stats.oldestEntry || entry.generated < stats.oldestEntry) {
                    stats.oldestEntry = entry.generated;
                }
                
                if (!stats.newestEntry || entry.generated > stats.newestEntry) {
                    stats.newestEntry = entry.generated;
                }
            }
        });
        
        return stats;
    }
}

module.exports = CacheBustingMiddleware;