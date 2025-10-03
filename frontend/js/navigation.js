// Navigation Module - Handles mobile navigation, header effects, and smooth scrolling
export class NavigationModule {
    constructor() {
        this.hamburger = null;
        this.navMenu = null;
        this.navLinks = [];
        this.header = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.header = document.querySelector('.header');

        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupHeaderScrollEffect();
        
        this.isInitialized = true;
    }

    setupMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;

        // Toggle mobile menu
        this.hamburger.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.hamburger.classList.remove('active');
                this.navMenu.classList.remove('active');
            });
        });
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

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

                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    this.scrollToSection(targetSection);
                }
            });
        });
    }

    setupHeaderScrollEffect() {
        if (!this.header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.boxShadow = 'none';
            }
        });
    }

    scrollToSection(element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    // Public utility method for scrolling to sections by ID
    static scrollToSectionById(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
}

// Export the utility function for backwards compatibility
export function scrollToSection(sectionId) {
    NavigationModule.scrollToSectionById(sectionId);
}