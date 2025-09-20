// Fast Image Loading Utilities for Eden Parfum
// Optimized for performance and user experience

class FastImageLoader {
    constructor() {
        this.imageCache = new Map();
        this.loadingQueue = [];
        this.isProcessing = false;
        this.observer = null;
        this.initLazyLoading();
    }

    // Initialize Intersection Observer for lazy loading
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px', // Start loading 100px before entering viewport
                threshold: 0.1
            });
        }
    }

    // Optimized image URL generation with size parameters
    getOptimizedImageUrl(imageName, size = 'medium') {
        const sizes = {
            thumbnail: { width: 150, quality: 70 },
            small: { width: 250, quality: 75 },
            medium: { width: 400, quality: 80 },
            large: { width: 600, quality: 85 }
        };

        const sizeConfig = sizes[size] || sizes.medium;
        
        // For local images, just return the path with cache busting
        return `/photos/${imageName}?w=${sizeConfig.width}&q=${sizeConfig.quality}&t=${Date.now()}`;
    }

    // Create optimized image element with lazy loading
    createLazyImage(src, alt, className = '', size = 'medium') {
        const img = document.createElement('img');
        const optimizedSrc = this.getOptimizedImageUrl(src, size);
        
        // Set up lazy loading attributes
        img.dataset.src = optimizedSrc;
        img.alt = alt;
        img.className = `lazy-image ${className}`;
        
        // Add loading placeholder
        img.style.backgroundColor = 'var(--bg-lighter)';
        img.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ccc\'%3E%3Cpath d=\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\'/%3E%3C/svg%3E")';
        img.style.backgroundSize = '50px 50px';
        img.style.backgroundRepeat = 'no-repeat';
        img.style.backgroundPosition = 'center';
        img.style.minHeight = '200px';
        
        // Add error handling
        img.onerror = () => this.handleImageError(img);
        
        // Observe for lazy loading
        if (this.observer) {
            this.observer.observe(img);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadImage(img);
        }
        
        return img;
    }

    // Load image with caching and optimization
    async loadImage(imgElement) {
        const src = imgElement.dataset.src;
        if (!src) return;

        try {
            // Check cache first
            if (this.imageCache.has(src)) {
                this.applyImage(imgElement, src);
                return;
            }

            // Show loading animation
            this.showLoadingAnimation(imgElement);

            // Preload the image
            const preloadImg = new Image();
            preloadImg.onload = () => {
                this.imageCache.set(src, true);
                this.applyImage(imgElement, src);
                this.hideLoadingAnimation(imgElement);
            };
            
            preloadImg.onerror = () => {
                this.handleImageError(imgElement);
            };

            preloadImg.src = src;

        } catch (error) {
            // Error loading image
            this.handleImageError(imgElement);
        }
    }

    // Apply loaded image with smooth transition
    applyImage(imgElement, src) {
        imgElement.style.opacity = '0';
        imgElement.style.transition = 'opacity 0.3s ease';
        
        imgElement.onload = () => {
            imgElement.style.opacity = '1';
            imgElement.style.backgroundImage = 'none';
        };
        
        imgElement.src = src;
    }

    // Show loading animation
    showLoadingAnimation(imgElement) {
        imgElement.classList.add('loading');
        imgElement.style.backgroundImage = `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6b9d'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"),
            linear-gradient(45deg, transparent 30%, rgba(255,107,157,0.1) 50%, transparent 70%)
        `;
        imgElement.style.backgroundSize = '30px 30px, 100% 100%';
        imgElement.style.animation = 'shimmer 1.5s infinite';
    }

    // Hide loading animation
    hideLoadingAnimation(imgElement) {
        imgElement.classList.remove('loading');
        imgElement.style.animation = 'none';
    }

    // Handle image loading errors
    handleImageError(imgElement) {
        imgElement.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23999\'%3E%3Cpath d=\'M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z\'/%3E%3C/svg%3E")';
        imgElement.style.backgroundSize = '50px 50px';
        imgElement.alt = 'Image not found';
        imgElement.title = 'Image could not be loaded';
        this.hideLoadingAnimation(imgElement);
    }

    // Preload critical images
    preloadCriticalImages(imageUrls) {
        imageUrls.slice(0, 6).forEach(url => { // Only preload first 6 images
            if (!this.imageCache.has(url)) {
                const img = new Image();
                img.onload = () => this.imageCache.set(url, true);
                img.src = this.getOptimizedImageUrl(url, 'small');
            }
        });
    }

    // Batch load visible images
    loadVisibleImages() {
        const lazyImages = document.querySelectorAll('img[data-src]:not([src])');
        lazyImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight + 200) { // 200px threshold
                this.loadImage(img);
            }
        });
    }

    // Progressive image enhancement
    enhanceImagesProgressively() {
        // First, load thumbnails
        setTimeout(() => {
            const images = document.querySelectorAll('.lazy-image');
            images.forEach(img => {
                if (img.dataset.src && !img.src) {
                    const thumbnailSrc = this.getOptimizedImageUrl(
                        img.dataset.src.split('?')[0].split('/').pop(), 
                        'thumbnail'
                    );
                    img.style.filter = 'blur(2px)';
                    img.src = thumbnailSrc;
                }
            });
        }, 100);

        // Then, load full resolution
        setTimeout(() => {
            this.loadVisibleImages();
        }, 500);
    }
}

// CSS for loading animations
const fastImageStyles = `
    .lazy-image {
        transition: all 0.3s ease;
        background-color: var(--bg-lightest);
    }

    .lazy-image.loading {
        background-size: 30px 30px, 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0, 0 0; }
        100% { background-position: 200% 0, 0 0; }
    }

    .perfume-image {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
    }

    .perfume-image img {
        width: 100%;
        height: auto;
        display: block;
        transition: transform 0.3s ease;
    }

    .perfume-image:hover img {
        transform: scale(1.05);
    }

    .image-error {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        background: var(--bg-lightest);
        color: var(--text-light);
        font-size: 14px;
    }

    /* Progressive enhancement styles */
    .perfume-card {
        will-change: transform;
    }

    .perfume-card img {
        will-change: opacity;
    }

    /* Responsive image sizes */
    @media (max-width: 768px) {
        .perfume-image {
            height: 150px;
        }
    }

    @media (min-width: 769px) {
        .perfume-image {
            height: 200px;
        }
    }

    @media (min-width: 1200px) {
        .perfume-image {
            height: 250px;
        }
    }
`;

// Initialize fast image loader
window.fastImageLoader = new FastImageLoader();

// Add styles to page
if (!document.getElementById('fast-image-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'fast-image-styles';
    styleSheet.textContent = fastImageStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other scripts
window.createOptimizedImage = function(imageName, alt, className = '', size = 'medium') {
    return window.fastImageLoader.createLazyImage(imageName, alt, className, size);
};

// Production: Remove debug logging