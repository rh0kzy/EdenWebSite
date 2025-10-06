// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Initialize error monitoring if available
    if (window.ErrorMonitor) {
        // Error monitoring system is active
    } else {
        // Error monitoring system not loaded
    }
    // Social Media Popup Functionality
    initializeSocialPopup();

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Don't prevent default for external links (like catalog.html) or absolute URLs
            if (href.includes('.html') || href.startsWith('http') || href.startsWith('/')) {
                return; // Let the browser handle the navigation
            }

            e.preventDefault();
            const targetId = href;

            // Validate that targetId is a valid CSS selector (should start with # for anchor links)
            if (!targetId || !targetId.startsWith('#')) {
                return; // Invalid selector, let browser handle it
            }

            try {
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                // Invalid selector, let browser handle navigation normally
                return;
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Category card hover effects
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Contact form submission
    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        this.reset();
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.category-card, .feature, .stat, .info-card, .brand-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat h3');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                entry.target.setAttribute('data-animated', 'true');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function openMap() {
    // Opens Google Maps to EDEN PARFUM exact location using place ID for reliability
    const mapsUrl = 'https://www.google.com/maps/place/Eden+parfum/@36.7585922,3.0554277,17z/data=!3m1!4b1!4m6!3m5!1s0x128fb30018c34e03:0x69b304bc5ec91959!8m2!3d36.7585922!4d3.0554277!16s%2Fg%2F11w2cyhqj_';
    window.open(mapsUrl, '_blank');
}

// WhatsApp functionality
function openWhatsApp(message = '') {
    const phoneNumber = '213661808980';
    const defaultMessage = 'Hello EDEN PARFUM! I would like to inquire about your perfume collection.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const suffix = element.textContent.replace(/\d/g, '');
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, stepTime);
}

// Perfume Bottle 3D Effect
document.addEventListener('mousemove', function(e) {
    const bottle = document.querySelector('.perfume-bottle');
    if (!bottle) return;
    
    const rect = bottle.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (y / rect.height) * 10;
    const rotateY = -(x / rect.width) * 10;
    
    bottle.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

// Reset bottle position when mouse leaves
document.addEventListener('mouseleave', function() {
    const bottle = document.querySelector('.perfume-bottle');
    if (bottle) {
        bottle.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const bottle = document.querySelector('.perfume-bottle');
    
    if (hero && bottle) {
        const rate = scrolled * -0.5;
        bottle.style.transform = `translateY(${rate}px)`;
    }
});

// Loading Animation
window.addEventListener('load', function() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }
});

// Search Functionality (for future implementation)
function searchPerfumes(query) {
    // This function can be expanded to implement search functionality
    // Production: Remove debug logging
    // Future implementation could filter perfumes or redirect to search results
}

// Newsletter Subscription (for future implementation)
function subscribeNewsletter(email) {
    // This function can be expanded to handle newsletter subscriptions
    // Production: Remove debug logging
    showNotification('Thank you for subscribing to our newsletter!', 'success');
}

// Product Filter (for future implementation)
function filterProducts(category) {
    // This function can be expanded to filter products by category
    // Production: Remove debug logging
    // Future implementation could show/hide products based on category
}

// Wishlist Functionality (for future implementation)
function addToWishlist(productId) {
    // This function can be expanded to handle wishlist functionality
    // Production: Remove debug logging
    showNotification('Added to wishlist!', 'success');
}

// Language Toggle (for future implementation)
function toggleLanguage(lang) {
    // This function can be expanded to handle multiple languages
    // Production: Remove debug logging
    // Future implementation could switch between Arabic and French
}

// Perfume Catalog Search Functionality
let filteredPerfumes = [];
let currentSearchTerm = '';
let currentBrandFilter = '';
let currentGenderFilter = '';

// Initialize catalog when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize catalog if we're on a page with catalog elements
    if (document.getElementById('brandFilter') && document.getElementById('genderFilter')) {
        initializeCatalog();
    }
});

// Listen for perfumes loaded event
window.addEventListener('perfumesLoaded', function(event) {
    // Only setup catalog if we're on the catalog page
    if (document.getElementById('brandFilter') && document.getElementById('genderFilter')) {
        setupCatalogWithData();
    }
});

async function initializeCatalog() {
    // Check if we're on the catalog page
    if (!document.getElementById('brandFilter') || !document.getElementById('genderFilter')) {
        // Not on catalog page - skipping catalog initialization
        return;
    }

    // Show loading indicator
    showLoadingIndicator();
    
    try {
        // Check if perfumes database is already loaded
        if (window.perfumesDatabase && window.perfumesDatabase.length > 0) {
            setupCatalogWithData();
        } else {
            // Load data from API
            // Load perfume data
            await loadPerfumeData();
        }
    } catch (error) {
        // Error initializing catalog - handled by showErrorMessage
        showErrorMessage('Failed to load perfume catalog. Please try again later.');
    }
}

// Load perfume data from API
async function loadPerfumeData() {
    try {
        console.log('🔄 Loading perfume data from API (fallback script)...');
        
        // FORCE: Clear any cached offline data first
        window.offlinePerfumeData = null;
        
        // Use direct fetch instead of edenAPI to avoid any cached data
        const response = await fetch('/api/v2/perfumes?limit=506');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response (fallback):', data);

        const perfumes = Array.isArray(data?.data)
            ? data.data
            : (Array.isArray(data) ? data : null);

        if (perfumes && perfumes.length > 0) {
            // Store in global variable for compatibility with existing code
            window.perfumesDatabase = perfumes;
            
            console.log(`✅ FALLBACK: Loaded ${perfumes.length} perfumes from API`);

            window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                detail: { 
                    perfumes,
                    total: data.total || perfumes.length,
                    offline: false
                }
            }));
            
            // Set up catalog with the loaded data
            setupCatalogWithData();
                showErrorMessage(`Running in offline mode - showing ${response.data.length} sample perfumes. Check API connection for full catalog.`, 'warning');
            }
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                detail: { 
                    perfumes: response.data,
                    total: response.total,
                    offline: response.offline
                }
            }));
            
            // Set up catalog with the loaded data
            setupCatalogWithData();
        } else {
            throw new Error('No data received from API');
        }
        
    } catch (error) {
        // Failed to load perfume data - NO FALLBACK TO OFFLINE DATA
        console.error('❌ Failed to load perfume data from API:', error);
        
        // Don't use offline data anymore - show error instead
        showErrorMessage('Unable to load perfume catalog. Please refresh the page or try again later.');
        
        // Set empty database to prevent errors
        window.perfumesDatabase = [];
        
        window.dispatchEvent(new CustomEvent('perfumesLoaded', {
            detail: { 
                perfumes: [],
                total: 0,
                offline: false,
                error: true
            }
        }));
    }
}

function setupCatalogWithData() {
    // Check if we're on the catalog page first
    if (!document.getElementById('brandFilter') || !document.getElementById('genderFilter')) {
        // Not on catalog page - skipping catalog setup
        return;
    }

    // Hide loading indicator
    hideLoadingIndicator();
    
    // Check if perfumes database is loaded
    if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
        // Perfumes database not loaded or empty
        showErrorMessage('No perfumes found. Please try again later.');
        return;
    }
    
    // Setup catalog display
    
    // Initialize filters
    populateFilters();
    
    // Check for URL parameters and apply filters
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
            currentGenderFilter = genderValue;
            const genderFilterSelect = document.getElementById('genderFilter');
            if (genderFilterSelect) {
                genderFilterSelect.value = genderValue;
            }
        }
    }
    
    // Initialize search
    filteredPerfumes = [...window.perfumesDatabase];
    
    // Sort by reference number numerically (1105, 1106, etc.)
    filteredPerfumes.sort((a, b) => {
        const refA = parseInt(a.reference) || 0;
        const refB = parseInt(b.reference) || 0;
        return refA - refB;
    });
    
    // Apply any URL-based filters
    if (currentGenderFilter) {
        filterPerfumes();
    } else {
        displayPerfumes();
        updateResultsCount();
    }
    
    // Add event listeners
    setupSearchEventListeners();
}

// Get unique brands for filter dropdown
function getUniqueBrands() {
    if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
        return [];
    }
    const brands = [...new Set(window.perfumesDatabase.map(perfume => perfume.brand).filter(brand => brand && brand.trim() !== ''))];
    return brands.sort();
}

// Get unique genders for filter dropdown  
function getUniqueGenders() {
    if (!window.perfumesDatabase || window.perfumesDatabase.length === 0) {
        return [];
    }
    const genders = [...new Set(window.perfumesDatabase.map(perfume => perfume.gender).filter(gender => gender))];
    return genders.sort();
}

