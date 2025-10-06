// Main Controller - Orchestrates module initialization and coordinates between modules
import { NavigationModule } from './navigation.js';
import { AnimationsModule } from './animations.js';
import { UIUtilsModule } from './uiUtils.js';
import { FragranceDataModule } from './fragranceData.js';
import { CatalogModule } from './catalog.js';

class EdenWebsiteController {
    constructor() {
        this.modules = {
            navigation: new NavigationModule(),
            animations: new AnimationsModule(),
            uiUtils: new UIUtilsModule(),
            fragranceData: new FragranceDataModule(),
            catalog: new CatalogModule()
        };
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize error monitoring if available
            this.initializeErrorMonitoring();
            
            // Initialize social media popup functionality
            this.initializeSocialPopup();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Initialize page-specific functionality
            this.initializePageSpecificFeatures();
            
            this.isInitialized = true;
            
            // Dispatch initialization complete event
            window.dispatchEvent(new CustomEvent('edenWebsiteInitialized', {
                detail: { modules: Object.keys(this.modules) }
            }));
            
        } catch (error) {
            console.error('Failed to initialize Eden Website:', error);
            this.showInitializationError();
        }
    }

    initializeErrorMonitoring() {
        if (window.ErrorMonitor) {
            // Error monitoring system is active
        } else {
            // Error monitoring system not loaded
        }
    }

    initializeSocialPopup() {
        if (typeof initializeSocialPopup === 'function') {
            initializeSocialPopup();
        }
    }

    async initializeModules() {
        // Initialize data module first (other modules depend on it)
        this.modules.fragranceData.init();
        
        // Initialize UI utilities early (needed for error handling)
        this.modules.uiUtils.init();
        
        // Initialize navigation
        this.modules.navigation.init();
        
        // Initialize animations
        this.modules.animations.init();
        
        // Initialize catalog (will only run on catalog pages)
        this.modules.catalog.init();
        
        // Setup global utilities for backwards compatibility
        this.setupGlobalUtilities();
    }

    setupGlobalUtilities() {
        // Make utility functions globally available for backwards compatibility
        window.scrollToSection = (sectionId) => {
            this.modules.navigation.constructor.scrollToSectionById(sectionId);
        };
        
        window.openWhatsApp = (message = '') => {
            const phoneNumber = '213661808980';
            const defaultMessage = 'Hello EDEN PARFUM! I would like to inquire about your perfume collection.';
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;
            window.open(whatsappUrl, '_blank');
        };
        
        window.openMap = () => {
            const mapsUrl = 'https://www.google.com/maps/place/Eden+parfum/@36.7585922,3.0554277,17z/data=!3m1!4b1!4m6!3m5!1s0x128fb30018c34e03:0x69b304bc5ec91959!8m2!3d36.7585922!4d3.0554277!16s%2Fg%2F11w2cyhqj_';
            window.open(mapsUrl, '_blank');
        };
        
        window.showNotification = (message, type = 'info') => {
            this.modules.uiUtils.showNotification(message, type);
        };
        
        window.showLoadingIndicator = (targetElement) => {
            this.modules.uiUtils.showLoadingIndicator(targetElement);
        };
        
        window.hideLoadingIndicator = (targetElement) => {
            this.modules.uiUtils.hideLoadingIndicator(targetElement);
        };
        
        window.showErrorMessage = (message, type = 'error') => {
            this.modules.uiUtils.showErrorMessage(message, type);
        };
        
        window.getFragranceImage = (perfume) => {
            return this.modules.fragranceData.getFragranceImage(perfume);
        };
        
        window.getBrandLogo = (brand) => {
            return this.modules.fragranceData.getBrandLogo(brand);
        };
        
        // Future implementation placeholders
        window.searchPerfumes = (query) => {
            if (this.modules.catalog.isInitialized) {
                this.modules.catalog.searchPerfumes(query);
            }
        };
        
        window.subscribeNewsletter = (email) => {
            // Future implementation
            this.modules.uiUtils.showNotification('Newsletter subscription coming soon!', 'info');
        };
        
        window.filterProducts = (category) => {
            // Future implementation
            this.modules.uiUtils.showNotification('Product filtering coming soon!', 'info');
        };
        
        window.addToWishlist = (productId) => {
            // Future implementation
            this.modules.uiUtils.showNotification('Wishlist functionality coming soon!', 'info');
        };
        
        window.toggleLanguage = (lang) => {
            // Future implementation
            this.modules.uiUtils.showNotification('Language switching coming soon!', 'info');
        };
    }

    setupPerformanceMonitoring() {
        // Performance monitoring for catalog loading
        this.monitorCatalogPerformance();
        
        // Preload critical brand logos for instant display
        this.preloadCriticalAssets();
    }

    monitorCatalogPerformance() {
        const startTime = Date.now();
        let perfumeCardsLoaded = 0;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('perfume-item')) {
                        perfumeCardsLoaded++;
                    }
                });
            });
        });
        
        const resultsContainer = document.getElementById('perfumeResults');
        if (resultsContainer) {
            observer.observe(resultsContainer, { childList: true, subtree: true });
        }
    }

    preloadCriticalAssets() {
        if (window.fastImageLoader) {
            const criticalBrandLogos = [
                'chanel.png', 'dior.png', 'gucci-1-logo-black-and-white.png',
                'louis-vuitton-1-logo-black-and-white.png', 'armani.png', 'hugo boss.png'
            ];
            
            criticalBrandLogos.forEach(logo => {
                const preloadImg = new Image();
                preloadImg.src = `photos/${logo}`;
            });
            
            // Preload first few fragrance images when API data loads
            window.addEventListener('perfumesLoaded', (event) => {
                if (event.detail && event.detail.perfumes) {
                    const firstSix = event.detail.perfumes.slice(0, 6);
                    const imageNames = firstSix
                        .map(p => this.modules.fragranceData.getFragranceImage(p))
                        .filter(imageName => imageName && imageName !== null);
                    window.fastImageLoader.preloadCriticalImages(imageNames);
                }
            });
        }
    }

    initializePageSpecificFeatures() {
        // Map error handling
        setTimeout(() => {
            this.modules.uiUtils.checkMapLoaded();
        }, 3000);
    }

    showInitializationError() {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-overlay';
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
        `;
        errorElement.innerHTML = `
            <strong>Initialization Error</strong><br>
            Some features may not work properly. Please refresh the page.
        `;
        document.body.appendChild(errorElement);
    }

    // Public API methods
    getModule(moduleName) {
        return this.modules[moduleName];
    }

    reinitialize() {
        this.isInitialized = false;
        return this.init();
    }

    // Utility methods for external access
    showNotification(message, type = 'info') {
        this.modules.uiUtils.showNotification(message, type);
    }

    searchCatalog(query) {
        if (this.modules.catalog.isInitialized) {
            this.modules.catalog.searchPerfumes(query);
        }
    }

    scrollToSection(sectionId) {
        this.modules.navigation.constructor.scrollToSectionById(sectionId);
    }

    triggerAnimation(element) {
        this.modules.animations.triggerAnimation(element);
    }
}

// Create global instance
const edenWebsite = new EdenWebsiteController();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    edenWebsite.init();
});

// Export for manual control if needed
export default edenWebsite;
export { EdenWebsiteController };