// Eden Parfum API Client for Frontend
// Uses fetch API to communicate with backend /api/v2/ endpoints

class EdenParfumAPI {
    constructor() {
        // Determine the base URL based on environment
        this.baseUrl = this.getApiBaseUrl();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    getApiBaseUrl() {
        // Check if we're in development or production
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Development environment - use local server
            return 'http://localhost:3000/api/v2';
        } else {
            // Production environment - use Netlify Functions
            // Temporarily fallback to offline mode due to function issues
            console.warn('🔄 API functions not yet ready, using offline data');
            return null; // This will trigger offline fallback
        }
    }

    // Helper method for caching
    getCacheKey(endpoint, params) {
        return `${endpoint}?${new URLSearchParams(params).toString()}`;
    }

    // Helper method to check cache
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    // Helper method to set cache
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Fetch wrapper with error handling and offline fallback
    async fetchAPI(endpoint, params = {}) {
        const baseUrl = this.baseUrl;
        
        // If baseUrl is null, immediately use offline data
        if (!baseUrl) {
            console.log('🔄 Using offline data (API not available)');
            return this.getOfflineData(endpoint, params);
        }
        
        const cacheKey = this.getCacheKey(endpoint, params);
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        const url = new URL(`${baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const startTime = performance.now();

        try {
            const response = await fetch(url);
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            if (!response.ok) {
                const error = new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
                
                // Log API error to monitoring system
                if (window.ErrorMonitor) {
                    window.ErrorMonitor.logError({
                        type: 'api_error',
                        message: `API request failed: ${response.status} ${response.statusText}`,
                        endpoint: endpoint,
                        url: url.toString(),
                        status: response.status,
                        statusText: response.statusText,
                        duration: duration,
                        params: params,
                        timestamp: new Date().toISOString()
                    });
                }

                throw error;
            }
            
            const data = await response.json();
            
            // Log slow API calls
            if (duration > 2000 && window.ErrorMonitor) {
                window.ErrorMonitor.logError({
                    type: 'slow_api_call',
                    message: `Slow API response: ${duration.toFixed(2)}ms`,
                    endpoint: endpoint,
                    duration: duration,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Transform API response to expected format
            const transformedData = {
                success: true,
                data: data.data,
                total: data.total,
                page: data.page,
                totalPages: data.totalPages,
                offline: false
            };
            
            this.setCache(cacheKey, transformedData);
            return transformedData;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Log network error to monitoring system
            if (window.ErrorMonitor) {
                window.ErrorMonitor.logError({
                    type: 'network_error',
                    message: `Network request failed: ${error.message}`,
                    endpoint: endpoint,
                    url: url.toString(),
                    error: error.toString(),
                    duration: duration,
                    params: params,
                    timestamp: new Date().toISOString()
                });
            }

            // Show user-friendly error message
            if (window.UserErrorHandler) {
                window.UserErrorHandler.handleApiError(error, `Loading ${endpoint}`);
            } else {
                // API Error handled silently in production
            }
            
            // Try to use offline data as fallback
            return this.getOfflineData(endpoint, params);
        }
    }

    // Offline data fallback
    getOfflineData(endpoint, params = {}) {
        if (!window.offlinePerfumeData) {
            throw new Error('No offline data available and API server is unreachable');
        }

        const data = window.offlinePerfumeData;
        
        if (endpoint === '/perfumes') {
            let perfumes = data.perfumes;
            
            // Apply basic filtering
            if (params.search) {
                const searchTerm = params.search.toLowerCase();
                perfumes = perfumes.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) || 
                    p.brand.toLowerCase().includes(searchTerm)
                );
            }
            
            if (params.brand) {
                perfumes = perfumes.filter(p => 
                    p.brand.toLowerCase() === params.brand.toLowerCase()
                );
            }
            
            if (params.gender) {
                perfumes = perfumes.filter(p => 
                    p.gender.toLowerCase() === params.gender.toLowerCase()
                );
            }
            
            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 50;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            return {
                success: true,
                data: perfumes.slice(startIndex, endIndex),
                total: perfumes.length,
                page: page,
                totalPages: Math.ceil(perfumes.length / limit),
                offline: true
            };
        }
        
        if (endpoint === '/brands') {
            return {
                success: true,
                data: data.brands,
                total: data.brands.length,
                offline: true
            };
        }
        
        if (endpoint.startsWith('/perfumes/')) {
            const id = parseInt(endpoint.split('/')[2]);
            const perfume = data.perfumes.find(p => p.id === id);
            
            if (perfume) {
                return {
                    success: true,
                    data: perfume,
                    offline: true
                };
            }
        }
        
        throw new Error(`Offline data not available for endpoint: ${endpoint}`);
    }

    // Get all perfumes with filtering
    async getPerfumes(filters = {}) {
        const params = {
            page: filters.page || 1,
            limit: filters.limit || 50
        };

        if (filters.search) params.search = filters.search;
        if (filters.brand) params.brand = filters.brand;
        if (filters.gender) params.gender = filters.gender;
        if (filters.category) params.category = filters.category;

        return await this.fetchAPI('/perfumes', params);
    }

    // Get single perfume by ID
    async getPerfume(id) {
        return await this.fetchAPI(`/perfumes/${id}`);
    }

    // Search perfumes
    async searchPerfumes(query, filters = {}) {
        const params = {
            search: query,
            page: filters.page || 1,
            limit: filters.limit || 50
        };

        if (filters.brand) params.brand = filters.brand;
        if (filters.gender) params.gender = filters.gender;

        return await this.fetchAPI('/perfumes', params);
    }

    // Get all brands
    async getBrands(filters = {}) {
        const params = {
            page: filters.page || 1,
            limit: filters.limit || 100
        };

        if (filters.search) params.search = filters.search;

        return await this.fetchAPI('/brands', params);
    }

    // Get single brand by ID
    async getBrand(id) {
        return await this.fetchAPI(`/brands/${id}`);
    }

    // Get photo statistics
    async getPhotoStats() {
        return await this.fetchAPI('/photos/stats');
    }

    // Get available brand photos
    async getBrandPhotos() {
        return await this.fetchAPI('/photos/brands');
    }

    // Get available perfume photos
    async getPerfumePhotos() {
        return await this.fetchAPI('/photos/perfumes');
    }

    // Health check
    async checkHealth() {
        try {
            const response = await fetch(`${window.location.origin}/api/health`);
            return await response.json();
        } catch (error) {
            // Health check failed
            return { status: 'error', message: 'API unavailable' };
        }
    }

    // Helper method to convert old perfumesDatabase format to new format
    convertToLegacyFormat(perfumes) {
        return perfumes.map(perfume => ({
            reference: perfume.id,
            name: perfume.name,
            brand: perfume.brand_name || perfume.brands?.name,
            gender: perfume.gender === 'Mixte' ? 'Unisex' : perfume.gender,
            category: perfume.category,
            concentration: perfume.concentration,
            size: perfume.size,
            price: perfume.price,
            image: perfume.photo_url || `/photos/${perfume.name?.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
            // Legacy fields for compatibility
            brandLogo: perfume.brands?.photo_url,
            description: `${perfume.concentration} ${perfume.size}`,
            notes: {
                top: [],
                middle: [],
                base: []
            }
        }));
    }
}

// Global API instance
window.edenAPI = new EdenParfumAPI();

// Legacy compatibility - simulate perfumesDatabase
window.perfumesDatabase = null;
window.loadPerfumesDatabase = async function() {
    try {
        // Production: Remove debug logging
        const response = await window.edenAPI.getPerfumes({ limit: 1000 });
        
        if (response.success && response.data) {
            window.perfumesDatabase = window.edenAPI.convertToLegacyFormat(response.data);
            // Production: Remove debug logging
            
            // Trigger a custom event to notify that data is loaded
            window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                detail: { count: window.perfumesDatabase.length }
            }));
            
            return window.perfumesDatabase;
        } else {
            throw new Error('Failed to load perfumes from API');
        }
    } catch (error) {
        // Error loading perfumes database
        
        // Fallback: create empty array to prevent errors
        window.perfumesDatabase = [];
        return [];
    }
};

// Auto-load on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Only load if we're on a page that needs the perfumes database
    if (document.getElementById('perfumeGrid') || 
        document.querySelector('.perfume-grid') ||
        window.location.pathname.includes('catalog.html')) {
        window.loadPerfumesDatabase();
    }
});

// Production: Remove debug logging