function populateFilters() {
    const brandFilter = document.getElementById('brandFilter');
    const genderFilter = document.getElementById('genderFilter');

    if (!brandFilter || !genderFilter) {
        // Filter elements not found - not on catalog page
        return;
    }

    // Clear existing options except the first "All" option
    brandFilter.innerHTML = '<option value="">All Brands</option>';
    genderFilter.innerHTML = '<option value="">All Genders</option>';

    // Populate brand filter
    const brands = getUniqueBrands();
    if (brands && Array.isArray(brands) && brandFilter) {
        brands.forEach(brand => {
            if (brandFilter) { // Double-check element still exists
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandFilter.appendChild(option);
            }
        });
    }

    // Populate gender filter
    const genders = getUniqueGenders();
    if (genders && Array.isArray(genders) && genderFilter) {
        genders.forEach(gender => {
            if (genderFilter) { // Double-check element still exists
                const option = document.createElement('option');
                option.value = gender;
                option.textContent = gender;
                genderFilter.appendChild(option);
            }
        });
    }
}

function setupSearchEventListeners() {
    const searchInput = document.getElementById('perfumeSearch');
    const brandFilter = document.getElementById('brandFilter');
    const genderFilter = document.getElementById('genderFilter');
    const clearButton = document.getElementById('clearFilters');

    // Check if all required elements exist
    if (!searchInput || !brandFilter || !genderFilter || !clearButton) {
        // Not all catalog elements found - not on catalog page
        return;
    }

    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearchTerm = this.value.toLowerCase();
            filterPerfumes();
        }, 300);
    });

    // Brand filter
    brandFilter.addEventListener('change', function() {
        currentBrandFilter = this.value;
        filterPerfumes();
    });

    // Gender filter
    genderFilter.addEventListener('change', function() {
        currentGenderFilter = this.value;
        filterPerfumes();
    });

    // Clear filters
    clearButton.addEventListener('click', function() {
        if (searchInput && brandFilter && genderFilter) {
            searchInput.value = '';
            brandFilter.value = '';
            genderFilter.value = '';
        }
        currentSearchTerm = '';
        currentBrandFilter = '';
        currentGenderFilter = '';
        filterPerfumes();
    });
}

function filterPerfumes() {
    if (!window.perfumesDatabase) {
        // No perfumes database available for filtering
        return;
    }
    
    filteredPerfumes = window.perfumesDatabase.filter(perfume => {
        // Search term filter
        const matchesSearch = !currentSearchTerm || 
            perfume.name.toLowerCase().includes(currentSearchTerm) ||
            perfume.brand.toLowerCase().includes(currentSearchTerm) ||
            perfume.reference.toLowerCase().includes(currentSearchTerm);
        
        // Brand filter
        const matchesBrand = !currentBrandFilter || perfume.brand === currentBrandFilter;
        
        // Gender filter
        const matchesGender = !currentGenderFilter || perfume.gender === currentGenderFilter;
        
        return matchesSearch && matchesBrand && matchesGender;
    });
    
    // Sort by reference number numerically (1105, 1106, etc.)
    filteredPerfumes.sort((a, b) => {
        const refA = parseInt(a.reference) || 0;
        const refB = parseInt(b.reference) || 0;
        return refA - refB;
    });
    
    displayPerfumes();
    updateResultsCount();
}

function displayPerfumes() {
    const resultsContainer = document.getElementById('perfumeResults');
    const noResultsDiv = document.getElementById('noResults');

    // Check if required elements exist
    if (!resultsContainer || !noResultsDiv) {
        // Not on catalog page - skipping display
        return;
    }

    if (filteredPerfumes.length === 0) {
        resultsContainer.style.display = 'none';
        noResultsDiv.style.display = 'block';
        return;
    }

    resultsContainer.style.display = 'grid';
    noResultsDiv.style.display = 'none';

    resultsContainer.innerHTML = '';

    filteredPerfumes.forEach(perfume => {
        const perfumeItem = createPerfumeItem(perfume);
        if (resultsContainer) { // Double-check container still exists
            resultsContainer.appendChild(perfumeItem);
        }
    });
}

function createPerfumeItem(perfume) {
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
    if (fragranceImageName && fragranceImageName !== 'default-perfume.jpg') {
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
            imageContainer.innerHTML = `<img src="photos/${fragranceImageName}" alt="${perfume.name}" class="fragrance-image" loading="lazy">`;
        }
    } else {
        // Default placeholder
        imageContainer.innerHTML = '<div class="perfume-image-placeholder"><i class="fas fa-spray-can"></i></div>';
    }
    
    return item;
}

