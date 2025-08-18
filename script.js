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
    
    // Initialize search
    filteredPerfumes = [...perfumesDatabase];
    displayPerfumes();
    updateResultsCount();
    
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
    const brandSection = brandLogo 
        ? `<div class="perfume-brand">
               <img src="${brandLogo}" alt="${perfume.brand}" class="brand-logo">
               <span>${perfume.brand || 'No Brand'}</span>
           </div>`
        : `<div class="perfume-brand">
               <span>${perfume.brand || 'No Brand'}</span>
           </div>`;
    
    item.innerHTML = `
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
