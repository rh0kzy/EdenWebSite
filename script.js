// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
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
            
            // Don't prevent default for external links (like catalog.html)
            if (href.includes('.html')) {
                return; // Let the browser handle the navigation
            }
            
            e.preventDefault();
            const targetId = href;
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
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
    // Opens Google Maps to EDEN PARFUM exact location
    const mapsUrl = 'https://www.google.com/maps/place/Eden+parfum/@36.7585934,3.0546987,332m/data=!3m2!1e3!4b1!4m6!3m5!1s0x128fb30018c34e03:0x69b304bc5ec91959!8m2!3d36.7585922!4d3.0554277!16s%2Fg%2F11w2cyhqj_?entry=ttu&g_ep=EgoyMDI1MDgxMy4wIKXMDSoASAFQAw%3D%3D';
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
    console.log('Searching for:', query);
    // Future implementation could filter perfumes or redirect to search results
}

// Newsletter Subscription (for future implementation)
function subscribeNewsletter(email) {
    // This function can be expanded to handle newsletter subscriptions
    console.log('Newsletter subscription for:', email);
    showNotification('Thank you for subscribing to our newsletter!', 'success');
}

// Product Filter (for future implementation)
function filterProducts(category) {
    // This function can be expanded to filter products by category
    console.log('Filtering products by:', category);
    // Future implementation could show/hide products based on category
}

// Wishlist Functionality (for future implementation)
function addToWishlist(productId) {
    // This function can be expanded to handle wishlist functionality
    console.log('Added to wishlist:', productId);
    showNotification('Added to wishlist!', 'success');
}

// Language Toggle (for future implementation)
function toggleLanguage(lang) {
    // This function can be expanded to handle multiple languages
    console.log('Switching to language:', lang);
    // Future implementation could switch between Arabic and French
}

// Perfume Catalog Search Functionality
let filteredPerfumes = [];
let currentSearchTerm = '';
let currentBrandFilter = '';
let currentGenderFilter = '';

// Initialize catalog when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCatalog();
});

function initializeCatalog() {
    // Check if perfumes database is loaded
    if (typeof perfumesDatabase === 'undefined') {
        console.error('Perfumes database not loaded');
        return;
    }
    
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
            genderValue = 'Mixte';
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
    filteredPerfumes = [...perfumesDatabase];
    
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

function populateFilters() {
    const brandFilter = document.getElementById('brandFilter');
    const genderFilter = document.getElementById('genderFilter');
    
    // Populate brand filter
    const brands = getUniqueBrands();
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
    
    // Populate gender filter
    const genders = getUniqueGenders();
    genders.forEach(gender => {
        const option = document.createElement('option');
        option.value = gender;
        option.textContent = gender;
        genderFilter.appendChild(option);
    });
}

function setupSearchEventListeners() {
    const searchInput = document.getElementById('perfumeSearch');
    const brandFilter = document.getElementById('brandFilter');
    const genderFilter = document.getElementById('genderFilter');
    const clearButton = document.getElementById('clearFilters');
    
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
        searchInput.value = '';
        brandFilter.value = '';
        genderFilter.value = '';
        currentSearchTerm = '';
        currentBrandFilter = '';
        currentGenderFilter = '';
        filterPerfumes();
    });
}

function filterPerfumes() {
    filteredPerfumes = perfumesDatabase.filter(perfume => {
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
    
    displayPerfumes();
    updateResultsCount();
}

function displayPerfumes() {
    const resultsContainer = document.getElementById('perfumeResults');
    const noResultsDiv = document.getElementById('noResults');
    
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
        resultsContainer.appendChild(perfumeItem);
    });
}

function createPerfumeItem(perfume) {
    const item = document.createElement('div');
    item.className = 'perfume-item';
    
    const brandLogo = getBrandLogo(perfume.brand);
    const fragranceImage = getFragranceImage(perfume);
    
    const brandSection = brandLogo 
        ? `<div class="perfume-brand">
               <img src="${brandLogo}" alt="${perfume.brand}" class="brand-logo">
               <span>${perfume.brand || 'No Brand'}</span>
           </div>`
        : `<div class="perfume-brand">
               <span>${perfume.brand || 'No Brand'}</span>
           </div>`;
    
    const imageSection = fragranceImage 
        ? `<div class="perfume-image">
               <img src="${fragranceImage}" alt="${perfume.name}" class="fragrance-image">
           </div>`
        : '<div class="perfume-image-placeholder"><i class="fas fa-spray-can"></i></div>';
    
    item.innerHTML = `
        ${imageSection}
        <div class="perfume-header">
            <div class="perfume-name">${perfume.name}</div>
            <div class="perfume-reference">#${perfume.reference}</div>
        </div>
        <div class="perfume-details">
            ${brandSection}
            <div class="perfume-gender">${perfume.gender}</div>
        </div>
    `;
    
    // Add click event to show perfume details or contact
    item.addEventListener('click', function() {
        showPerfumeDetails(perfume);
    });
    
    return item;
}

