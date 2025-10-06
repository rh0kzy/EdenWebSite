// Catalog Module - Handles perfume catalog display, search, filtering, and interactions
import { getFragranceImage, getBrandLogo } from './fragranceData.js';
import { showLoadingIndicator, hideLoadingIndicator, showErrorMessage } from './uiUtils.js';

export class CatalogModule {
    constructor() {
        this.filteredPerfumes = [];
        this.currentSearchTerm = '';
        this.currentBrandFilter = '';
        this.currentGenderFilter = '';
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // Only initialize catalog if we're on a page with catalog elements
        if (this.isCatalogPage()) {
            this.initializeCatalog();
        }

        this.setupEventListeners();
        this.isInitialized = true;
    }

    isCatalogPage() {
        return document.getElementById('brandFilter') && document.getElementById('genderFilter');
    }

    setupEventListeners() {
        // Listen for perfumes loaded event
        window.addEventListener('perfumesLoaded', (event) => {
            if (this.isCatalogPage()) {
                this.setupCatalogWithData();
            }
        });
    }

    async initializeCatalog() {
        if (!this.isCatalogPage()) {
            return;
        }

        showLoadingIndicator();
        
        try {
            // Check if perfumes database is already loaded
            if (window.perfumesDatabase && window.perfumesDatabase.length > 0) {
                this.setupCatalogWithData();
            } else {
                // Load data from API
                await this.loadPerfumeData();
            }
        } catch (error) {
            showErrorMessage('Failed to load perfume catalog. Please try again later.');
        }
    }

    async loadPerfumeData() {
        let response;
        try {
            console.log('🔄 Starting direct API call...');
            
            // Small delay to ensure other scripts don't interfere
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use XMLHttpRequest directly to avoid fetch interception issues
            response = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/api/v2/perfumes?limit=506');
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({
                            ok: true,
                            status: xhr.status,
                            json: () => Promise.resolve(JSON.parse(xhr.responseText))
                        });
                    } else {
                        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                    }
                };
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send();
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const apiData = await response.json();
            console.log('✅ Direct API call successful:', apiData);

            const perfumes = Array.isArray(apiData?.data)
                ? apiData.data
                : (Array.isArray(apiData) ? apiData : null);

