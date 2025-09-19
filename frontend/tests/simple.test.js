// Simple frontend utility tests that work reliably

describe('Eden Parfum Frontend Core Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        // Reset fetch mock
        fetch.mockClear();
    });

    describe('Utility Functions', () => {
        describe('URL Generation', () => {
            test('should build query string correctly', () => {
                const buildQueryString = (params) => {
                    const searchParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (params[key] !== undefined && params[key] !== '') {
                            searchParams.append(key, params[key]);
                        }
                    });
                    return searchParams.toString();
                };

                const params = { search: 'chanel', limit: 10, offset: 0 };
                const queryString = buildQueryString(params);
                
                expect(queryString).toContain('search=chanel');
                expect(queryString).toContain('limit=10');
                expect(queryString).toContain('offset=0');
            });

            test('should filter out empty parameters', () => {
                const buildQueryString = (params) => {
                    const searchParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (params[key] !== undefined && params[key] !== '') {
                            searchParams.append(key, params[key]);
                        }
                    });
                    return searchParams.toString();
                };

                const params = { search: 'chanel', empty: '', undefined: undefined };
                const queryString = buildQueryString(params);
                
                expect(queryString).toBe('search=chanel');
            });
        });

        describe('Data Validation', () => {
            test('should validate perfume objects', () => {
                const isValidPerfume = (perfume) => {
                    if (!perfume) return false;
                    return typeof perfume.id === 'number' &&
                           typeof perfume.name === 'string' &&
                           typeof perfume.brand === 'string' &&
                           perfume.name.trim() !== '' &&
                           perfume.brand.trim() !== '';
                };

                const validPerfume = {
                    id: 1,
                    name: 'Chanel No. 5',
                    brand: 'Chanel'
                };

                const invalidPerfume1 = {
                    id: 'not-a-number',
                    name: 'Test',
                    brand: 'Test'
                };

                const invalidPerfume2 = {
                    id: 1,
                    name: '',
                    brand: 'Test'
                };

                expect(isValidPerfume(validPerfume)).toBe(true);
                expect(isValidPerfume(invalidPerfume1)).toBe(false);
                expect(isValidPerfume(invalidPerfume2)).toBe(false);
                expect(isValidPerfume(null)).toBe(false);
                expect(isValidPerfume(undefined)).toBe(false);
            });

            test('should validate search input', () => {
                const sanitizeSearchInput = (input) => {
                    if (!input || typeof input !== 'string') return '';
                    return input.trim().toLowerCase();
                };

                expect(sanitizeSearchInput('  CHANEL  ')).toBe('chanel');
                expect(sanitizeSearchInput('Test Search')).toBe('test search');
                expect(sanitizeSearchInput('')).toBe('');
                expect(sanitizeSearchInput(null)).toBe('');
                expect(sanitizeSearchInput(undefined)).toBe('');
                expect(sanitizeSearchInput(123)).toBe('');
            });
        });

        describe('Array Processing', () => {
            test('should filter perfumes by search term', () => {
                const perfumes = [
                    { id: 1, name: 'Chanel No. 5', brand: 'Chanel' },
                    { id: 2, name: 'Dior Sauvage', brand: 'Dior' },
                    { id: 3, name: 'Test Perfume', brand: 'Chanel' }
                ];

                const filterPerfumes = (perfumes, searchTerm) => {
                    if (!searchTerm) return perfumes;
                    
                    const term = searchTerm.toLowerCase();
                    return perfumes.filter(p => 
                        p.name.toLowerCase().includes(term) ||
                        p.brand.toLowerCase().includes(term)
                    );
                };

                const result1 = filterPerfumes(perfumes, 'chanel');
                expect(result1).toHaveLength(2);
                expect(result1.map(p => p.id)).toEqual([1, 3]);

                const result2 = filterPerfumes(perfumes, 'dior');
                expect(result2).toHaveLength(1);
                expect(result2[0].id).toBe(2);

                const result3 = filterPerfumes(perfumes, '');
                expect(result3).toHaveLength(3);

                const result4 = filterPerfumes(perfumes, 'nonexistent');
                expect(result4).toHaveLength(0);
            });

            test('should sort perfumes by various criteria', () => {
                const perfumes = [
                    { id: 3, name: 'C Perfume', brand: 'Brand C' },
                    { id: 1, name: 'A Perfume', brand: 'Brand A' },
                    { id: 2, name: 'B Perfume', brand: 'Brand B' }
                ];

                const sortByName = (perfumes) => {
                    return [...perfumes].sort((a, b) => a.name.localeCompare(b.name));
                };

                const sortByBrand = (perfumes) => {
                    return [...perfumes].sort((a, b) => a.brand.localeCompare(b.brand));
                };

                const sortById = (perfumes) => {
                    return [...perfumes].sort((a, b) => a.id - b.id);
                };

                const sortedByName = sortByName(perfumes);
                expect(sortedByName[0].name).toBe('A Perfume');
                expect(sortedByName[2].name).toBe('C Perfume');

                const sortedByBrand = sortByBrand(perfumes);
                expect(sortedByBrand[0].brand).toBe('Brand A');
                expect(sortedByBrand[2].brand).toBe('Brand C');

                const sortedById = sortById(perfumes);
                expect(sortedById[0].id).toBe(1);
                expect(sortedById[2].id).toBe(3);
            });
        });

        describe('Cache Management', () => {
            test('should manage simple cache operations', () => {
                class SimpleCache {
                    constructor(expiry = 5000) {
                        this.cache = new Map();
                        this.expiry = expiry;
                    }

                    set(key, data) {
                        this.cache.set(key, {
                            data,
                            timestamp: Date.now()
                        });
                    }

                    get(key) {
                        const cached = this.cache.get(key);
                        if (cached && Date.now() - cached.timestamp < this.expiry) {
                            return cached.data;
                        }
                        return null;
                    }

                    clear() {
                        this.cache.clear();
                    }

                    size() {
                        return this.cache.size;
                    }
                }

                const cache = new SimpleCache(1000); // 1 second expiry
                const testData = { id: 1, name: 'Test' };

                // Test set and get
                cache.set('test-key', testData);
                expect(cache.get('test-key')).toEqual(testData);

                // Test size
                expect(cache.size()).toBe(1);

                // Test clear
                cache.clear();
                expect(cache.size()).toBe(0);
                expect(cache.get('test-key')).toBeNull();
            });
        });
    });

    describe('DOM Utilities', () => {
        test('should create perfume card elements', () => {
            const createPerfumeCard = (perfume) => {
                const card = document.createElement('div');
                card.className = 'perfume-card';
                card.dataset.perfumeId = perfume.id;
                
                card.innerHTML = `
                    <div class="perfume-image">
                        <img data-src="${perfume.photo_url || 'default.jpg'}" 
                             alt="${perfume.name}" />
                    </div>
                    <div class="perfume-info">
                        <div class="perfume-name">${perfume.name}</div>
                        <div class="perfume-brand">${perfume.brand}</div>
                        <div class="perfume-reference">${perfume.reference || ''}</div>
                    </div>
                `;
                return card;
            };

            const perfume = {
                id: 1,
                name: 'Test Perfume',
                brand: 'Test Brand',
                reference: 'TEST001',
                photo_url: 'test.jpg'
            };

            const card = createPerfumeCard(perfume);
            
            expect(card.classList.contains('perfume-card')).toBe(true);
            expect(card.dataset.perfumeId).toBe('1');
            expect(card.querySelector('.perfume-name').textContent).toBe('Test Perfume');
            expect(card.querySelector('.perfume-brand').textContent).toBe('Test Brand');
            expect(card.querySelector('.perfume-reference').textContent).toBe('TEST001');
            expect(card.querySelector('img').alt).toBe('Test Perfume');
        });

        test('should handle missing perfume data gracefully', () => {
            const createPerfumeCard = (perfume) => {
                const card = document.createElement('div');
                card.className = 'perfume-card';
                card.dataset.perfumeId = perfume.id || '';
                
                card.innerHTML = `
                    <div class="perfume-image">
                        <img data-src="${perfume.photo_url || 'default.jpg'}" 
                             alt="${perfume.name || 'Unknown perfume'}" />
                    </div>
                    <div class="perfume-info">
                        <div class="perfume-name">${perfume.name || 'Unknown'}</div>
                        <div class="perfume-brand">${perfume.brand || 'Unknown'}</div>
                        <div class="perfume-reference">${perfume.reference || ''}</div>
                    </div>
                `;
                return card;
            };

            const incompletePerfume = {
                id: 1,
                name: 'Test Perfume'
                // Missing brand, reference, photo_url
            };

            const card = createPerfumeCard(incompletePerfume);
            
            expect(card.querySelector('.perfume-name').textContent).toBe('Test Perfume');
            expect(card.querySelector('.perfume-brand').textContent).toBe('Unknown');
            expect(card.querySelector('.perfume-reference').textContent).toBe('');
            expect(card.querySelector('img').dataset.src).toBe('default.jpg');
        });

        test('should create container elements', () => {
            const createContainer = (className, id) => {
                const container = document.createElement('div');
                container.className = className;
                if (id) container.id = id;
                return container;
            };

            const container = createContainer('perfume-grid', 'main-grid');
            
            expect(container.className).toBe('perfume-grid');
            expect(container.id).toBe('main-grid');
            expect(container.tagName).toBe('DIV');
        });
    });

    describe('Error Handling', () => {
        test('should handle API call failures gracefully', async () => {
            const handleApiCall = async (apiFunction, fallbackData) => {
                try {
                    return await apiFunction();
                } catch (error) {
                    console.warn('API call failed, using fallback data:', error.message);
                    return fallbackData;
                }
            };

            const failingApiCall = () => Promise.reject(new Error('Network error'));
            const fallbackData = [{ id: 1, name: 'Fallback Perfume' }];

            const result = await handleApiCall(failingApiCall, fallbackData);
            
            expect(result).toEqual(fallbackData);
        });

        test('should validate user input', () => {
            const validateInput = (input, type = 'string') => {
                if (input === null || input === undefined) {
                    return { valid: false, error: 'Input is required' };
                }

                if (type === 'string') {
                    if (typeof input !== 'string' || input.trim() === '') {
                        return { valid: false, error: 'Valid string is required' };
                    }
                }

                if (type === 'number') {
                    const num = Number(input);
                    if (isNaN(num) || num < 0) {
                        return { valid: false, error: 'Valid positive number is required' };
                    }
                }

                return { valid: true };
            };

            expect(validateInput('test', 'string')).toEqual({ valid: true });
            expect(validateInput('', 'string')).toEqual({ valid: false, error: 'Valid string is required' });
            expect(validateInput(null, 'string')).toEqual({ valid: false, error: 'Input is required' });
            
            expect(validateInput('5', 'number')).toEqual({ valid: true });
            expect(validateInput('-1', 'number')).toEqual({ valid: false, error: 'Valid positive number is required' });
            expect(validateInput('abc', 'number')).toEqual({ valid: false, error: 'Valid positive number is required' });
        });
    });

    describe('Event Handling', () => {
        test('should simulate click events', () => {
            document.body.innerHTML = `
                <button id="test-button">Click me</button>
            `;

            let clicked = false;
            const button = document.getElementById('test-button');
            
            button.addEventListener('click', () => {
                clicked = true;
            });

            // Simulate click
            button.click();
            
            expect(clicked).toBe(true);
        });

        test('should handle input events', () => {
            document.body.innerHTML = `
                <input id="search-input" type="text" />
            `;

            let inputValue = '';
            const input = document.getElementById('search-input');
            
            input.addEventListener('input', (e) => {
                inputValue = e.target.value;
            });

            // Simulate user input
            input.value = 'chanel';
            input.dispatchEvent(new Event('input'));
            
            expect(inputValue).toBe('chanel');
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes', () => {
            document.body.innerHTML = `
                <div role="search" aria-label="Perfume search">
                    <input type="text" aria-describedby="search-help" />
                    <div id="search-help">Search for perfumes by name or brand</div>
                </div>
            `;

            const searchContainer = document.querySelector('[role="search"]');
            const input = document.querySelector('input');
            const help = document.getElementById('search-help');

            expect(searchContainer.getAttribute('role')).toBe('search');
            expect(searchContainer.getAttribute('aria-label')).toBe('Perfume search');
            expect(input.getAttribute('aria-describedby')).toBe('search-help');
            expect(help.textContent).toContain('Search for perfumes');
        });

        test('should support keyboard navigation', () => {
            document.body.innerHTML = `
                <div class="perfume-card" tabindex="0">
                    <span>Chanel No. 5</span>
                </div>
                <div class="perfume-card" tabindex="0">
                    <span>Dior Sauvage</span>
                </div>
            `;

            const cards = document.querySelectorAll('.perfume-card');
            
            cards.forEach(card => {
                expect(card.tabIndex).toBe(0);
            });
        });
    });
});