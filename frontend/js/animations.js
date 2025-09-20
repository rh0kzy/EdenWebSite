// Animations Module - Handles scroll animations, counters, hover effects, and visual animations
export class AnimationsModule {
    constructor() {
        this.observer = null;
        this.statsObserver = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupHoverEffects();
        this.setupParallaxEffect();
        this.setupBottle3DEffect();
        
        this.isInitialized = true;
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
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
            this.observer.observe(el);
        });
    }

    setupCounterAnimations() {
        const stats = document.querySelectorAll('.stat h3');
        this.statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.hasAttribute('data-animated')) {
                    entry.target.setAttribute('data-animated', 'true');
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => {
            this.statsObserver.observe(stat);
        });
    }

    setupHoverEffects() {
        // Category card hover effects
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupParallaxEffect() {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const parallax = heroSection.querySelector('.hero-bg');
                if (parallax) {
                    const speed = scrolled * 0.5;
                    parallax.style.transform = `translateY(${speed}px)`;
                }
            });
        }
    }

    setupBottle3DEffect() {
        const perfumeBottle = document.querySelector('.perfume-bottle');
        if (perfumeBottle) {
            perfumeBottle.addEventListener('mousemove', (e) => {
                const rect = perfumeBottle.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                perfumeBottle.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            perfumeBottle.addEventListener('mouseleave', () => {
                perfumeBottle.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        }
    }

    animateCounter(element) {
        const target = parseInt(element.innerText.replace(/[^\d]/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                element.innerText = Math.ceil(current) + (element.innerText.includes('+') ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = target + (element.innerText.includes('+') ? '+' : '');
            }
        };
        
        updateCounter();
    }

    // Public method to manually trigger animations
    triggerAnimation(element) {
        if (element) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.statsObserver) {
            this.statsObserver.disconnect();
        }
        this.isInitialized = false;
    }
}

// Utility function for external use
export function animateCounter(element) {
    const animations = new AnimationsModule();
    animations.animateCounter(element);
}