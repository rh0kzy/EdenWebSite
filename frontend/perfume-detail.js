// Eden Parfum Detail Page - Updated for Supabase API
class PerfumeDetailPage {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.perfumeId = this.getPerfumeId();
        this.init();
    }

    getApiBaseUrl() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Development environment - use the same port as the current page
            const port = window.location.port || '80';
            return `http://localhost:${port}/api/v2`;
        } else {
            // Production environment - Use API redirect
            return '/api/v2';
        }
    }

    getPerfumeId() {
        // Get reference from URL parameter - try both 'ref' and 'id' for backward compatibility
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || urlParams.get('id') || '1';
    }

    async init() {
        try {
            this.showLoadingState();
            await this.loadPerfumeData();
            this.attachEventListeners();
        } catch (error) {
            // Error initializing perfume detail page
            this.showError('Failed to load perfume details. Please try again later.');
        }
    }

    showLoadingState() {
        const container = document.querySelector('.perfume-detail-container') || document.body;
        container.innerHTML = `
            <div class="loading-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 50vh;
                flex-direction: column;
                gap: 20px;
            ">
                <div class="loading-spinner" style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #ff6b9d;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="color: #666; font-size: 18px;">Loading perfume details...</p>
            </div>
        `;
        
        // Add spinner animation if not already present
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    async loadPerfumeData() {
        try {
            // Try to find perfume by reference first
            let perfume = await this.findPerfumeByReference(this.perfumeId);
            
            // If not found by reference, try to find by ID (backward compatibility)
            if (!perfume) {
                perfume = await this.findPerfumeById(this.perfumeId);
            }
            
            if (!perfume) {
                throw new Error(`Perfume with reference/ID "${this.perfumeId}" not found`);
            }

            this.perfumeData = perfume;
            this.renderPerfumeDetails();
            
        } catch (error) {
            // Error loading perfume data
            
            // Try to load from the perfumes database as fallback
            if (window.perfumesDatabase && window.perfumesDatabase.length > 0) {
                this.loadFromLocalDatabase();
            } else {
                throw error;
            }
        }
    }

    async findPerfumeById(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/perfumes/${id}`);
            
            if (response.ok) {
                const result = await response.json();
                return result.success ? result.data : null;
            }
            return null;
        } catch (error) {
            // Failed to fetch perfume by ID
            return null;
        }
    }

    async findPerfumeByReference(reference) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/perfumes/reference/${reference}`);
            
            if (response.ok) {
                const result = await response.json();
                return result;
            }
            return null;
        } catch (error) {
            // Failed to fetch perfume by reference
            return null;
        }
    }

    loadFromLocalDatabase() {
        // Fallback to local perfumes database
        const perfume = window.perfumesDatabase.find(p => 
            p.reference === this.perfumeId || 
            p.id === this.perfumeId ||
            p.name.toLowerCase().includes(this.perfumeId.toLowerCase())
        );

        if (perfume) {
            this.perfumeData = perfume;
            this.renderPerfumeDetails();
        } else {
            throw new Error('Perfume not found in local database');
        }
    }

    renderPerfumeDetails() {
        const container = document.querySelector('.perfume-detail-container') || document.body;
        
        const perfume = this.perfumeData;
        const brandName = perfume.brand_name || perfume.brands?.name || perfume.brand;
        const perfumeName = perfume.name;
        const gender = perfume.gender;
        const concentration = perfume.concentration || 'Eau de Parfum';
        const size = perfume.size || '50ml';
        const price = perfume.price ? `$${perfume.price}` : 'Price on request';
        const category = perfume.category || 'Fragrance';
        
        // Generate image URL
        const imageUrl = this.getPerfumeImageUrl(perfume);
        const brandLogo = this.getBrandLogoUrl(brandName);

        container.innerHTML = `
            <div class="perfume-detail-content">
                <!-- Header Section -->
                <div class="perfume-header">
                    <button class="back-button" data-action="back">
                        <i class="fas fa-arrow-left"></i> Back to Catalog
                    </button>
                    <div class="breadcrumb">
                        <a href="index.html">Home</a> > 
                        <a href="catalog.html">Catalog</a> > 
                        <span>${perfumeName}</span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="perfume-main-content">
                    <!-- Left Side - Image -->
                    <div class="perfume-image-section">
                        <div class="perfume-image-container">
                       <img src="${imageUrl}" alt="${perfumeName}" class="perfume-image" />
                        </div>
                        <div class="perfume-gallery">
                            <img src="${imageUrl}" alt="${perfumeName}" class="gallery-thumb active" />
                        </div>
                    </div>

                    <!-- Right Side - Details -->
                    <div class="perfume-details-section">
                        <!-- Brand Logo -->
                        <div class="brand-header">
                       <img src="${brandLogo}" alt="${brandName}" class="brand-logo" />
                            <h1 class="brand-name">${brandName}</h1>
                        </div>

                        <!-- Perfume Name -->
                        <h2 class="perfume-name">${perfumeName}</h2>

                        <!-- Basic Info -->
                        <div class="perfume-basic-info">
                            <div class="info-item">
                                <span class="info-label">Gender:</span>
                                <span class="info-value ${gender?.toLowerCase()}">${gender}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Concentration:</span>
                                <span class="info-value">${concentration}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Size:</span>
                                <span class="info-value">${size}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Category:</span>
                                <span class="info-value">${category}</span>
                            </div>
                        </div>

                        <!-- Price -->
                        <div class="price-section">
                            <div class="price">${price}</div>
                            <div class="price-note">Best price in Morocco</div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="action-buttons">
                            <button class="whatsapp-btn" data-action="whatsapp" data-perfume="${encodeURIComponent(perfumeName)}" data-brand="${encodeURIComponent(brandName)}">
                                <i class="fab fa-whatsapp"></i>
                                Order via WhatsApp
                            </button>
                            <button class="favorite-btn" data-action="favorite" data-id="${perfume.id}">
                                <i class="far fa-heart"></i>
                                Add to Favorites
                            </button>
                        </div>

                        <!-- Description -->
                        <div class="perfume-description">
                            <h3>About This Fragrance</h3>
                            <p>${this.generateDescription(perfume)}</p>
                        </div>

                        <!-- Fragrance Notes (placeholder) -->
                        <div class="fragrance-notes">
                            <h3>Fragrance Notes</h3>
                            <div class="notes-container">
                                <div class="note-category">
                                    <h4>Top Notes</h4>
                                    <p>Fresh, sparkling opening notes</p>
                                </div>
                                <div class="note-category">
                                    <h4>Heart Notes</h4>
                                    <p>Rich, floral middle notes</p>
                                </div>
                                <div class="note-category">
                                    <h4>Base Notes</h4>
                                    <p>Warm, lasting foundation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Sections -->
                <div class="additional-info">
                    <!-- Brand Story -->
                    <div class="brand-story">
                        <h3>About ${brandName}</h3>
                        <p>${this.getBrandStory(brandName)}</p>
                    </div>

                    <!-- Similar Perfumes -->
                    <div class="similar-perfumes">
                        <h3>You Might Also Like</h3>
                        <div class="similar-grid" id="similarPerfumes">
                            <p>Loading similar perfumes...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Optimize images after DOM creation
        this.optimizeImages(container, imageUrl, perfumeName, brandLogo, brandName);
        
        // Load similar perfumes
        this.loadSimilarPerfumes();
        
        // Add CSS if not present
        this.addDetailPageStyles();
    }

    optimizeImages(container, imageUrl, perfumeName, brandLogo, brandName) {
        // Optimize main perfume image
        const mainImageContainer = container.querySelector('.perfume-image-container');
        const galleryContainer = container.querySelector('.perfume-gallery');
        
        if (mainImageContainer && window.createOptimizedImage) {
            // Replace main image with optimized version
            const imageName = imageUrl.split('/').pop();
            const optimizedImg = window.createOptimizedImage(
                imageName, 
                perfumeName, 
                'perfume-image', 
                'large'
            );
            
            mainImageContainer.innerHTML = '';
            mainImageContainer.appendChild(optimizedImg);
            
            // Also update gallery thumbnail
            if (galleryContainer) {
                const galleryImg = window.createOptimizedImage(
                    imageName, 
                    perfumeName, 
                    'gallery-thumb active', 
                    'thumbnail'
                );
                galleryContainer.innerHTML = '';
                galleryContainer.appendChild(galleryImg);
            }
        }
        
        // Optimize brand logo with lazy loading
        const brandLogoImg = container.querySelector('.brand-logo');
        if (brandLogoImg && brandLogo) {
            brandLogoImg.loading = 'lazy';
            brandLogoImg.onerror = function() { 
                this.style.display = 'none'; 
            };
        }
    }

    getPerfumeImageUrl(perfume) {
        // Try different image naming conventions
        const imageName = perfume.name?.replace(/[^a-zA-Z0-9]/g, '_');
        const brandName = (perfume.brand_name || perfume.brands?.name || perfume.brand)?.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Return the photo URL if available, otherwise try to construct it
        if (perfume.photo_url) {
            return perfume.photo_url;
        }
        
        // Try different image formats
        const possibleNames = [
            `photos/${imageName}.jpg`,
            `photos/${imageName}.png`,
            `photos/${brandName}_${imageName}.jpg`,
            `photos/${perfume.reference}.jpg`,
            `photos/default-perfume.jpg`
        ];
        
        return possibleNames[0];
    }

    getBrandLogoUrl(brandName) {
        if (!brandName) return 'photos/default-brand.png';
        
        // Brand logo mapping (simplified version)
        const brandLogos = {
            'Chanel': 'photos/chanel.png',
            'Dior': 'photos/dior.png',
            'Gucci': 'photos/gucci-1-logo-black-and-white.png',
            'Louis Vuitton': 'photos/louis-vuitton-1-logo-black-and-white.png',
            'Marc Jacobs': 'photos/marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
            'Hugo Boss': 'photos/hugo boss.png',
            'Calvin Klein': 'photos/calvin klein.svg',
            'Armani': 'photos/armani.png'
        };
        
        return brandLogos[brandName] || `photos/${brandName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    }

    generateDescription(perfume) {
        const brand = perfume.brand_name || perfume.brands?.name || perfume.brand;
        const concentration = perfume.concentration || 'Eau de Parfum';
        const category = perfume.category || 'fragrance';
        
        return `Discover ${perfume.name} by ${brand}, a captivating ${concentration} that embodies elegance and sophistication. This ${category.toLowerCase()} offers a unique olfactory experience that reflects the artistry and craftsmanship of ${brand}. Perfect for those who appreciate quality and distinction in their fragrance collection.`;
    }

    getBrandStory(brandName) {
        const brandStories = {
            'Chanel': 'Chanel is a legendary French luxury brand founded by Gabrielle "Coco" Chanel in 1910. Known for timeless elegance and revolutionary designs, Chanel fragrances like No. 5 have become iconic symbols of sophistication.',
            'Dior': 'Christian Dior founded his fashion house in 1946, and the fragrance division began in 1947 with Miss Dior. The brand represents French luxury and elegance, creating fragrances that are both classic and contemporary.',
            'Gucci': 'Founded in Florence in 1921, Gucci has become synonymous with Italian luxury and craftsmanship. Their fragrances reflect the brands bold, contemporary spirit while honoring traditional perfumery techniques.'
        };
        
        return brandStories[brandName] || `${brandName} is a distinguished fragrance house known for creating exceptional perfumes that capture the essence of luxury and elegance. Each fragrance tells a unique story and reflects the brands commitment to quality and artistry.`;
    }

    async loadSimilarPerfumes() {
        const container = document.getElementById('similarPerfumes');
        if (!container) return;

        try {
            // Get similar perfumes from the same brand or gender
            const brand = this.perfumeData.brand_name || this.perfumeData.brands?.name || this.perfumeData.brand;
            const gender = this.perfumeData.gender;
            
            const response = await fetch(`${this.apiBaseUrl}/perfumes?brand=${encodeURIComponent(brand)}&limit=4`);
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    // Filter out current perfume
                    const similarPerfumes = result.data.filter(p => p.id !== this.perfumeData.id).slice(0, 3);
                    this.renderSimilarPerfumes(similarPerfumes);
                } else {
                    container.innerHTML = '<p>No similar perfumes found.</p>';
                }
            } else {
                container.innerHTML = '<p>Unable to load similar perfumes.</p>';
            }
        } catch (error) {
            // Error loading similar perfumes
            container.innerHTML = '<p>Unable to load similar perfumes.</p>';
        }
    }

    renderSimilarPerfumes(perfumes) {
        const container = document.getElementById('similarPerfumes');
        if (!container) return;

        // Create cards with placeholder images first
        container.innerHTML = perfumes.map(perfume => `
                        <div class="similar-perfume-card" data-action="open-detail" data-ref="${perfume.reference}">
                <div class="similar-perfume-image"></div>
                <h4>${perfume.name}</h4>
                <p>${perfume.brand_name || perfume.brands?.name || perfume.brand}</p>
                <span class="price">${perfume.price ? `$${perfume.price}` : 'Price on request'}</span>
            </div>
        `).join('');

        // Add optimized images
        const cards = container.querySelectorAll('.similar-perfume-card');
        cards.forEach((card, index) => {
            const perfume = perfumes[index];
            const imageContainer = card.querySelector('.similar-perfume-image');
            const imageUrl = this.getPerfumeImageUrl(perfume);
            
            if (imageContainer && imageUrl && window.createOptimizedImage) {
                const imageName = imageUrl.split('/').pop();
                const optimizedImg = window.createOptimizedImage(
                    imageName, 
                    perfume.name, 
                    'similar-perfume-img', 
                    'small'
                );
                imageContainer.appendChild(optimizedImg);
            } else if (imageContainer) {
                // Fallback - create img element and attach error handler
                const img = document.createElement('img');
                img.src = imageUrl || 'photos/default-perfume.jpg';
                img.alt = perfume.name;
                img.loading = 'lazy';
                img.className = 'similar-perfume-img';
                img.addEventListener('error', function() {
                    this.src = 'photos/default-perfume.jpg';
                });
                imageContainer.appendChild(img);
            }
        });
    }

    orderViaWhatsApp(perfumeName, brandName) {
        const message = `Hello! I'm interested in ordering ${perfumeName} by ${brandName}. Could you please provide me with more details about availability and pricing?`;
        const whatsappNumber = '212636262660'; // Your WhatsApp number
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    toggleFavorite(perfumeId) {
        // Simple favorite functionality using localStorage
        const favorites = JSON.parse(localStorage.getItem('eden_favorites') || '[]');
        const index = favorites.indexOf(perfumeId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            this.showNotification('Removed from favorites');
        } else {
            favorites.push(perfumeId);
            this.showNotification('Added to favorites');
        }
        
        localStorage.setItem('eden_favorites', JSON.stringify(favorites));
        this.updateFavoriteButton(index === -1);
    }

    updateFavoriteButton(isFavorited) {
        const favoriteBtn = document.querySelector('.favorite-btn i');
        if (favoriteBtn) {
            favoriteBtn.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b9d;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    addDetailPageStyles() {
        if (document.getElementById('detail-page-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'detail-page-styles';
        styles.textContent = `
            .perfume-detail-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            
            .perfume-header {
                margin-bottom: 30px;
            }
            
            .back-button {
                background: #ff6b9d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-bottom: 10px;
            }
            
            .breadcrumb {
                color: #666;
                font-size: 14px;
            }
            
            .breadcrumb a {
                color: #ff6b9d;
                text-decoration: none;
            }
            
            .perfume-main-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
            }
            
            .perfume-image-container {
                text-align: center;
            }
            
            .perfume-image {
                max-width: 100%;
                height: auto;
                max-height: 400px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .brand-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .brand-logo {
                height: 50px;
                width: auto;
            }
            
            .brand-name {
                font-size: 24px;
                color: #333;
                margin: 0;
            }
            
            .perfume-name {
                font-size: 32px;
                color: #ff6b9d;
                margin: 0 0 20px 0;
            }
            
            .perfume-basic-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 30px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            
            .info-label {
                font-weight: bold;
                color: #555;
            }
            
            .info-value {
                color: #333;
            }
            
            .info-value.men {
                color: #2563eb;
            }
            
            .info-value.women {
                color: #dc2626;
            }
            
            .info-value.mixte {
                color: #7c3aed;
            }
            
            .price-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .price {
                font-size: 36px;
                font-weight: bold;
                color: #ff6b9d;
            }
            
            .price-note {
                color: #666;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .action-buttons {
                display: flex;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .whatsapp-btn, .favorite-btn {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            
            .whatsapp-btn {
                background: #25d366;
                color: white;
            }
            
            .whatsapp-btn:hover {
                background: #128c7e;
            }
            
            .favorite-btn {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #ddd;
            }
            
            .favorite-btn:hover {
                background: #ff6b9d;
                color: white;
            }
            
            .perfume-description, .fragrance-notes, .brand-story {
                margin-bottom: 30px;
            }
            
            .perfume-description h3, .fragrance-notes h3, .brand-story h3 {
                color: #333;
                border-bottom: 2px solid #ff6b9d;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            
            .notes-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }
            
            .note-category {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            
            .note-category h4 {
                color: #ff6b9d;
                margin-bottom: 10px;
            }
            
            .similar-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .similar-perfume-card {
                background: white;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .similar-perfume-card:hover {
                transform: translateY(-5px);
            }
            
            .similar-perfume-card img,
            .similar-perfume-image img {
                width: 100%;
                max-width: 120px;
                height: auto;
                margin-bottom: 10px;
                border-radius: 8px;
                transition: transform 0.2s ease;
            }
            
            .similar-perfume-image {
                width: 120px;
                height: 120px;
                margin: 0 auto 10px auto;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border-radius: 8px;
                background: #f9f9f9;
            }
            
            .similar-perfume-card h4 {
                margin: 10px 0 5px 0;
                color: #333;
            }
            
            .similar-perfume-card p {
                color: #666;
                margin: 5px 0;
                font-size: 14px;
            }
            
            .similar-perfume-card .price {
                color: #ff6b9d;
                font-weight: bold;
                font-size: 16px;
            }
            
            @media (max-width: 768px) {
                .perfume-main-content {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .notes-container {
                    grid-template-columns: 1fr;
                }
                
                .action-buttons {
                    flex-direction: column;
                }
                
                .perfume-basic-info {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    showError(message) {
        const container = document.querySelector('.perfume-detail-container') || document.body;
        container.innerHTML = `
            <div class="error-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 50vh;
                flex-direction: column;
                gap: 20px;
                text-align: center;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #e74c3c;"></i>
                <h2 style="color: #333; margin: 0;">${message}</h2>
                <button data-action="back" style="
                    background: #ff6b9d;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">Go Back</button>
            </div>
        `;
    }

    attachEventListeners() {
        // Add any additional event listeners here
        const favoriteBtn = document.querySelector('.favorite-btn');
        if (favoriteBtn) {
            const favorites = JSON.parse(localStorage.getItem('eden_favorites') || '[]');
            const isFavorited = favorites.includes(this.perfumeData.id);
            this.updateFavoriteButton(isFavorited);
        }

        // Delegated handlers for actions
        document.querySelector('.perfume-detail-content')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');

            if (action === 'back') {
                history.back();
            } else if (action === 'whatsapp') {
                const perfumeName = decodeURIComponent(btn.getAttribute('data-perfume') || '');
                const brandName = decodeURIComponent(btn.getAttribute('data-brand') || '');
                window.orderViaWhatsApp(perfumeName, brandName);
            } else if (action === 'favorite') {
                const id = btn.getAttribute('data-id');
                window.toggleFavorite(id);
                // toggle UI
                const icon = btn.querySelector('i');
                if (icon) icon.className = icon.className.includes('far') ? 'fas fa-heart' : 'far fa-heart';
            } else if (action === 'open-detail') {
                const ref = btn.getAttribute('data-ref');
                if (ref) window.location.href = `perfume-detail.html?ref=${encodeURIComponent(ref)}`;
            }
        });
    }
}

// Initialize the perfume detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PerfumeDetailPage();
});

// Global functions for onclick handlers
window.orderViaWhatsApp = function(perfumeName, brandName) {
    const message = `Hello! I'm interested in ordering ${perfumeName} by ${brandName}. Could you please provide me with more details about availability and pricing?`;
    const whatsappNumber = '212636262660';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
};

window.toggleFavorite = function(perfumeId) {
    const favorites = JSON.parse(localStorage.getItem('eden_favorites') || '[]');
    const index = favorites.indexOf(perfumeId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(perfumeId);
    }
    
    localStorage.setItem('eden_favorites', JSON.stringify(favorites));
    
    const favoriteBtn = document.querySelector('.favorite-btn i');
    if (favoriteBtn) {
        favoriteBtn.className = index === -1 ? 'fas fa-heart' : 'far fa-heart';
    }
};
