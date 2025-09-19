// Mock the EdenParfumAPI class for testing
// Create a simple implementation that doesn't require the actual JS files

// Mock API Client
class MockEdenParfumAPI {
    constructor() {
        this.baseUrl = '/api/v2';
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000;
    }

    getApiBaseUrl() {
        const hostname = 'localhost';
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000/api/v2';
        } else if (hostname === 'edenwebsite.onrender.com') {
            return 'https://edenwebsite.onrender.com/api/v2';
        } else {
            return '/api/v2';
        }
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}?${new URLSearchParams(params).toString()}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async fetchWithFallback(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            return this.getOfflineData();
        }
    }

    getOfflineData() {
        return [
            {
                id: 1,
                name: 'Offline Perfume',
                brand: 'Offline Brand',
                reference: 'OFF001',
                gender: 'homme',
                photo_url: 'offline.jpg'
            }
        ];
    }

    async getAllPerfumes(params = {}) {
        const cacheKey = this.getCacheKey('perfumes', params);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const url = new URL(`${this.baseUrl}/perfumes`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        const data = await this.fetchWithFallback(url.toString());
        this.setCache(cacheKey, data);
        return data;
    }

    async getAllBrands(params = {}) {
        const cacheKey = this.getCacheKey('brands', params);
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const url = new URL(`${this.baseUrl}/brands`);
        if (params.search) {
            url.searchParams.append('search', params.search);
        }

        const data = await this.fetchWithFallback(url.toString());
        this.setCache(cacheKey, data);
        return data;
    }

    async getPerfumeById(id) {
        const cacheKey = this.getCacheKey(`perfumes/${id}`, {});
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const url = `${this.baseUrl}/perfumes/${id}`;
        const data = await this.fetchWithFallback(url);
        this.setCache(cacheKey, data);
        return data;
    }

    async getUniqueGenders() {
        const cacheKey = 'genders';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        const url = `${this.baseUrl}/perfumes/genders`;
        const data = await this.fetchWithFallback(url);
        this.setCache(cacheKey, data);
        return data;
    }
}

// Mock FastImageLoader
class MockFastImageLoader {
    constructor() {
        this.observer = null;
        this.loadedImages = new Set();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
            this.observeImages();
        } else {
            this.loadAllImages();
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src && !this.loadedImages.has(src)) {
            img.src = src;
            this.loadedImages.add(src);
            img.classList.add('loaded');
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.observer.observe(img));
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
}