            if (perfumes && perfumes.length > 0) {
                // Store in global variable for compatibility with existing code
                window.perfumesDatabase = perfumes;

                const totalCount = (typeof apiData?.total === 'number' && apiData.total >= perfumes.length)
                    ? apiData.total
                    : perfumes.length;

                console.log(`✅ Loaded ${perfumes.length} perfumes directly from API (total: ${totalCount})`);

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                    detail: {
                        perfumes,
                        total: totalCount,
                        offline: false
                    }
                }));
                
                // Set up catalog with the loaded data
                this.setupCatalogWithData();
            } else {
                throw new Error('No data received from API');
            }
            
        } catch (error) {
            console.error('❌ Direct API call failed:', error);
            console.log('🔄 Falling back to offline data...');
            
            // Try fallback to offline data if available
            if (window.offlinePerfumeData) {
                window.perfumesDatabase = window.offlinePerfumeData.perfumes;
                
                window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                    detail: { 
                        perfumes: window.offlinePerfumeData.perfumes,
                        total: window.offlinePerfumeData.perfumes.length,
                        offline: true
                    }
                }));
                
                this.setupCatalogWithData();
            } else {
                throw error;
            }
        }
    }

    setupCatalogWithData() {
        if (!this.isCatalogPage()) {
            return;
        }

        hideLoadingIndicator();
        
        // Check if perfumes database is loaded
        if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
            showErrorMessage('No perfumes found. Please try again later.');
            return;
        }
        
        // Initialize filters
        this.populateFilters();
        
        // Check for URL parameters and apply filters
        this.applyUrlParameters();
        
        // Initialize search
        this.filteredPerfumes = [...window.perfumesDatabase];
        
        // Sort by reference number numerically (1105, 1106, etc.)
        this.sortPerfumes();
        
        // Apply any URL-based filters
        if (this.currentGenderFilter) {
            this.filterPerfumes();
        } else {
            this.displayPerfumes();
            this.updateResultsCount();
        }
        
        // Add event listeners
        this.setupSearchEventListeners();
    }

    applyUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const genderParam = urlParams.get('gender');
        
        if (genderParam) {
            // Convert URL parameter to the format used in the database
            let genderValue = '';
            if (genderParam === 'men') {
                genderValue = 'Men';
            } else if (genderParam === 'women') {
                genderValue = 'Women';
            } else if (genderParam === 'unisex') {
                genderValue = 'Unisex';
            }
            
            // Set the gender filter
            if (genderValue) {
                this.currentGenderFilter = genderValue;
                const genderFilterSelect = document.getElementById('genderFilter');
                if (genderFilterSelect) {
                    genderFilterSelect.value = genderValue;
                }
            }
        }
    }

    sortPerfumes() {
        this.filteredPerfumes.sort((a, b) => {
            const refA = parseInt(a.reference) || 0;
            const refB = parseInt(b.reference) || 0;
            return refA - refB;
        });
    }

    getUniqueBrands() {
        if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
            return [];
        }
        const brands = [...new Set(window.perfumesDatabase.map(perfume => perfume.brand).filter(brand => brand && brand.trim() !== ''))];
        return brands.sort();
    }

    getUniqueGenders() {
        if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
            return [];
        }
        const genders = [...new Set(window.perfumesDatabase.map(perfume => perfume.gender).filter(gender => gender))];
        return genders.sort();
    }

    populateFilters() {
        const brandFilter = document.getElementById('brandFilter');
        const genderFilter = document.getElementById('genderFilter');
        
        if (!brandFilter || !genderFilter) {
            return;
        }

        // Clear existing options except the first "All" option
        brandFilter.innerHTML = '<option value="">All Brands</option>';
        genderFilter.innerHTML = '<option value="">All Genders</option>';

        // Populate brand filter
        const brands = this.getUniqueBrands();
        if (brands && Array.isArray(brands)) {
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandFilter.appendChild(option);
            });
        }

        // Populate gender filter
        const genders = this.getUniqueGenders();
        if (genders && Array.isArray(genders)) {
            genders.forEach(gender => {
                const option = document.createElement('option');
                option.value = gender;
                option.textContent = gender;
                genderFilter.appendChild(option);
            });
        }
    }

    setupSearchEventListeners() {
        const searchInput = document.getElementById('perfumeSearch');
        const brandFilter = document.getElementById('brandFilter');
        const genderFilter = document.getElementById('genderFilter');
        const clearButton = document.getElementById('clearFilters');
        
        if (!searchInput || !brandFilter || !genderFilter) return;
        
        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentSearchTerm = searchInput.value.toLowerCase();
                this.filterPerfumes();
            }, 300);
        });
        
        // Brand filter
        brandFilter.addEventListener('change', () => {
            this.currentBrandFilter = brandFilter.value;
            this.filterPerfumes();
        });
        
        // Gender filter
        genderFilter.addEventListener('change', () => {
            this.currentGenderFilter = genderFilter.value;
            this.filterPerfumes();
        });
        
        // Clear filters
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                brandFilter.value = '';
                genderFilter.value = '';
                this.currentSearchTerm = '';
                this.currentBrandFilter = '';
                this.currentGenderFilter = '';
                this.filterPerfumes();
            });
        }
    }

    filterPerfumes() {
        if (!window.perfumesDatabase) {
            return;
        }
        
        this.filteredPerfumes = window.perfumesDatabase.filter(perfume => {
            // Search term filter
            const matchesSearch = !this.currentSearchTerm || 
                perfume.name.toLowerCase().includes(this.currentSearchTerm) ||
                perfume.brand.toLowerCase().includes(this.currentSearchTerm) ||
                perfume.reference.toLowerCase().includes(this.currentSearchTerm);
            
            // Brand filter
            const matchesBrand = !this.currentBrandFilter || perfume.brand === this.currentBrandFilter;
            
            // Gender filter
            const matchesGender = !this.currentGenderFilter || perfume.gender === this.currentGenderFilter;
            
            return matchesSearch && matchesBrand && matchesGender;
        });
        
        this.sortPerfumes();
        this.displayPerfumes();
        this.updateResultsCount();
    }

    displayPerfumes() {
        const resultsContainer = document.getElementById('perfumeResults');
        const noResultsDiv = document.getElementById('noResults');
        
        if (!resultsContainer) return;
        
        if (this.filteredPerfumes.length === 0) {
            resultsContainer.style.display = 'none';
            if (noResultsDiv) noResultsDiv.style.display = 'block';
            return;
        }
        
        resultsContainer.style.display = 'grid';
        if (noResultsDiv) noResultsDiv.style.display = 'none';
        
        resultsContainer.innerHTML = '';
        
        this.filteredPerfumes.forEach(perfume => {
            const perfumeItem = this.createPerfumeItem(perfume);
            resultsContainer.appendChild(perfumeItem);
        });
    }

    createPerfumeItem(perfume) {
        const item = document.createElement('div');
        item.className = 'perfume-item';
        
        const brandLogo = getBrandLogo(perfume.brand);
        const fragranceImageName = getFragranceImage(perfume);
        
        const brandSection = brandLogo 
            ? `<div class="perfume-brand">
                   <img src="${brandLogo}" alt="${perfume.brand}" class="brand-logo" loading="lazy">
                   <span>${perfume.brand || 'No Brand'}</span>
               </div>`
            : `<div class="perfume-brand">
                   <span>${perfume.brand || 'No Brand'}</span>
               </div>`;
        
        // Create the basic structure
        item.innerHTML = `
            ${perfume.multiplier ? `<div class="price-multiplier">${perfume.multiplier}</div>` : ''}
            <div class="perfume-image"></div>
            <div class="perfume-header">
                <div class="perfume-name">${perfume.name}</div>
                <div class="perfume-reference">#${perfume.reference}</div>
            </div>
            <div class="perfume-details">
                ${brandSection}
                <div class="perfume-gender">${perfume.gender}</div>
            </div>
        `;
        
        // Add optimized image using fast loader
        const imageContainer = item.querySelector('.perfume-image');
        if (fragranceImageName && fragranceImageName !== null) {
            if (window.createOptimizedImage) {
                const optimizedImg = window.createOptimizedImage(
                    fragranceImageName, 
                    `${perfume.name} by ${perfume.brand}`, 
                    'fragrance-image', 
                    'medium'
                );
                imageContainer.appendChild(optimizedImg);
            } else {
                // Fallback for when fast loader isn't available
                imageContainer.innerHTML = `<img src="${fragranceImageName}" alt="${perfume.name}" class="fragrance-image" loading="lazy">`;
            }
        } else {
            // Default placeholder
            imageContainer.innerHTML = '<div class="perfume-image-placeholder"><i class="fas fa-spray-can"></i></div>';
        }
        
        // Add click handler for WhatsApp integration
        item.addEventListener('click', () => {
            this.showPerfumeDetails(perfume);
        });
        
        return item;
    }

    showPerfumeDetails(perfume) {
        const message = `Hi! I'm interested in ${perfume.name} (${perfume.brand}) - Reference #${perfume.reference}. Is it available?`;
        const whatsappUrl = `https://wa.me/213661808980?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        
        if (!countElement) return;
        
        if (!window.perfumesDatabase) {
            countElement.textContent = 'Loading perfumes...';
            return;
        }
        
        const total = window.perfumesDatabase.length;
        const showing = this.filteredPerfumes.length;
        
        if (showing === total) {
            countElement.textContent = `Showing all ${total} perfumes`;
        } else {
            countElement.textContent = `Showing ${showing} of ${total} perfumes`;
        }
    }

    // Public methods for external use
    searchPerfumes(query) {
        this.currentSearchTerm = query.toLowerCase();
        this.filterPerfumes();
    }

    filterByBrand(brand) {
        this.currentBrandFilter = brand;
        this.filterPerfumes();
    }

    filterByGender(gender) {
        this.currentGenderFilter = gender;
        this.filterPerfumes();
    }

    clearAllFilters() {
        this.currentSearchTerm = '';
        this.currentBrandFilter = '';
        this.currentGenderFilter = '';
        
        const searchInput = document.getElementById('perfumeSearch');
        const brandFilter = document.getElementById('brandFilter');
        const genderFilter = document.getElementById('genderFilter');
        
        if (searchInput) searchInput.value = '';
        if (brandFilter) brandFilter.value = '';
        if (genderFilter) genderFilter.value = '';
        
        this.filterPerfumes();
    }

    // Get current filter state
    getFilterState() {
        return {
            searchTerm: this.currentSearchTerm,
            brand: this.currentBrandFilter,
            gender: this.currentGenderFilter,
            totalResults: this.filteredPerfumes.length,
            totalPerfumes: window.perfumesDatabase ? window.perfumesDatabase.length : 0
        };
    }
}

// Export utility functions for backwards compatibility
export function initializeCatalog() {
    const catalog = new CatalogModule();
    catalog.initializeCatalog();
}

export function setupCatalogWithData() {
    const catalog = new CatalogModule();
    catalog.setupCatalogWithData();
}

export function filterPerfumes() {
    const catalog = new CatalogModule();
    catalog.filterPerfumes();
}

export function searchPerfumes(query) {
    const catalog = new CatalogModule();
    catalog.searchPerfumes(query);
}