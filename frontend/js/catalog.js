// Catalog Module - Handles perfume catalog display, search, filtering, and interactions
import { getFragranceImage, getBrandLogo } from './fragranceData.js';
import { showLoadingIndicator, hideLoadingIndicator, showErrorMessage } from './uiUtils.js';
import { 
    debounce, 
    searchInFields, 
    setupSearchShortcuts, 
    getSearchStats,
    normalizeText
} from './searchUtils.js';

export class CatalogModule {
    constructor() {
        this.filteredPerfumes = [];
        this.currentSearchTerm = '';
        this.currentBrandFilter = '';
        this.currentGenderFilter = '';
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) {
            return;
        }
        
        const isCatalogPage = this.isCatalogPage();
        
        if (isCatalogPage) {
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
        
        // Listen for brand logos loaded event - refresh display to show new logos
        window.addEventListener('brandLogosLoaded', (event) => {
            if (this.isCatalogPage() && this.filteredPerfumes.length > 0) {
                console.log('🎨 Brand logos updated, refreshing display...');
                this.displayPerfumes();
            }
        });
    }

    async initializeCatalog() {
        if (!this.isCatalogPage()) {
            return;
        }

        showLoadingIndicator();
        
        try {
            // FORCE CLEAR any cached offline data that might interfere
            window.offlinePerfumeData = null;
            window.perfumesDatabase = null;
            delete window.offlinePerfumeData;
            delete window.perfumesDatabase;
            
            // Clear localStorage and sessionStorage just in case
            try {
                localStorage.removeItem('perfumesDatabase');
                localStorage.removeItem('offlinePerfumeData');
                sessionStorage.removeItem('perfumesDatabase');
                sessionStorage.removeItem('offlinePerfumeData');
            } catch (e) {
                // Silent storage clear
            }
            
            await this.loadPerfumeData();
        } catch (error) {
            showErrorMessage('Failed to load perfume catalog. Please try again later.');
        }
    }

