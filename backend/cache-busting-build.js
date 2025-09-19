#!/usr/bin/env node

/**
 * Build Script for Automated Cache Busting
 * Updates HTML files with automatic cache busters
 */

const fs = require('fs');
const path = require('path');
const CacheBustingManager = require('./utils/cacheBusting');

class CacheBustingBuildScript {
    constructor() {
        this.frontendDir = path.join(__dirname, '../frontend');
        this.cacheBuster = new CacheBustingManager({
            mode: 'hash', // Use file content hash for deterministic builds
            baseDir: this.frontendDir
        });
        
        this.htmlFiles = [
            'index.html',
            'catalog.html',
            'perfume-detail.html'
        ];
        
        this.assetPatterns = [
            // CSS files
            { pattern: /href="([^"]*\.css)(?:\?[^"]*)?"/g, type: 'css' },
            // JavaScript files  
            { pattern: /src="([^"]*\.js)(?:\?[^"]*)?"/g, type: 'js' },
            // Include specific patterns for Eden Parfum assets
            { pattern: /src="(js\/[^"]*\.js)(?:\?[^"]*)?"/g, type: 'js' },
            { pattern: /src="(perfumes-data\.js)(?:\?[^"]*)?"/g, type: 'js' },
            { pattern: /src="(perfume-detail\.js)(?:\?[^"]*)?"/g, type: 'js' },
            { pattern: /src="(script\.js)(?:\?[^"]*)?"/g, type: 'js' }
        ];
    }

    /**
     * Process a single HTML file and update cache busters
     */
    processHtmlFile(filePath) {
        console.log(`Processing ${filePath}...`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Process each asset pattern
            this.assetPatterns.forEach(({ pattern, type }) => {
                content = content.replace(pattern, (match, assetPath) => {
                    // Skip external URLs (CDN, external scripts)
                    if (assetPath.startsWith('http') || assetPath.includes('cdnjs.cloudflare.com')) {
                        return match;
                    }
                    
                    // Generate cache buster for local assets
                    const cacheBuster = this.cacheBuster.getCacheBuster(assetPath);
                    const separator = assetPath.includes('?') ? '&' : '?';
                    const newPath = `${assetPath}${separator}v=${cacheBuster}`;
                    
                    // Construct the new attribute
                    const attr = type === 'css' ? 'href' : 'src';
                    const result = `${attr}="${newPath}"`;
                    
                    console.log(`  Updated: ${assetPath} -> ${newPath}`);
                    modified = true;
                    
                    return result;
                });
            });
            
            if (modified) {
                // Create backup of original file
                const backupPath = `${filePath}.backup.${Date.now()}`;
                fs.copyFileSync(filePath, backupPath);
                console.log(`  Backup created: ${path.basename(backupPath)}`);
                
                // Write updated content
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`  ✅ Updated ${path.basename(filePath)}`);
                
                // Clean up old backups (keep only the latest 3)
                this.cleanupBackups(filePath);
            } else {
                console.log(`  ⏭️  No changes needed for ${path.basename(filePath)}`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }

    /**
     * Clean up old backup files
     */
    cleanupBackups(originalFile) {
        try {
            const dir = path.dirname(originalFile);
            const basename = path.basename(originalFile);
            const files = fs.readdirSync(dir);
            
            // Find all backup files for this HTML file
            const backups = files
                .filter(file => file.startsWith(`${basename}.backup.`))
                .map(file => ({
                    name: file,
                    path: path.join(dir, file),
                    timestamp: parseInt(file.split('.').pop())
                }))
                .sort((a, b) => b.timestamp - a.timestamp);
            
            // Remove old backups, keep only the latest 3
            if (backups.length > 3) {
                backups.slice(3).forEach(backup => {
                    fs.unlinkSync(backup.path);
                    console.log(`  🗑️  Removed old backup: ${backup.name}`);
                });
            }
        } catch (error) {
            console.warn(`Warning: Could not clean up backups for ${originalFile}:`, error.message);
        }
    }

    /**
     * Process all HTML files
     */
    processAllFiles() {
        console.log('🚀 Starting automated cache busting build process...\n');
        
        const startTime = Date.now();
        let processedCount = 0;
        let errorCount = 0;
        
        this.htmlFiles.forEach(fileName => {
            const filePath = path.join(this.frontendDir, fileName);
            
            if (fs.existsSync(filePath)) {
                try {
                    this.processHtmlFile(filePath);
                    processedCount++;
                } catch (error) {
                    console.error(`❌ Failed to process ${fileName}:`, error.message);
                    errorCount++;
                }
            } else {
                console.warn(`⚠️  File not found: ${fileName}`);
            }
            
            console.log(''); // Empty line for readability
        });
        
        const duration = Date.now() - startTime;
        
        console.log('📊 Build Summary:');
        console.log(`   Files processed: ${processedCount}`);
        console.log(`   Errors: ${errorCount}`);
        console.log(`   Duration: ${duration}ms`);
        
        if (errorCount === 0) {
            console.log('✅ Cache busting build completed successfully!');
        } else {
            console.log('⚠️  Cache busting build completed with errors.');
            process.exit(1);
        }
    }

    /**
     * Generate cache manifest for client-side usage
     */
    generateClientManifest() {
        console.log('📋 Generating client-side cache manifest...');
        
        const manifest = this.cacheBuster.generateClientManifest();
        const manifestPath = path.join(this.frontendDir, 'js', 'cache-manifest.js');
        
        const manifestContent = `/**
 * Auto-generated cache manifest
 * Generated on: ${new Date().toISOString()}
 */
window.CACHE_MANIFEST = ${JSON.stringify(manifest, null, 2)};

/**
 * Helper function to get versioned URL
 */
window.getVersionedUrl = function(filePath, baseUrl = '') {
    const cacheBuster = window.CACHE_MANIFEST[filePath];
    if (!cacheBuster) return baseUrl + filePath;
    
    const separator = filePath.includes('?') ? '&' : '?';
    return baseUrl + filePath + separator + 'v=' + cacheBuster;
};
`;

        fs.writeFileSync(manifestPath, manifestContent, 'utf8');
        console.log(`✅ Client manifest generated: ${manifestPath}`);
    }

    /**
     * Watch mode for development
     */
    watch() {
        console.log('👀 Starting watch mode for automatic cache busting...');
        
        // Watch for changes in JavaScript and CSS files
        const watchPatterns = [
            path.join(this.frontendDir, '*.js'),
            path.join(this.frontendDir, '*.css'),
            path.join(this.frontendDir, 'js', '*.js')
        ];
        
        const debounceMap = new Map();
        const debounceDelay = 1000; // 1 second
        
        watchPatterns.forEach(pattern => {
            const glob = require('glob');
            const files = glob.sync(pattern);
            
            files.forEach(file => {
                fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
                    if (curr.mtime !== prev.mtime) {
                        console.log(`📝 File changed: ${path.basename(file)}`);
                        
                        // Debounce multiple rapid changes
                        const key = file;
                        if (debounceMap.has(key)) {
                            clearTimeout(debounceMap.get(key));
                        }
                        
                        debounceMap.set(key, setTimeout(() => {
                            this.cacheBuster.clearCache(path.relative(this.frontendDir, file));
                            this.processAllFiles();
                            this.generateClientManifest();
                            debounceMap.delete(key);
                        }, debounceDelay));
                    }
                });
            });
        });
        
        console.log('✅ Watch mode activated. Press Ctrl+C to stop.');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'build';
    
    const builder = new CacheBustingBuildScript();
    
    switch (command) {
        case 'build':
            builder.processAllFiles();
            builder.generateClientManifest();
            break;
            
        case 'watch':
            builder.watch();
            break;
            
        case 'manifest':
            builder.generateClientManifest();
            break;
            
        case 'help':
            console.log('📖 Cache Busting Build Script Commands:');
            console.log('   node cache-busting-build.js build    - Process all HTML files');
            console.log('   node cache-busting-build.js watch    - Watch for changes and auto-rebuild');
            console.log('   node cache-busting-build.js manifest - Generate client manifest only');
            console.log('   node cache-busting-build.js help     - Show this help');
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log('Run "node cache-busting-build.js help" for available commands');
            process.exit(1);
    }
}

module.exports = CacheBustingBuildScript;