function showPerfumeDetails(perfume) {
    const message = `Hi! I'm interested in ${perfume.name} (${perfume.brand}) - Reference #${perfume.reference}. Is it available?`;
    const whatsappUrl = `https://wa.me/213661808980?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    const total = perfumesDatabase.length;
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
        'Dolce & Gabbana': 'photos/dolce_gabanna.png',
        'Burberry': 'photos/logoburberry-1400x433.png',
        'Zara': 'photos/ZARA.png',
        'Diesel': 'photos/Diesel_Parfume_Logo.png',
        'Chloé': 'photos/chloe-Converted.png'
    };
    
    return brandLogos[brand] || null;
}

function getFragranceImage(perfume) {
    // Create a mapping between perfume names and their image files
    const imageMap = {
        // Exact matches first
        '1881': '1881.avif',
        '5Th Avenue': '5th avenue.avif',
        'Addict': 'Addict.avif',
        'Elle': 'Azzaro elle.avif',
        'Bamoboo': 'Bamoboo gucci.avif',
        'Belle De Jour': 'Belle De Jour.avif',
        'Black Amber': 'Black Amber.avif',
        'Black': 'gucci black.avif',
        'Born In Paradise': 'Born In Paradise.avif',
        'Bright Cristal Absolut': 'Bright Cristal Absolut.avif',
        'Bright Cristal': 'Bright Cristal.avif',
        'Brisa Cubana': 'Brisa Cubana.avif',
        'Bloom': 'gucci Bloom.avif',
        'Bulgari Jasmine Noir': 'Bulgari Jasmine Noir.avif',
        'Candy Love': 'Candy Love.avif',
        'Cherry In The Air': 'Cherry In The Air.avif',
        'Cherry Smothie': 'Cherry Smothie.avif',
        'Collection': 'Collection escada.avif',
        'Creme Bruller': 'Creme Bruller.avif',
        'Cristal Noir': 'Cristal Noir.avif',
        'Marc Jacobs Decadence': 'decadence.avif',
        'Decadence': 'decadence.avif',
        'Dylan Purple': 'Dylan Purple.avif',
        'Eau Des Bienfaits': 'Eau Des Bienfaits.avif',
        'Envy Me': 'Envy Me.avif',
        'Eros': 'Eros Versace.avif',
        'Fiesta Karioka': 'Fiesta Karioka.avif',
        'Flora': 'gucci flora.avif',
        'Fruite': 'Fruite zara.avif',
        'Gardenia': 'Gardenia.avif',
        'Golden Decade': 'Golden Decade.avif',
        'Good Girl Gone Bad': 'Good Girl Gone Bad.avif',
        'Happy Hour': 'Happy Hour.avif',
        'Hypnotic Poison': 'Hypnotic Poison.avif',
        'Incidence': 'Incidence.avif',
        'J\'Adore In Joy': 'J\'Adore In Joy.avif',
        'J\'Adore Lumière': 'J\'Adore Lumière.avif',
        'J\'Adore': 'J\'Adore.avif',
        'Choo': 'jimmy choo.avif',
        'Joy': 'Joy.avif',
        'Love': 'Love killian.avif',
        'Loverdose': 'loverdose.avif',
        'Marc Jacobs Perfect Intens': 'Marc Jacobs Perfect Intense.avif',
        'Marc Jacobs Perfect Intense': 'Marc Jacobs Perfect Intense.avif',
        'Melle Eau Tres Belle': 'Melle Eau Tres Belle.avif',
        'Miss Dior Blooming': 'Miss Dior Blooming.avif',
        'Miss Dior Cherie': 'Miss Dior Cherie.avif',
        'Nudes Bouquet': 'Nudes Bouquet.avif',
        'Ocean Lounge': 'Ocean Lounge.avif',
        'Orchid': 'Orchid.avif',
        'Paradox Intens': 'Paradox Intens.avif',
        'Paradox': 'Paradox prada.avif',
        'Peony': 'Peony zara.avif',
        'Marc Jacobs Perfect': 'perfect.avif',
        'Perfect': 'perfect.avif',
        'Poison': 'Poison dior.avif',
        'Poison Girl': 'Poison Girl.avif',
        'Femme': 'prada femme.avif',
        'Red Srobet': 'Red sorbet.avif',
        'Red Sorbet': 'Red sorbet.avif',
        'Redkiss': 'redkiss.avif',
        'Rose': 'Rose zara.avif',
        'Sakura': 'Sakura.avif',
        'Sexy Graffiti': 'Sexy Graffiti.avif',
        'Show Me': 'Show Me.avif',
        'Sugar': 'Sugar prada.avif',
        'Sun Kissed Godess': 'Sun Kissed Godess.avif',
        'Taj': 'Taj.avif',
        'Vanitas': 'Vanitas.avif',
        'Venice': 'Venice.avif',
        'Winter': 'Winter zara.avif',
        'Wonder Rose': 'Wonder Rose zara.avif',
        'Yellow Diamond': 'Yellow Diamond.avif',
        'Oriental': 'zara Oriental.avif',
        'Tropical': 'zara Tropical.avif'
    };
    
    // Try exact match first
    let imageName = imageMap[perfume.name];
    
    // If no exact match, try case-insensitive matching
    if (!imageName) {
        const lowerName = perfume.name.toLowerCase();
        for (const [key, value] of Object.entries(imageMap)) {
            if (key.toLowerCase() === lowerName) {
                imageName = value;
                break;
            }
        }
    }
    
    // Try partial matching for common variations
    if (!imageName) {
        const lowerName = perfume.name.toLowerCase();
        
        // Special handling for common name variations
        if (lowerName.includes('perfect') && perfume.brand.toLowerCase().includes('marc')) {
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
        else if (lowerName.includes('black') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci black.avif';
        }
        else if (lowerName.includes('eros') && perfume.brand.toLowerCase().includes('versace')) {
            imageName = 'Eros Versace.avif';
        }
        else if (lowerName.includes('flora') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci flora.avif';
        }
    }
    
    return imageName ? `photos/Fragrances/${imageName}` : null;
}
