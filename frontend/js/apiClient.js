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
            // Development environment
            return 'http://localhost:3000/api/v2';
        } else {
            // Production environment - API calls will be proxied by Netlify
            return '/api/v2';
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
        const cacheKey = this.getCacheKey(endpoint, params);
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        try {
            console.log(`🌐 Fetching: ${url.toString()}`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ API Success: Got ${data.data ? data.data.length : 'unknown'} items from ${endpoint}`);
            
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
            console.warn(`❌ API Error (${endpoint}):`, error.message);
            console.log(`🔄 Falling back to offline data for ${endpoint}...`);
            
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
            console.error('Health check failed:', error);
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
        console.log('Loading perfumes from new API...');
        const response = await window.edenAPI.getPerfumes({ limit: 1000 });
        
        if (response.success && response.data) {
            window.perfumesDatabase = window.edenAPI.convertToLegacyFormat(response.data);
            console.log(`Loaded ${window.perfumesDatabase.length} perfumes from API`);
            
            // Trigger a custom event to notify that data is loaded
            window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                detail: { count: window.perfumesDatabase.length }
            }));
            
            return window.perfumesDatabase;
        } else {
            throw new Error('Failed to load perfumes from API');
        }
    } catch (error) {
        console.error('Error loading perfumes database:', error);
        
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

console.log('Eden Parfum API client loaded successfully');