    async loadPerfumeData() {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const response = await window.edenAPI.getPerfumes({ limit: 506 });

            if (!response.success) {
                throw new Error('API returned unsuccessful response');
            }

            const perfumes = Array.isArray(response.data) ? response.data : null;

            if (perfumes && perfumes.length > 0) {
                const convertedPerfumes = window.edenAPI.convertToLegacyFormat(perfumes);
                
                // Store in global variable for compatibility with existing code
                window.perfumesDatabase = convertedPerfumes;
                
                // Clear any cached offline data to prevent conflicts
                window.offlinePerfumeData = null;

                const totalCount = (typeof response.total === 'number' && response.total >= perfumes.length)
                    ? response.total
                    : perfumes.length;

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                    detail: {
                        perfumes,
                        total: totalCount,
                        offline: false
                    }
                }));
                
                this.setupCatalogWithData();
            } else {
                throw new Error('No data received from API');
            }
            
        } catch (error) {
            // Fallback to offline data if available
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
        
        // Restore search term
        const searchParam = urlParams.get('search');
        if (searchParam) {
            this.currentSearchTerm = searchParam;
            const searchInput = document.getElementById('perfumeSearch');
            if (searchInput) {
                searchInput.value = searchParam;
            }
        }
        
        // Restore brand filter
        const brandParam = urlParams.get('brand');
        if (brandParam) {
            this.currentBrandFilter = brandParam;
            const brandFilter = document.getElementById('brandFilter');
            if (brandFilter) {
                brandFilter.value = brandParam;
            }
        }
        
        // Restore gender filter
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
        genderFilter.innerHTML = '<option value="">All Categories</option>';

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
        
        // Setup keyboard shortcuts (Ctrl+K to focus, Escape to clear)
        setupSearchShortcuts(searchInput, () => {
            this.currentSearchTerm = '';
            this.filterPerfumes();
        });
        
        // Search input with optimized debounce
        const debouncedSearch = debounce(() => {
            this.currentSearchTerm = searchInput.value;
            this.filterPerfumes();
            this.updateUrlWithFilters();
        }, 250);
        
        searchInput.addEventListener('input', debouncedSearch);
        
        // Brand filter
        brandFilter.addEventListener('change', () => {
            this.currentBrandFilter = brandFilter.value;
            this.filterPerfumes();
            this.updateUrlWithFilters();
        });
        
        // Gender filter
        genderFilter.addEventListener('change', () => {
            this.currentGenderFilter = genderFilter.value;
            this.filterPerfumes();
            this.updateUrlWithFilters();
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
                this.updateUrlWithFilters();
            });
        }
    }
    
    updateUrlWithFilters() {
        // Update URL with current filters (without page reload)
        const params = new URLSearchParams();
        
        if (this.currentSearchTerm) params.set('search', this.currentSearchTerm);
        if (this.currentBrandFilter) params.set('brand', this.currentBrandFilter);
        if (this.currentGenderFilter) {
            const genderMap = {
                'Men': 'men',
                'Women': 'women',
                'Unisex': 'unisex'
            };
            params.set('gender', genderMap[this.currentGenderFilter] || this.currentGenderFilter.toLowerCase());
        }
        
        const newUrl = params.toString() ? 
            `${window.location.pathname}?${params.toString()}` : 
            window.location.pathname;
        
        window.history.replaceState({}, '', newUrl);
    }

    filterPerfumes() {
        if (!window.perfumesDatabase) {
            return;
        }
        
        this.filteredPerfumes = window.perfumesDatabase.filter(perfume => {
            // Enhanced search - matches name, brand, or reference with accent-insensitive, multi-word support
            const matchesSearch = !this.currentSearchTerm || 
                searchInFields(perfume, ['name', 'brand'], this.currentSearchTerm) ||
                (perfume.reference && normalizeText(perfume.reference).includes(normalizeText(this.currentSearchTerm)));
            
            // Brand filter - exact match (case-insensitive)
            const matchesBrand = !this.currentBrandFilter || 
                perfume.brand === this.currentBrandFilter;
            
            // Gender filter - exact match with Mixte/Unisex compatibility
            const perfumeGender = perfume.gender || '';
            const matchesGender = !this.currentGenderFilter || 
                perfumeGender === this.currentGenderFilter ||
                (this.currentGenderFilter === 'Unisex' && (perfumeGender === 'Mixte' || perfumeGender === 'Unisex')) ||
                (this.currentGenderFilter === 'Mixte' && (perfumeGender === 'Unisex' || perfumeGender === 'Mixte'));
            
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
        
        // Get image URL with multiple fallbacks
        const fragranceImage = getFragranceImage(perfume);
        let imageUrl = 'photos/placeholder.svg';
        if (fragranceImage) {
            imageUrl = fragranceImage;
        } else if (perfume.image_url) {
            imageUrl = perfume.image_url;
        } else if (perfume.image) {
            imageUrl = perfume.image;
        }
        
        const brandSection = brandLogo 
            ? `<div class="perfume-brand">
                   <img src="${brandLogo}" alt="${perfume.brand}" class="brand-logo" loading="lazy">
                   <span>${perfume.brand || 'No Brand'}</span>
               </div>`
            : `<div class="perfume-brand">
                   <span>${perfume.brand || 'No Brand'}</span>
               </div>`;
        
        // Create the structure with image directly in HTML
        item.innerHTML = `
            ${perfume.multiplier ? `<div class="price-multiplier">${perfume.multiplier}</div>` : ''}
            <div class="perfume-image">
                <img src="${imageUrl}" alt="${perfume.name}" class="fragrance-image" loading="lazy">
            </div>
            <div class="perfume-header">
                <div class="perfume-name">${perfume.name}</div>
                <div class="perfume-reference">#${perfume.reference}</div>
            </div>
            <div class="perfume-details">
                ${brandSection}
                <div class="perfume-gender">${perfume.gender}</div>
            </div>
        `;
        
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