function showPerfumeDetails(perfume) {
    const message = `Hi! I'm interested in ${perfume.name} (${perfume.brand}) - Reference #${perfume.reference}. Is it available?`;
    const whatsappUrl = `https://wa.me/213661808980?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');

    // Check if element exists
    if (!countElement) {
        // Not on catalog page - skipping count update
        return;
    }

    if (!window.perfumesDatabase) {
        countElement.textContent = 'Loading perfumes...';
        return;
    }

    const total = window.perfumesDatabase.length;
    const showing = filteredPerfumes.length;

    if (showing === total) {
        countElement.textContent = `Showing all ${total} perfumes`;
    } else {
        countElement.textContent = `Showing ${showing} of ${total} perfumes`;
    }
}

function getBrandLogo(brand) {
    const brandLogos = {
        'Chanel': 'photos/chanel.png',
        'Yves Saint Laurent': 'photos/YSL_Logo.svg.png',
        'Louis Vuitton': 'photos/louis-vuitton-1-logo-black-and-white.png',
        'Luis Vuitton': 'photos/louis-vuitton-1-logo-black-and-white.png',
        'Dolce & Gabbana': 'photos/dolce_gabanna.png',
        'Dolce&Gabbana': 'photos/dolce_gabanna.png',
        'Dolce&Gabanna': 'photos/Dolce&Gabanna.jpg',
        'Burberry': 'photos/logoburberry-1400x433.png',
        'Zara': 'photos/ZARA.png',
        'Diesel': 'photos/Diesel_Parfume_Logo.png',
        'Chloé': 'photos/chloe-Converted.png',
        'Chloe': 'photos/chloe-Converted.png',
        'Azzaro': 'photos/Logo_Azzaro.png',
        'Boucheron': 'photos/Logo_of_Boucheron.png',
        'Britney Spears': 'photos/Britney_Spears.png',
        'Bvlgari': 'photos/Bulgari_logo.svg.png',
        'Gucci': 'photos/gucci-1-logo-black-and-white.png',
        'Jean Paul Gaultier': 'photos/jean-paul-gaultier-vector-logo.png',
        'Jimmy Choo': 'photos/Jimmy_choo.png',
        'Kenzo': 'photos/61fd47dd1042bd46515add61_logo (1) kenzo.png',
        'Kilian': 'photos/kilian paris logo_black_540x260px.png',
        'Lacoste': 'photos/lacoste.png',
        'Marco Jacobs': 'photos/marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
        'Marc Jacobs': 'photos/marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
        'Narciso Rodriguez': 'photos/narcisco.png',
        'Paco Rabbane': 'photos/PACO RABBANE.png',
        'Prada': 'photos/PRADA.png',
        'Roberto Cavali': 'photos/Roberto-Cavalli-logo.png',
        'Roberto Cavalli': 'photos/Roberto-Cavalli-logo.png',
        'Versace': 'photos/versace.png',
        'Armani': 'photos/armani.png',
        'Calvin Klein': 'photos/calvin klein.svg',
        'Carolina Herrera': 'photos/Carolina Herrera.png',
        'Cartier': 'photos/Cartier.png',
        'Dior': 'photos/dior.png',
        'Elie Saab': 'photos/Elie Saab.webp',
        'Escada': 'photos/escada.png',
        'Givenchy': 'photos/givenchy.png',
        'Guerlain': 'photos/Guerlain.png',
        'Hermes': 'photos/Hermes.png',
        'Hugo Boss': 'photos/hugo boss.png',
        'Killian': 'photos/Killian.png',
        'Kurkidjian': 'photos/Kurkidjian.png',
        'Lanvin': 'photos/Lanvin.png',
        'Mancera': 'photos/Mancera.png',
        'Mont Blanc': 'photos/Mont Blanc.png',
        'Thierry Mugler': 'photos/Thierry Mugler.png',
        'Tom Ford': 'photos/tom ford.png',
        'Valentino': 'photos/Valentino.png',
        'Viktor&Rolf': 'photos/Viktor & Rolf.png',
        'Xerjoff': 'photos/Xerjoff.webp',
        
        // Additional brands
        'Lattafa': 'photos/LATTAFA.svg',
        'Lataffa': 'photos/LATTAFA.svg',
        'Nina Ricci': 'photos/NINA RICCI.png',
        'Al Rehab': 'photos/al rehab.png',
        'Antonio Banderas': 'photos/Antonio Banderas.jpg',
        'Ariana Grande': 'photos/Ariana Grande.jpg',
        'Arte Profumi': 'photos/Arte Profumi.jpg',
        'Cacharel': 'photos/Cacharel.jpg',
        'Creed': 'photos/creed.png',
        'Davidoff': 'photos/Davidoff.svg',
        'Ferrari': 'photos/Ferrari.png',
        'Issey Miyake': 'photos/Issey Miyake.jpg',
        'Kajal': 'photos/Kajal.avif',
        'Kayali': 'photos/Kayali.jpg',
        'Lancome': 'photos/Lancome.png',
        'Nasomatto': 'photos/Nasomatto.jpg',
        'Ted Lapidus': 'photos/Ted Lapidus.jpg',
        'Tiziana Tirenzi': 'photos/Tiziana Tirenzi.png',
        
        // Recently added brands
        'Banafaa': 'photos/Banafaa.jpg',
        'Bdk': 'photos/Bdk.webp',
        'Caron': 'photos/Caron.jpg',
        'Cerruti': 'photos/Cerruti.svg',
        'Clinique': 'photos/Clinique.png',
        'Denhil': 'photos/Denhil.jpg',
        'Elisabeth Arden': 'photos/Elisabeth Arden.png',
        'Etro': 'photos/Etro.png',
        'Evaflor': 'photos/Evaflor.webp',
        'Franck Olivier': 'photos/Franck Olivier.png',
        'Frédéric Malle': 'photos/Frédéric Malle.png',
        'Guy Laroche': 'photos/Guy Laroche.png',
        'Joop!': 'photos/Joop!.png',
        'La Lique': 'photos/La Lique.png',
        'Laverne': 'photos/Laverne.png',
        'Lolita Land': 'photos/Lolita Land.jpg',
        'Mateu': 'photos/Mateu.jpg',
        'Nautica': 'photos/Nautica.jpg',
        'Nicos': 'photos/Nicos.webp',
        'Nishane': 'photos/Nishane.webp',
        'Parfums de Marly': 'photos/Parfums de Marly.png',
        'Polo': 'photos/Polo.png',
        'Repetto': 'photos/Repetto.jpg',
        'Rochas': 'photos/Rochas.jpg',
        'Roger Gallet': 'photos/Roger Gallet.jpg',
        'Solinote': 'photos/Solinote.png',
        'Sospiro': 'photos/Sospiro.avif',
        'Victoria\'S Secret': 'photos/Victoria\'S Secret.png',
        'Yves De Sistelle': 'photos/Yves De Sistelle.png',
        'Yves Rocher': 'photos/Yves Rocher.png',
        'Shalis': 'photos/Shalis.png'
    };
    
    return brandLogos[brand] || null;
}

function getFragranceImage(perfume) {
    const imageMap = {
        // Men's Fragrances - Fixed to match actual filenames
        '1 Million': '1 Million.avif',
        '1 Million Elixir': '1 Million Elixir.avif',
        '1 Million Lucky': '1 Million Lucky.avif',
        '1 Million Royal': '1 Million Royal.avif',
        '1881': '1881.avif',
        '212 Men': '212 Men.avif',
        '212 Vip Men': '212 Vip Men.avif',
        'Allure Homme Sport': 'Allure Homme Sport.avif',
        'Antaeus': 'Antaeus.avif',
        'Aqua Di Gio': 'Aqua Di Gio.avif',
        'Aqua Fahrenheit': 'Aqua Fahrenheit.avif',
        'Aqua Profondo': 'Aqua Profondo.avif',
        'Aqua Profumo': 'Aqua Profumo.avif',
        'Aventus': 'Aventus.avif',
        'Black Afgano': 'Black Afgano.avif',
        'Black Gold': 'Black Gold.avif',
        'Black Orchid': 'Black Orchid.avif',
        'Black Tom Ford': 'Black tom ford.avif',
        'Black Vanille': 'Black Vanille.avif',
        'Blanc': 'Blanc.avif',
        'Bleu Lacoste': 'Bleu lacoste.avif',
        'Bleu': 'Bleu.avif',
        'Bleu Polo': 'Bleu polo.avif',
        'Blue Seduction': 'Blue Seduction.avif',
        'Blue Touch': 'Blue Touch.avif',
        'Bois Dargent': 'Bois Dargent.avif',
        'Bois De Oud': 'Bois De Oud.avif',
        'Body Kouros': 'Body kouros.avif',
        'Body Kourous': 'Body kouros.avif',
        'Booster': 'Booster.avif',
        'Botled': 'Botled.avif',
        'Botled Intense': 'Botled Intense.avif',
        'Botled Marine': 'Botled Marine.avif',
        'Botled Oud': 'Botled Oud.avif',
        'Boy': 'Boy.avif',
        'Bulgari': 'Bulgari.avif',
        'Caron': 'Caron.avif',
        'Chairman': 'Chairman.avif',
        'Champion': 'Champion.avif',
        'Chrome': 'Chrome.avif',
        'Ck One': 'Ck One.avif',
        'Classique': 'Classique.avif',
        'Code': 'Code.avif',
        'Code Profumo': 'Code Profumo.avif',
        'Cologne': 'Cologne.avif',
        'Colle Noir': 'Colle Noir.avif',
        'Declaration': 'Declaration.avif',
        'Desir Blue': 'Desir Blue.avif',
        'Desir For Men': 'Desir For Men.avif',
        'Diesel Iesel': 'diesel iesel.avif',
        'Iesel': 'diesel iesel.avif',
        'Dior Homme Sport': 'Dior Homme Sport.avif',
        'Dolce&Gabbana King': 'Dolce&Gabbana King.avif',
        'Dolce&Gabbana Layl Malaki': 'Dolce&Gabbana Layl Malaki.avif',
        'Dolce&Gabbana Layl Malaki V2': 'Dolce&Gabbana Layl Malaki v2.avif',
        'Dolce&Gabbana Layl Sihri': 'Dolce&Gabbana Layl Sihri.avif',
        'Dolce&Gabbana Light Blue Intense': 'Dolce&Gabbana Light Blue Intense.avif',
        'Dolce&Gabbana The One': 'Dolce&Gabbana The One.avif',
        'Dolce&Gabbana The One Grey': 'Dolce&Gabbana The One Grey.avif',
        'Drakar Noir': 'Drakar Noir.avif',
        'Eau De Narcisse Bleu': 'Eau De Narcisse Bleu.avif',
        'Eau De Passion': 'Eau De Passion.avif',
        'Eau Du Matin': 'Eau Du Matin.avif',
        'Eau Sauvage': 'Eau Sauvage.avif',
        'Egoiste Platinium': 'Egoiste Platinium.avif',
        'Encre Noir': 'Encre Noir.avif',
        'Erba Gold': 'Erba Gold.avif',
        'Erba Pura': 'Erba Pura.avif',
        'Eros Men': 'Eros.avif',
        'Eternity': 'Eternity.avif',
        'Eternity Flame': 'Eternity Flame.avif',
        'Fahrenheit': 'Fahrenheit.avif',
        'Fucking Fabulous': 'Fucking Fabulous.avif',
        'Fuel For Life': 'Fuel for life.avif',
        'Gentlemen': 'Gentlemen.avif',
        'Gentlemen Reserve Prive': 'Gentlemen Reserve Prive.avif',
        'Gentlemen Society': 'Gentlemen Society.avif',
        'Gold': 'Gold.avif',
        'Gold Intens Oud': 'Gold Intens Oud.avif',
        'Gris Montain': 'Gris Montain.avif',
        'Gucci Oud': 'gucci oud.avif',
        'Guilty': 'Guilty.avif',
        'Habit Rouge': 'Habit Rouge.avif',
        'Hacivat': 'Nishane.avif',
        'Happy': 'Happy.avif',
        'Helena': 'helena.avif',
        'Heliotrope': 'Heliotrope.avif',
        'Hero': 'Hero.avif',
        'Heroes': 'Heroes.avif',
        'Homme': 'Homme.avif',
        'Hugo': 'Hugo.avif',
        'Image': 'Image.avif',
        'Intense': 'Intense.avif',
        'Invictus': 'Invictus.avif',
        'Invictus Platinium': 'Invictus Platinium.avif',
        'Invictus Victory': 'Invictus Victory.avif',
        'Invictus Victory Elixir': 'Invictus Victory Elixir.avif',
        'Jean Paul Gautier Le Beau Paradise Garden': 'Jean Paul Gautier Le Beau Paradise Garden.avif',
        'Jean Paul Gautier Scandal Absolut -H-': 'Jean Paul Gautier Scandal Absolut -H-.avif',
        'Jimmy Show Men Blue': 'Jimmy Show Men Blue.avif',
        'Joop Night Flight': 'Joop Night Flight.avif',
        'King': 'King.avif',
        'Kourous': 'Kourous.avif',
        'La Nuit De Lhomme': 'La Nuit De Lhomme.avif',
        'Lapidus': 'Lapidus.avif',
        'Le Beau': 'Le Beau.avif',
        'Le Male': 'Le Male.avif',
        'Le Male Elixir': 'Le Male Elixir.avif',
        'Leau Dessey Leau Super Majeur': 'Leau Dessey Leau Super Majeur.avif',
        'Leau Dessey Sport': 'Leau Dessey Sport.avif',
        'Legend': 'Legend.avif',
        'Lhomme': 'Lhomme.avif',
        'Lhomme Ideal': 'Lhomme Ideal.avif',
        'Lhomme Intens': 'Lhomme Intens.avif',
        'Lhomme Libre': 'Lhomme Libre.avif',
        'Light Blue Forever -H-': 'Light blue forever -h-.avif',
        'Linstant': 'Linstant.avif',
        'London': 'London.avif',
        'Lost Cherry': 'Lost Cherry.avif',
        'M7 Oud Asolu': 'M7 Oud Asolu.avif',
        'Men': 'Men.avif',
        'Men In Black Bulgari': 'Men In Black Bulgari.avif',
        'Mr Burberry': 'Mr burberry.avif',
        'Mr': 'Mr burberry.avif',
        'Myself': 'Myself.avif',
        'Night': 'Night.avif',
        'Noir': 'Noir.avif',
        'Omo Born In Roma': 'Omo Born In Roma.avif',
        'Only Gentlemen': 'Only Gentlemen.avif',
        'Only The Brave': 'Only The Brave.avif',
        'Orange': 'Orange.avif',
        'Orange Charity': 'Orange Charity.avif',
        'Original': 'Original.avif',
        'Oud': 'Oud.avif',
        'Oud Esfahane': 'Oud Esfahane.avif',
        'Oud Satin Mood': 'Oud Satin Mood.avif',
        'Oud Touch': 'Oud Touch.avif',
        'Oud Vanille': 'Oud Vanille.avif',
        'Phantom': 'Phantom.avif',
        'Pi': 'Pi.avif',
        'Play': 'Play.avif',
        'Red Legend': 'Red Legend.avif',
        'Roberto Cavalli Oud': 'Roberto Cavalli Oud.avif',
        'Rochas': 'Rochas.avif',
        'Rose Greedy': 'Rose Greedy.avif',
        'Rose Vanille': 'Rose Vanille.avif',
        'Sauvage': 'Sauvage.avif',
        'Sauvage Elixir': 'Sauvage Elixir.avif',
        'Scandal Homme': 'Scandal homme.avif',
        'Sculpture': 'Sculpture.avif',
        'Spicebomb': 'Spicebomb.avif',
        'Sport': 'Sport.avif',
        'Sport Polo': 'Sport polo.avif',
        'Stronger With You Intensly': 'Stronger With You Intensly.avif',
        'Stronger With You Leather': 'Stronger With You Leather.avif',
        'Stronger With You Oud': 'Stronger With You Oud.avif',
        'Sun Java White': 'Sun Java White.avif',
        'Supreme Oud Ralph Lauren': 'Supreme Oud Ralph Lauren.avif',
        'Terre Dhermes': 'Terre dhermes.avif',
        "Terre d'Hermès": 'Terre dhermes.avif',
        'The Most Wanted': 'The Most Wanted.avif',
        'The Scent': 'The Scent.avif',
        'Tobacco': 'Tobacco.avif',
        'Tobacco Oud': 'Tobacco Oud.avif',
        'Tobacco Vanille': 'Tobacco Vanille.avif',
        'Ultra Bleu': 'Ultra Bleu.avif',
        'Ultra Male': 'Ultra Male.avif',
        'Ultraviolet Men': 'Ultraviolet men.avif',
        'Urban Journey': 'urban journey.avif',
        'V Valentino': 'V valentino.avif',
        'V': 'V valentino.avif',
        'Valentino': 'V valentino.avif',
        'Velvet Orchid': 'Velvet Orchid.avif',
        'Velvet Tendre Oud': 'Velvet Tendre Oud.avif',
        'Vibrant Leather': 'Vibrant Leather.avif',
        'Viking': 'Viking.avif',
        'Vomo': 'Vomo.avif',
        'Voyage': 'Voyage.avif',
        'Wanted': 'Wanted.avif',
        'Wanted Tonic': 'Wanted Tonic.avif',
        'Whisky Silver': 'Whisky Silver.avif',
        'Y': 'Y.avif',
        'Y Le Parfum': 'Y Le Parfum.avif',
        'Ysl La Nuit De Lhomme Lelectric': 'Ysl La Nuit De Lhomme Lelectric.avif',
        
        // Women's Fragrances - Fixed to match actual files
        '1881': '1881.avif',
        '2006': '2006.avif',
        '212 Vip Rose Smily': '212 Vip Rose Smily.avif',
        '375x500.6341.2x': '375x500.6341.2x.avif',
        '5Th Avenue': '5th avenue.avif',
        'Addict': 'Addict.avif',
        'Afternoon Swim': 'Afternoon Swim.avif',
        'Ageur F.Malles': 'Ageur F.Malles.avif',
        'Musc Ravageur': 'Ageur F.Malles.avif',
        'Air Du Temps': 'Air Du Temps.avif',
        'Al Thair': 'Al Thair.avif',
        'Alexendria Ii': 'Alexendria Ii.avif',
        'Alexandria II': 'Alexendria Ii.avif',
        'Alien': 'Alien.avif',
        'Alien Hypersense': 'Alien Hypersense.avif',
        'Allure': 'Allure.avif',
        'Allure Edition Blanche': 'Alure Edition Blanche.avif',
        'Alure Edition Blanche': 'Alure Edition Blanche.avif',
        'Almaz': 'Almaz.avif',
        'Amarige': 'Amarige.avif',
        'Ambre Eternelle': 'Ambre Eternelle.avif',
        'Ambre Nuit': 'Ambre Nuit.avif',
        'Ameerat Al Arab': 'Ameerat Al Arab.avif',
        'Ameerat Al Arab Rose': 'Ameerat Al Arab Rose.avif',
        'اميرة العرب': 'Ameerat Al Arab.avif',
        'Amor': 'Amor.avif',
        'Anais': 'Anais.avif',
        'Ange Ou Demon Le Secret': 'Ange Ou Demon Le Secret.avif',
        'Armani Prive Vert Malachite': 'Armani Prive Vert Malachite.avif',
        'Vert Malachite': 'Armani Prive Vert Malachite.avif',
        'Aura': 'Aura.avif',
        'Elle': 'Azzaro elle.avif',
        'Baccarat Rouge': 'Baccarat Rouge.avif',
        'Baise Voler': 'Baise Voler.avif',
        'Bamboo': 'Bamoboo gucci.avif',
        'Bamoboo': 'Bamoboo gucci.avif',
        'Bare Vanilla': 'Bare vanila.avif',
        'Because It\'S You': 'Because It\'S You.avif',
        'Bella': 'Bella.avif',
        'Belle De Jour': 'Belle De Jour.avif',
        'Black Amber': 'Black Amber.avif',
        'Black': 'Black burberry.avif',
        'Black Opium': 'Black Opium.avif',
        'Black Opium Nuit Blanche': 'Black Opium Nuit Blanche.avif',
        'Black Scuderia': 'Black Scuderia.avif',
        'Black Xs L\'Excès': 'Black Xs L\'Excès.avif',
        'Body': 'Body.avif',
        'Bombshell Holiday': 'Boombshell holdiay.avif',
        'Bombshell Magic': 'Bombshell magic.avif',
        'Bombshell Night': 'Bombshell Night.avif',
        'Born In Paradise': 'Born In Paradise.avif',
        'Bright Crystal': 'Bright Cristal.avif',
        'Bright Cristal': 'Bright Cristal.avif',
        'Bright Crystal Absolute': 'Bright Cristal Absolut.avif',
        'Bright Cristal Absolut': 'Bright Cristal Absolut.avif',
        'Brisa Cubana': 'Brisa Cubana.avif',
        'Bloom': 'gucci Bloom.avif',
        'Bulgari Jasmine Noir': 'Bulgari Jasmine Noir.avif',
        'Burnina Cherry': 'Burning Cherry.avif',
        'Burning Cherry': 'Burning Cherry.avif',
        'Candy Love': 'Candy Love.avif',
        'Carlisle Marly': 'Carlisle marly.avif',
        'Carlisle': 'Carlisle marly.avif',
        'Cashmere': 'Cashmer.avif',
        'Cashmer': 'Cashmer.avif',
        'Chance': 'Chance.avif',
        'Chance Eau Tendre': 'Chance Eau Tendre.avif',
        'Chance Eau Vive': 'Chance Eau Vive.avif',
        'Cherry In The Air': 'Cherry In The Air.avif',
        'Cherry Smoothie': 'Cherry Smothie.avif',
        'Cherry Smothie': 'Cherry Smothie.avif',
        'Chloe': 'Chloe.avif',
        'Cinema': 'Cinema.avif',
        'Ckin2You': 'Ckin2You.avif',
        'Cloud': 'Cloud.avif',
        'Coco Melle': 'Coco Melle.avif',
        'Coco Mademoiselle': 'Coco Melle.avif',
        'Coco Vanille': 'Coco Vanille.avif',
        'Coconut Passion': 'Coconut Passion.avif',
        'Collection': 'Collection escada.avif',
        'Comme Une Evidence': 'Comme Une Evidence.avif',
        'Compassion': 'Compassion.avif',
        'Contre Moi': 'Contre Moi.avif',
        'Cool Water Blue': 'Cool Water Blue.avif',
        'Crème Brûlée': 'Creme Bruller.avif',
        'Creme Bruller': 'Creme Bruller.avif',
        'Crystal Noir': 'Cristal Noir.avif',
        'Cristal Noir': 'Cristal Noir.avif',
        'Dahlia Divin': 'Dahlia Divin.avif',
        'Dahlia Divin L\'Eau Initiale': 'Dahlia Divin L\'Eau Initiale.avif',
        'Dalal': 'Dalal.avif',
        'Marc Jacobs Decadence': 'decadence.avif',
        'Decadence': 'decadence.avif',
        'Delina': 'Delina.avif',
        'Devotion': 'Devotion.avif',
        'Dylan Purple': 'Dylan Purple.avif',
        'Eau Des Bienfaits': 'Eau Des Bienfaits.avif',
        'Eau So Sexy': 'Eau so sexy.avif',
        'Eclat D\'Arpège': 'Eclat D\'Arpège.avif',
        'Eclat De Fleurs': 'Eclat De Fleurs.avif',
        'Eden': 'Eden cacharel.avif',
        'Eden Apple Jucy': 'Eden Juicy Apple.avif',
        'Eden Apple Juicy': 'Eden Juicy Apple.avif',
        'Eden Juicy Apple': 'Eden Juicy Apple.avif',
        'Eden Sparkling Leccy': 'Eden Sparkling Lychee.avif',
        'Eden Sparkling Lychee': 'Eden Sparkling Lychee.avif',
        'El Jazeera': 'el jazeera.jpg',
        'Elixir': 'Elixir lacoste.avif',
        'Envy Me': 'Envy Me.avif',
        'Eros': 'Eros Versace.avif',
        'Evidence': 'Evidence.avif',
        'Fame': 'Fame.avif',
        'Fantasy': 'Fantasy.avif',
        'Fiesta Karioka': 'Fiesta Karioka.avif',
        'Flora': 'gucci flora.avif',
        'Flower': 'Flower.avif',
        'Flower Poppy': 'Flower Poppy.avif',
        'Fluidity Gold': 'Fluidity Gold.avif',
        'Fruity': 'Fruite zara.avif',
        'Fruite': 'Fruite zara.avif',
        'Gabrielle': 'Gabrielle.avif',
        'Gardenia': 'Gardenia.avif',
        'Girl Of Now': 'Girl of Now Elie Saab.avif',
        'Girl': 'Girl rochas.avif',
        'Godess': 'Goddess.avif',
        'Goddess': 'Goddess.avif',
        'Golden Decade': 'Golden Decade.avif',
        'Good Girl': 'Good Girl.avif',
        'Good Girl Gone Bad': 'Good Girl Gone Bad.avif',
        'Good Girl Velvet': 'Good Girl Velvet.avif',
        'Gucci Black': 'gucci black.avif',
        'Guilty Black': 'gucci black.avif',
        'Happy Hour': 'Happy Hour.avif',
        'Her': 'Her burberry.avif',
        'Her 2022': 'Her 2022.avif',
        'Her Elixir': 'Her Elixir.avif',
        'Hot Coture': 'Hot Coture.avif',
        'Hot Killian': 'Hot Killian.avif',
        'Hypnose': 'Hypnose.avif',
        'Hypnotic Poison': 'Hypnotic Poison.avif',
        'Idole': 'Idole.avif',
        'Idole Aura': 'Idole Aura.avif',
        'Idole Nectar': 'Idole Nectar.avif',
        'Idylle': 'Idylle.avif',
        'Imagination': 'Imagination.avif',
        'In Pink': 'In Pink.avif',
        'Incidence': 'Incidence.avif',
        'Insolence': 'Insolence.avif',
        'Irresistible': 'Irresistible.avif',
        'J\'Adore': 'J\'Adore.avif',
        'J\'Adore In Joy': 'J\'Adore In Joy.avif',
        'J\'Adore Lumière': 'J\'Adore Lumière.avif',
        'J\'adore L\'Or': 'J\'adore L\'Or.avif',
        'Jadore L\'Or': 'J\'adore L\'Or.avif',
        'Jardin Sur Le Nil': 'Jardin Sur Le Nil.avif',
        'Jasmine Allure': 'Jasmine Allure.avif',
        'Jasmine Musc': 'Jasmine Musc.avif',
        'Jean Paul Gautier Scandal Absolut -F-': 'Jean Paul Gautier Scandal Absolut -F-.avif',
        'Choo': 'jimmy choo.avif',
        'Jour': 'Jour.avif',
        'Joy': 'Joy.avif',
        'Kirke': 'Kirke.avif',
        'L\'Eau Coture': 'L\'Eau Couture Elie Saab.avif',
        'L\'Extase': 'L\'Extase.avif',
        'L\'Impératrice': 'L\'Impératrice.avif',
        'L\'Instant F': 'L\'Instant F.avif',
        'L\'Interdit': 'L\'Interdit.avif',
        'L\'Interdit Rouge': 'L\'Interdit Rouge.avif',
        'La Belle': 'La Belle.avif',
        'La Belle Fleur Terrible': 'La Belle Fleur Terrible.avif',
        'La Belle Paradise Garden': 'La Belle Paradise Garden.avif',
        'La Petite Robe Noir': 'La Petite Robe Noir.avif',
        'La Vie Est Belle': 'La Vie Est Belle.avif',
        'La Vie Est Belle Extraordinaire': 'La Vie Est Belle Extraordinaire.avif',
        'Lady Million': 'Lady Million.avif',
        'Lady Million Lucky': 'Lady Million Lucky.avif',
        'Lady Million Royal': 'Lady Million Royal.avif',
        'Leau Rouge N1': 'Leau Rouge N1.avif',
        'Le Parfum': 'Le Parfum Elie Saab.avif',
        'Royal': 'Le Parfum Royal Elie Saab.avif',
        'Legere': 'Legere.avif',
        'Libre': 'Libre.avif',
        'Light Blue': 'Light Blue women.avif',
        'Light Blue Intense': 'Light Blue Intense women.avif',
        'Lolita Land': 'Lolita Land.avif',
        'Loulou': 'Loulou.avif',
        'Love Story': 'Love Story.avif',
        'Loverdose': 'loverdose.avif',
        'Luna': 'Luna.avif',
        'Luna Blossom': 'LUNA BLOSSOM.avif',
        'Ma Vie': 'Ma Vie.avif',
        'Mademoiselle': 'Mademoiselle Rochas.avif',
        'Melle': 'Mademoiselle Rochas.avif',
        'Magnetic': 'Magnetic lacoste women.avif',
        'Manifesto': 'Manifesto.avif',
        'Marc Jacobs Perfect Intense': 'Marc Jacobs Perfect Intense.avif',
        'Melle Eau Tres Belle': 'Melle Eau Tres Belle.avif',
        'Melody Of The Sun': 'Melody Of The Sun.avif',
        'Fantasy Midnight': 'Midnight Fantasy.avif',
        'Kirke': 'Kirke.avif',
        'L\'Eau Couture Elie Saab': 'L\'Eau Couture Elie Saab.avif',
        'L\'Eau Coture': 'L\'Eau Couture Elie Saab.avif',
        'L\'Eau En Blanc': 'L\'Eau En Blanc.avif',
        'L\'Extase': 'L\'Extase.avif',
        'L\'Impératrice': 'L\'Impératrice.avif',
        'L\'Instant F': 'L\'Instant F.avif',
        'L\'Interdit': 'L\'Interdit.avif',
        'L\'Interdit Rouge': 'L\'Interdit Rouge.avif',
        'La Belle': 'La Belle.avif',
        'La Belle Fleur Terrible': 'La Belle Fleur Terrible.avif',
        'La Belle Paradise Garden': 'La Belle Paradise Garden.avif',
        'La Panthère': 'La Panthère.avif',
        'La Petite Robe Noir': 'La Petite Robe Noir.avif',
        'La Vie Est Belle': 'La Vie Est Belle.avif',
        'La Vie Est Belle Extraordinaire': 'La Vie Est Belle Extraordinaire.avif',
        'Lady Million': 'Lady Million.avif',
        'Lady Million Lucky': 'Lady Million Lucky.avif',
        'Lady Million Royal': 'Lady Million Royal.avif',
        'Leau Rouge N1': 'Leau Rouge N1.avif',
        'Le Parfum Elie Saab': 'Le Parfum Elie Saab.avif',
        'Le Parfum': 'Le Parfum Elie Saab.avif',
        'Le Parfum Royal Elie Saab': 'Le Parfum Royal Elie Saab.avif',
        'Royal': 'Le Parfum Royal Elie Saab.avif',
        'Legere': 'Legere.avif',
        'Libre': 'Libre.avif',
        'Light Blue': 'Light Blue women.avif',
        'Light Blue Intense': 'Light Blue Intense women.avif',
        'Lolita Land': 'Lolita Land.avif',
        'Loulou': 'Loulou.avif',
        'Love': 'Love killian.avif',
        'Love Story': 'Love Story.avif',
        'Loverdose': 'loverdose.avif',
        'Luna': 'Luna.avif',
        'Luna Blossom': 'LUNA BLOSSOM.avif',
        'Ma Vie': 'Ma Vie.avif',
        'Mademoiselle': 'Mademoiselle Rochas.avif',
        'Mademoiselle Rochas': 'Mademoiselle Rochas.avif',
        'Melle': 'Mademoiselle Rochas.avif',
        'Magnetic': 'Magnetic lacoste women.avif',
        'Manifesto': 'Manifesto.avif',
        'Marc Jacobs Perfect': 'perfect.avif',
        'Marc Jacobs Perfect Intens': 'Marc Jacobs Perfect Intense.avif',
        'Marc Jacobs Perfect Intense': 'Marc Jacobs Perfect Intense.avif',
        'Melle Eau Tres Belle': 'Melle Eau Tres Belle.avif',
        'Melody Of The Sun': 'Melody Of The Sun.avif',
        'Midnight Fantasy': 'Midnight Fantasy.avif',
        'Fantasy Midnight': 'Midnight Fantasy.avif',
        'Miracle': 'Miracle.avif',
        'Miss': 'Miss.avif',
        'Miss Dior Blooming': 'Miss Dior Blooming.avif',
        'Miss Dior Cherie': 'Miss Dior Cherie.avif',
        'Modern Princesse': 'Modern Princesse.avif',
        'Moment De Bonheur': 'Moment De Bonheur.avif',
        'Mon Guerlain': 'Mon Guerlain.avif',
        'Mon Paris': 'Mon Paris.avif',
        'Musc For Her': 'Musc for her.avif',
        'My': 'My Burberry.avif',
        'My Burberry': 'My Burberry.avif',
        'My Way': 'My Way.avif',
        'My Way Floral': 'My Way Floral.avif',
        'N19': 'N19.avif',
        'N5': 'N5.avif',
        'N5 Amber Sensuelle': 'N5 Amber Sensuelle.avif',
        'Narciso For Her': 'Narciso for her.avif',
        'Narciso Rodriguez FOR HER': 'Narciso for her.avif',
        'Nature': 'Nature.avif',
        'Naxos': 'Naxos.avif',
        'Nishane': 'Nishane.avif',
        'Noa': 'Noa.avif',
        'Nomade': 'Nomade.avif',
        'Nudes Bouquet': 'Nudes Bouquet.avif',
        'Nuit': 'Nuit.avif',
        'Nuit Tresor': 'Nuit Tresor.avif',
        'Nuit Tresor A La Folie': 'Nuit Tresor A La Folie.avif',
        'Nuit Tresor Fleur De Nuit': 'Nuit Tresor Fleur De Nuit.avif',
        'Ocean Lounge': 'Ocean Lounge.avif',
        'Olympea': 'Olympea.avif',
        'Ombre Nomade': 'Ombre Nomade.avif',
        'On The Beach': 'On The Beach.avif',
        'One Kiss': 'One Kiss.avif',
        'Orchid': 'Orchid.avif',
        'Organza': 'Organza.avif',
        'Orza Tiziana Tirrenzi': 'Orza Tiziana Tirrenzi.avif',
        'Oxygene': 'Oxygene.avif',
        'Pacific Chill': 'Pacific Chill.avif',
        'Paradiso': 'Paradiso.avif',
        'Paradox': 'Paradox prada.avif',
        'Paradox Intens': 'Paradox Intens.avif',
        'Paradox Intense': 'Paradox Intens.avif',
        'Paris': 'Paris.avif',
        'Parisienne': 'Parisienne.avif',
        'Pas Ce Soir': 'Pas Ce Soir.avif',
        'Passion': 'Passion.avif',
        'Peony': 'Peony zara.avif',
        'Perfect': 'perfect.avif',
        'Pineapple': 'Pineapple.avif',
        'Pistachio': 'Pisrachio.avif',
        'Pisrachio': 'Pisrachio.avif',
        'Play Intens': 'Play Intens.webp',
        'Play Intense': 'Play Intens.webp',
        'Plein Soleil': 'Plein Soleil.avif',
        'Poison': 'Poison dior.avif',
        'Poison Girl': 'Poison Girl.avif',
        'Poudré': 'Poudré.avif',
        'Femme': 'prada femme.avif',
        'Premier Jour Nina Ricci for women': 'Premier Jour Nina Ricci for women.avif',
        '1E Jour': 'Premier Jour Nina Ricci for women.avif',
        'Private Show': 'privet show.avif',
        'Privet Show': 'privet show.avif',
        'Promesse': 'Promesse.avif',
        'Queen': 'queen.avif',
        'Quelque Note D\'Amour': 'Quelque Note D\'Amour.avif',
        'Red Srobet': 'Red sorbet.avif',
        'Red Sorbet': 'Red sorbet.avif',
        'Redkiss': 'redkiss.avif',
        'Renaissance': 'Renaissance.avif',
        'Repetto': 'Repetto.avif',
        'Rose': 'Rose zara.avif',
        'Rose The One': 'Rose The One.avif',
        'Rose Darabie': 'Rose Darabie.avif',
        'Rouge': 'Rouge narciso.avif',
        'Sabaya': 'Sabaya.avif',
        'صبايا': 'Sabaya.avif',
        'Sakura': 'Sakura.avif',
        'Samsara': 'Samsara.avif',
        'Scandal': 'Scandal.avif',
        'Serpont De Bohème': 'Serpont De Bohème.avif',
        'Sense': 'verne.avif',
        'Sexy Graffiti': 'Sexy Graffiti.avif',
        'Shalis Women': 'shalis women.avif',
        'Share By Killian': 'Share By Killian.avif',
        'Shock Street': 'Shock Street.avif',
        'Show Me': 'Show Me.avif',
        'Si': 'Si.avif',
        'Si Passione': 'Si passione.avif',
        'Smoke Oud': 'Smoky Oud.avif',
        'Smoky Oud': 'Smoky Oud.avif',
        'So Elixir': 'So Elixir.avif',
        'So Scandal': 'So Scandal.avif',
        'Soft': 'Soft.avif',
        'Stronger With You': 'Stronger With You.avif',
        'Sucre Noir': 'Sucre Noir.avif',
        'Sugar': 'Sugar prada.avif',
        'Sun Java': 'Sun Java women.avif',
        'Sun Kissed Goddess': 'Sun Kissed Godess.avif',
        'Sun Kissed Godess': 'Sun Kissed Godess.avif',
        'Suprême Bouquet': 'Suprême Bouquet.avif',
        'Symphony': 'symphony.avif',
        'Taj': 'Taj.avif',
        'The One': 'The One for women.avif',
        'The One Desire': 'The One Desir.avif',
        'The One Desir': 'The One Desir.avif',
        'The One Gold': 'The One Gold.avif',
        'The Only One': 'The Only One.avif',
        'The Scent F': 'The Scent F.avif',
        'Touch Of Pink': 'Touch Of Pink.avif',
        'Tresor': 'Tresor.avif',
        'Tresor Midnight Rose': 'Tresor Midnight Rose.avif',
        'Ultraviolet': 'Ultraviolet.avif',
        'Vanilla': 'Vanilla kayali.avif',
        'Vanitas': 'Vanitas.avif',
        'Venice': 'Venice.avif',
        'Verne': 'verne.avif',
        'Very Irresistible': 'Very Irresistible.avif',
        'Very Irresistible Live': 'Very Irresistible Live.avif',
        'Very Sexy': 'Very sexy.avif',
        'Very Sexy Touch': 'Very Sexy Touch.avif',
        'Weekend': 'Weekend burberry.avif',
        'Wicked': 'Wicked.avif',
        'Winter': 'Winter zara.avif',
        'Women': 'Women.avif',
        'Wonder Rose': 'Wonder Rose zara.avif',
        'World': 'World.avif',
        'Xs Black': 'Xs Black.avif',
        'Xs Pure': 'Xs Pure.avif',
        'Yara': 'Yara.avif',
        'Yara Candy': 'Yara Candy.avif',
        'يارا Yara': 'Yara.avif',
        'Yellow Diamond': 'Yellow Diamond.avif',
        'Yes I Am': 'Yes I Am.avif',
        'Yvress': 'Yvress.avif',
        'Oriental': 'zara Oriental.avif',
        'Tropical': 'zara Tropical.avif',
        'Si': 'Si.avif',
        'Si Passione': 'Si passione.avif',
        'Smoke Oud': 'Smoky Oud.avif',
        'So Elixir': 'So Elixir.avif',
        'So Scandal': 'So Scandal.avif',
        'Soft': 'Soft.avif',
        'Stronger With You': 'Stronger With You.avif',
        'Sucre Noir': 'Sucre Noir.avif',
        'Sugar': 'Sugar prada.avif',
        'Sun Java': 'Sun Java women.avif',
        'Sun Kissed Godess': 'Sun Kissed Godess.avif',
        'Suprême Bouquet': 'Suprême Bouquet.avif',
        'Symphony': 'symphony.avif',
        'Taj': 'Taj.avif',
        'The One': 'The One for women.avif',
        'The One Desir': 'The One Desir.avif',
        'The One Gold': 'The One Gold.avif',
        'The Only One': 'The Only One.avif',
        'The Scent F': 'The Scent F.avif',
        'Touch Of Pink': 'Touch Of Pink.avif',
        'Tresor': 'Tresor.avif',
        'Tresor Midnight Rose': 'Tresor Midnight Rose.avif',
        'Ultraviolet': 'Ultraviolet.avif',
        'Vanilla': 'Vanilla kayali.avif',
        'Vanitas': 'Vanitas.avif',
        'Venice': 'Venice.avif',
        'Verne': 'verne.avif',
        'Very Irresistible': 'Very Irresistible.avif',
        'Very Irresistible Live': 'Very Irresistible Live.avif',
        'Very Sexy': 'Very sexy.avif',
        'Very Sexy Touch': 'Very Sexy Touch.avif',
        'Weekend': 'Weekend burberry.avif',
        'Wicked': 'Wicked.avif',
        'Winter': 'Winter zara.avif',
        'Women': 'Women.avif',
        'Wonder Rose': 'Wonder Rose zara.avif',
        'World': 'World.avif',
        'Xs Black': 'Xs Black.avif',
        'Xs Pure': 'Xs Pure.avif',
        'Yara': 'Yara.avif',
        'Yara Candy': 'Yara Candy.avif',
        'يارا Yara': 'Yara.avif',
        'Yellow Diamond': 'Yellow Diamond.avif',
        'Yes I Am': 'Yes I Am.avif',
        'Yvress': 'Yvress.avif',
        'Oriental': 'zara Oriental.avif',
        'Tropical': 'zara Tropical.avif',
        
        // Arabic Fragrances
        'رسالة': 'رسالة.avif',
        'دلع البنات': 'دلع البنات.jpg',
        'سحر الكلمات': 'سحر الكلمات.webp',
        'طيب الحجاز': 'طيب الحجاز.jpg',
        'طيب اليمن': 'طيب الحجاز.jpg',
        'عطر دلال': 'عطر دلال.webp',
        'عطر مريم': 'عطر مريم.webp',
        'عود شغف': 'عود شغف.webp',
        'عود فاخر': 'عود فاخر.webp',
        'عود كمبودي': 'عود كمبودي.webp',
        'كراميل': 'كراميل.jpg',
        'مخلط شوكو': 'مخلط شوكو.webp',
        'مسك التوت': 'مسك التوت.jpeg',
        'مسك الحجرة': 'مسك الحجرة.jpg',
        'مسك الرمان': 'مسك الرمان.png',
        'مسك الطهارة': 'مسك-الطهارة-.jpg',
        'هوس': 'هوس.avif',
        'وصال الذهب': 'وصال الذهب.webp',
        'أمير العود': 'أمير العود.webp',
        'جدور العود': 'جدور العود.jpg',
        'جواد الليل': 'جواد الليل.jpg',
        
        // Additional name variations and mappings
        'V': 'V valentino.avif',
        'Mr': 'Mr burberry.avif',
        'Iesel': 'diesel iesel.avif',
        'Dhermes': 'Terre dhermes.avif',
        'Strong Me': 'Strong Me.avif',
        'Marly': 'Carlisle marly.avif',
        'Black Tom Ford': 'Black tom ford.avif',
        'Tom Ford Black': 'Black tom ford.avif'
    };
    
    let imageName = imageMap[perfume.name];
    
    if (!imageName) {
        const lowerName = perfume.name.toLowerCase();
        for (const [key, value] of Object.entries(imageMap)) {
            if (key.toLowerCase() === lowerName) {
                imageName = value;
                break;
            }
        }
    }
    

    if (!imageName) {
        const lowerName = perfume.name.toLowerCase();
        
        // Specific fixes for problematic perfumes
        if (perfume.reference === "1404" && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci black.avif';
        }
        else if (perfume.reference === "5402" && perfume.brand.toLowerCase().includes('tom ford')) {
            imageName = 'Black tom ford.avif';
        }
        else if (lowerName.includes('guilty') && lowerName.includes('black') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci black.avif';
        }
        // Special handling for common name variations
        else if (lowerName.includes('perfect') && perfume.brand.toLowerCase().includes('marc')) {
            if (lowerName.includes('intens')) {
                imageName = 'Marc Jacobs Perfect Intense.avif';
            } else {
                imageName = 'perfect.avif';
            }
        }
        else if (lowerName.includes('paradox') && perfume.brand.toLowerCase().includes('prada')) {
            if (lowerName.includes('intens')) {
                imageName = 'Paradox Intens.avif';
            } else {
                imageName = 'Paradox prada.avif';
            }
        }
        else if (lowerName.includes('jimmy choo') || (lowerName.includes('choo') && perfume.brand.toLowerCase().includes('jimmy'))) {
            imageName = 'jimmy choo.avif';
        }
        else if (lowerName.includes('5th avenue') || lowerName.includes('5th avenue')) {
            imageName = '5th avenue.avif';
        }
        else if (lowerName.includes('decadence') && perfume.brand.toLowerCase().includes('marc')) {
            imageName = 'decadence.avif';
        }
        else if (lowerName.includes('loverdose') && perfume.brand.toLowerCase().includes('diesel')) {
            imageName = 'loverdose.avif';
        }
        else if (lowerName.includes('redkiss') && perfume.brand.toLowerCase().includes('diesel')) {
            imageName = 'redkiss.avif';
        }
        else if (lowerName.includes('bloom') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci Bloom.avif';
        }
        else if ((lowerName === 'black' || lowerName.includes('black')) && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci black.avif';
        }
        else if (lowerName.includes('black') && perfume.brand.toLowerCase().includes('burberry')) {
            imageName = 'Black burberry.avif';
        }
        else if ((lowerName === 'black' || lowerName.includes('black')) && perfume.brand.toLowerCase().includes('tom ford')) {
            imageName = 'Black tom ford.avif';
        }
        else if (lowerName.includes('eros') && perfume.brand.toLowerCase().includes('versace')) {
            imageName = 'Eros Versace.avif';
        }
        else if (lowerName.includes('flora') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci flora.avif';
        }
        else if (lowerName.includes('my way') && perfume.brand.toLowerCase().includes('armani')) {
            if (lowerName.includes('floral')) {
                imageName = 'My Way Floral.avif';
            } else {
                imageName = 'My Way.avif';
            }
        }
        else if (lowerName.includes('her') && perfume.brand.toLowerCase().includes('burberry')) {
            if (lowerName.includes('2022')) {
                imageName = 'Her 2022.avif';
            } else if (lowerName.includes('elixir')) {
                imageName = 'Her Elixir.avif';
            } else {
                imageName = 'Her burberry.avif';
            }
        }
        else if (lowerName.includes('weekend') && perfume.brand.toLowerCase().includes('burberry')) {
            imageName = 'Weekend burberry.avif';
        }
        else if (lowerName.includes('body') && perfume.brand.toLowerCase().includes('burberry')) {
            imageName = 'Body.avif';
        }
        else if (lowerName.includes('melle') && perfume.brand.toLowerCase().includes('rochas')) {
            imageName = 'Mademoiselle Rochas.avif';
        }
        else if (lowerName === 'my' && perfume.brand.toLowerCase().includes('burberry')) {
            imageName = 'My Burberry.avif';
        }
        else if (lowerName.includes('eden sparkling') && perfume.brand.toLowerCase().includes('kayali')) {
            imageName = 'Eden Sparkling Lychee.avif';
        }
    }
    
    return imageName ? `Fragrances/${imageName}` : 'default-perfume.jpg';
}

// Social Media Popup Functionality
function initializeSocialPopup() {
    const popup = document.getElementById('socialPopup');
    const closeBtn = document.getElementById('popupClose');
    const dontShowAgain = document.getElementById('dontShowAgain');
    const tiktokBtn = document.getElementById('tiktokBtn');
    const instagramBtn = document.getElementById('instagramBtn');

    // Check if user has chosen not to show popup again
    const hidePopup = localStorage.getItem('hideSocialPopup');
    
    if (!hidePopup) {
        // Show popup after a short delay
        setTimeout(() => {
            showSocialPopup();
        }, 2000);
    }

    // Close popup when close button is clicked
    closeBtn.addEventListener('click', closeSocialPopup);

    // Close popup when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closeSocialPopup();
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('show')) {
            closeSocialPopup();
        }
    });

    // Handle "Don't show again" checkbox
    dontShowAgain.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('hideSocialPopup', 'true');
        } else {
            localStorage.removeItem('hideSocialPopup');
        }
    });

    // Social media links - using actual EDEN PARFUM URLs
    tiktokBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Using your actual TikTok URL
        window.open('https://www.tiktok.com/@eden.parfum58?lang=en', '_blank');
        trackSocialClick('TikTok');
        closeSocialPopup();
    });

    instagramBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Using your actual Instagram URL
        window.open('https://www.instagram.com/eden._.parfum/?hl=en', '_blank');
        trackSocialClick('Instagram');
        closeSocialPopup();
    });

    function showSocialPopup() {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        setTimeout(() => {
            popup.querySelector('.social-popup').style.animation = 'popupBounce 0.6s ease-out';
        }, 100);
    }

    function closeSocialPopup() {
        popup.classList.remove('show');
        document.body.style.overflow = '';
        
        // Save that user has seen the popup this session
        sessionStorage.setItem('socialPopupShown', 'true');
    }

    function trackSocialClick(platform) {
        // Optional: Add analytics tracking here
        // Production: Remove debug logging
        
        // You can integrate with Google Analytics or other tracking services
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_follow', {
                'social_platform': platform,
                'event_category': 'Social Media',
                'event_label': 'Popup Follow Button'
            });
        }
    }
}

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes popupBounce {
        0% {
            transform: scale(0.3) translateY(-100px);
            opacity: 0;
        }
        50% {
            transform: scale(1.05) translateY(0);
        }
        70% {
            transform: scale(0.95) translateY(0);
        }
        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Google Maps Error Handling
function handleMapError() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        const iframe = mapContainer.querySelector('iframe');
        if (iframe) {
            // Set up error handler
            iframe.onerror = function() {
                // Google Maps iframe failed to load
                showMapFallback();
            };
            
            // Check if map loads within 15 seconds
            setTimeout(() => {
                checkMapLoaded();
            }, 15000);
        }
    }
}

function mapLoaded() {
    // Map loaded successfully - silent in production
}

function showMapFallback() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="map-fallback">
                <div class="fallback-content">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>Interactive Map</h3>
                    <p><strong>EDEN PARFUM</strong><br>
                    Q354+C5M, Place du 1er Mai<br>
                    Sidi M'Hamed 16000<br>
                    Algiers, Algeria</p>
                    <div class="map-actions">
                        <button class="map-button" onclick="openMap()">
                            <i class="fas fa-external-link-alt"></i>
                            Open in Google Maps
                        </button>
                        <button class="map-button" onclick="copyAddress()">
                            <i class="fas fa-copy"></i>
                            Copy Address
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function copyAddress() {
    const address = "Q354+C5M, Place du 1er Mai, Sidi M'Hamed 16000, Algiers, Algeria";
    if (navigator.clipboard) {
        navigator.clipboard.writeText(address).then(() => {
            showNotification('Address copied to clipboard!');
        }).catch(() => {
            fallbackCopyAddress(address);
        });
    } else {
        fallbackCopyAddress(address);
    }
}

function fallbackCopyAddress(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('Address copied to clipboard!');
    } catch (err) {
        showNotification('Could not copy address. Please copy manually.');
    }
    document.body.removeChild(textArea);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #a58b4c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Loading indicator functions
function showLoadingIndicator() {
    const grid = document.getElementById('perfumeGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-container" style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 200px; 
                grid-column: 1 / -1;
                font-size: 18px;
                color: #666;
            ">
                <div style="text-align: center;">
                    <div class="loading-spinner" style="
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #ff6b9d;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px auto;
                    "></div>
                    <p>Loading perfumes...</p>
                </div>
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
}

function hideLoadingIndicator() {
    const grid = document.getElementById('perfumeGrid');
    if (grid) {
        const loadingContainer = grid.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    }
}

function showErrorMessage(message, type = 'error') {
    const grid = document.getElementById('perfumeResults') || document.getElementById('perfumeGrid') || document.getElementById('results');
    if (grid) {
        const isWarning = type === 'warning';
        const color = isWarning ? '#f39c12' : '#e74c3c';
        const icon = isWarning ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
        const buttonText = isWarning ? 'Continue Anyway' : 'Reload Page';
        const buttonAction = isWarning ? 'this.parentElement.parentElement.remove()' : 'location.reload()';
        
        grid.innerHTML = `
            <div class="error-container" style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 200px; 
                grid-column: 1 / -1;
                font-size: 18px;
                color: ${color};
                text-align: center;
                background: ${isWarning ? 'rgba(243, 156, 18, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
                border-radius: 10px;
                margin: 1rem 0;
                padding: 2rem;
            ">
                <div>
                    <i class="fas ${icon}" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    <p>${message}</p>
                    <button onclick="${buttonAction}" style="
                        background: ${isWarning ? '#f39c12' : '#ff6b9d'};
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 15px;
                    ">Try Again</button>
                </div>
            </div>
        `;
    }
}

function checkMapLoaded() {
    const iframe = document.querySelector('.google-map');
    if (iframe && iframe.parentNode) {
        // Check if iframe is still in DOM and visible
        const rect = iframe.getBoundingClientRect();
        if (rect.height === 0) {
            // Google Maps iframe appears to be blocked or failed to load
            showMapFallback();
        } else {
            // Google Maps appears to be loaded successfully
        }
    }
}

// Add CSS for notification animation
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyle);

// Initialize map error handling when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    handleMapError();
});

// Performance optimization for fast image loading
document.addEventListener('DOMContentLoaded', function() {
    // Production: Remove debug logging
    
    // Preload critical brand logos for instant display
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
        window.addEventListener('perfumesLoaded', function(event) {
            if (event.detail && event.detail.perfumes) {
                const firstSix = event.detail.perfumes.slice(0, 6);
                const imageNames = firstSix
                    .map(p => getFragranceImage(p))
                    .filter(imageName => imageName && imageName !== null);
                window.fastImageLoader.preloadCriticalImages(imageNames);
            }
        });
    }
});

// Performance monitoring for catalog loading
function monitorCatalogPerformance() {
    const startTime = Date.now();
    let perfumeCardsLoaded = 0;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('perfume-item')) {
                    perfumeCardsLoaded++;
                    
                    // Production: Remove debug logging for performance
                    // Simplified performance monitoring for production
                }
            });
        });
    });
    
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
        observer.observe(resultsContainer, { childList: true, subtree: true });
    }
}

// Start performance monitoring
setTimeout(monitorCatalogPerformance, 1000);