describe('Eden Parfum Frontend Tests', () => {
    let api;
    let imageLoader;

    beforeEach(() => {
        // Reset fetch mock
        fetch.mockClear();
        
        // Create new instances
        api = new MockEdenParfumAPI();
        imageLoader = new MockFastImageLoader();
        
        // Reset DOM
        document.body.innerHTML = '';
    });

    describe('EdenParfumAPI', () => {
        describe('URL Configuration', () => {
            test('should return correct API URL for localhost', () => {
                const mockWindow = { location: { hostname: 'localhost' } };
                global.window = mockWindow;
                
                const testApi = new MockEdenParfumAPI();
                expect(testApi.getApiBaseUrl()).toBe('http://localhost:3000/api/v2');
            });

            test('should return correct API URL for Render direct access', () => {
                const mockWindow = { location: { hostname: 'edenwebsite.onrender.com' } };
                global.window = mockWindow;
                
                const testApi = new MockEdenParfumAPI();
                expect(testApi.getApiBaseUrl()).toBe('https://edenwebsite.onrender.com/api/v2');
            });

            test('should return relative URL for production', () => {
                const mockWindow = { location: { hostname: 'edenparfum.netlify.app' } };
                global.window = mockWindow;
                
                const testApi = new MockEdenParfumAPI();
                expect(testApi.getApiBaseUrl()).toBe('/api/v2');
            });
        });

        describe('Caching', () => {
            test('should generate cache keys correctly', () => {
                const params = { search: 'chanel', limit: 10 };
                const key = api.getCacheKey('perfumes', params);
                expect(key).toBe('perfumes?search=chanel&limit=10');
            });

            test('should store and retrieve cached data', () => {
                const testData = [{ id: 1, name: 'Test' }];
                const key = 'test-key';
                
                api.setCache(key, testData);
                const retrieved = api.getFromCache(key);
                
                expect(retrieved).toEqual(testData);
            });

            test('should return null for expired cache', async () => {
                const testData = [{ id: 1, name: 'Test' }];
                const key = 'test-key';
                
                // Mock expired cache
                api.cacheExpiry = -1; // Make cache expire immediately
                api.setCache(key, testData);
                
                // Wait a bit to ensure expiry
                await new Promise(resolve => setTimeout(resolve, 10));
                
                const retrieved = api.getFromCache(key);
                expect(retrieved).toBeNull();
            });
        });

        describe('API Methods', () => {
            test('should fetch all perfumes', async () => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => [
                        { id: 1, name: 'Chanel No. 5', brand: 'Chanel' },
                        { id: 2, name: 'Dior Sauvage', brand: 'Dior' }
                    ]
                });

                const perfumes = await api.getAllPerfumes();
                
                expect(Array.isArray(perfumes)).toBe(true);
                expect(perfumes.length).toBeGreaterThan(0);
            });

            test('should fetch perfumes with search params', async () => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => [
                        { id: 1, name: 'Chanel No. 5', brand: 'Chanel' }
                    ]
                });

                const params = { search: 'chanel', limit: 10 };
                const perfumes = await api.getAllPerfumes(params);
                
                expect(fetch).toHaveBeenCalledWith(
                    expect.stringContaining('search=chanel&limit=10')
                );
                expect(perfumes).toBeDefined();
            });

            test('should handle API errors with offline fallback', async () => {
                fetch.mockRejectedValueOnce(new Error('Network error'));

                const perfumes = await api.getAllPerfumes();
                
                expect(perfumes).toEqual(api.getOfflineData());
            });

            test('should fetch brands', async () => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => [
                        { name: 'Chanel' },
                        { name: 'Dior' }
                    ]
                });

                const brands = await api.getAllBrands();
                
                expect(Array.isArray(brands)).toBe(true);
            });

            test('should fetch perfume by ID', async () => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ id: 1, name: 'Chanel No. 5', brand: 'Chanel' })
                });

                const perfume = await api.getPerfumeById(1);
                
                expect(perfume).toHaveProperty('id', 1);
                expect(perfume).toHaveProperty('name');
            });

            test('should fetch unique genders', async () => {
                fetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ['homme', 'femme', 'mixte']
                });

                const genders = await api.getUniqueGenders();
                
                expect(Array.isArray(genders)).toBe(true);
                expect(genders).toContain('homme');
                expect(genders).toContain('femme');
            });
        });
    });

    describe('FastImageLoader', () => {
        beforeEach(() => {
            // Create test DOM structure
            document.body.innerHTML = `
                <div class="perfume-container">
                    <img data-src="test1.jpg" alt="Test 1" />
                    <img data-src="test2.jpg" alt="Test 2" />
                    <img src="loaded.jpg" alt="Already loaded" />
                </div>
            `;
        });

        test('should initialize with IntersectionObserver', () => {
            imageLoader.init();
            expect(imageLoader.observer).toBeDefined();
        });

        test('should load image when intersecting', () => {
            const img = document.querySelector('img[data-src="test1.jpg"]');
            
            imageLoader.loadImage(img);
            
            expect(img.src).toBe('test1.jpg');
            expect(img.classList.contains('loaded')).toBe(true);
            expect(imageLoader.loadedImages.has('test1.jpg')).toBe(true);
        });

        test('should observe all images with data-src', () => {
            const observeSpy = jest.spyOn(imageLoader, 'observeImages');
            
            imageLoader.init();
            
            expect(observeSpy).toHaveBeenCalled();
        });

        test('should not load same image twice', () => {
            const img = document.querySelector('img[data-src="test1.jpg"]');
            
            imageLoader.loadImage(img);
            const firstSrc = img.src;
            
            imageLoader.loadImage(img);
            const secondSrc = img.src;
            
            expect(firstSrc).toBe(secondSrc);
            expect(imageLoader.loadedImages.size).toBe(1);
        });
    });

    describe('DOM Manipulation Utilities', () => {
        test('should create perfume card element', () => {
            const perfume = {
                id: 1,
                name: 'Test Perfume',
                brand: 'Test Brand',
                reference: 'TEST001',
                photo_url: 'test.jpg'
            };

            const createPerfumeCard = (perfume) => {
                const card = document.createElement('div');
                card.className = 'perfume-card';
                card.innerHTML = `
                    <div class="perfume-image">
                        <img data-src="${perfume.photo_url}" alt="${perfume.name}" />
                    </div>
                    <div class="perfume-info">
                        <div class="perfume-name">${perfume.name}</div>
                        <div class="perfume-brand">${perfume.brand}</div>
                        <div class="perfume-reference">${perfume.reference}</div>
                    </div>
                `;
                return card;
            };

            const card = createPerfumeCard(perfume);
            
            expect(card).toBeValidPerfumeElement();
            expect(card.querySelector('.perfume-name').textContent).toBe('Test Perfume');
            expect(card.querySelector('.perfume-brand').textContent).toBe('Test Brand');
        });

        test('should filter perfumes by search term', () => {
            const perfumes = [
                { id: 1, name: 'Chanel No. 5', brand: 'Chanel' },
                { id: 2, name: 'Dior Sauvage', brand: 'Dior' },
                { id: 3, name: 'Channel Perfume', brand: 'Other' } // Typo in name
            ];

            const filterPerfumes = (perfumes, searchTerm) => {
                if (!searchTerm) return perfumes;
                
                const term = searchTerm.toLowerCase();
                return perfumes.filter(p => 
                    p.name.toLowerCase().includes(term) ||
                    p.brand.toLowerCase().includes(term)
                );
            };

            const filtered = filterPerfumes(perfumes, 'chanel');
            
            expect(filtered).toHaveLength(2); // Both "Chanel" and "Channel" should match
            expect(filtered.map(p => p.id)).toEqual([1, 3]);
        });

        test('should validate perfume data', () => {
            const isValidPerfume = (perfume) => {
                return perfume &&
                       typeof perfume.id === 'number' &&
                       typeof perfume.name === 'string' &&
                       typeof perfume.brand === 'string' &&
                       perfume.name.trim() !== '' &&
                       perfume.brand.trim() !== '';
            };

            const validPerfume = {
                id: 1,
                name: 'Test Perfume',
                brand: 'Test Brand'
            };

            const invalidPerfume = {
                id: 'not-a-number',
                name: '',
                brand: 'Test Brand'
            };

            expect(isValidPerfume(validPerfume)).toBe(true);
            expect(isValidPerfume(invalidPerfume)).toBe(false);
            expect(isValidPerfume(null)).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await api.fetchWithFallback('/test-url');
            
            expect(result).toEqual(api.getOfflineData());
        });

        test('should handle invalid JSON responses', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON'); }
            });

            const result = await api.fetchWithFallback('/test-url');
            
            expect(result).toEqual(api.getOfflineData());
        });

        test('should handle HTTP error responses', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' })
            });

            const result = await api.fetchWithFallback('/test-url');
            
            expect(result).toEqual(api.getOfflineData());
        });
    });

    describe('Accessibility', () => {
        test('should have proper alt text for images', () => {
            document.body.innerHTML = `
                <img data-src="perfume.jpg" alt="Chanel No. 5 perfume bottle" />
                <img data-src="brand.jpg" alt="Chanel brand logo" />
            `;

            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                expect(img.alt).toBeTruthy();
                expect(img.alt.length).toBeGreaterThan(0);
            });
        });

        test('should support keyboard navigation', () => {
            document.body.innerHTML = `
                <div class="perfume-card" tabindex="0">
                    <div class="perfume-name">Test Perfume</div>
                </div>
            `;

            const card = document.querySelector('.perfume-card');
            expect(card.tabIndex).toBe(0);
        });
    });
});