// UI Utilities Module - Handles notifications, forms, WhatsApp, maps, and other UI interactions
export class UIUtilsModule {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupContactForm();
        this.setupMapErrorHandling();
        this.addNotificationStyles();
        this.initDelegatedHandlers();
        
        this.isInitialized = true;
    }

    setupContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const name = contactForm.querySelector('input[type="text"]').value;
                const email = contactForm.querySelector('input[type="email"]').value;
                const phone = contactForm.querySelector('input[type="tel"]').value;
                const message = contactForm.querySelector('textarea').value;
                
                // Simple validation
                if (!name || !email || !message) {
                    this.showNotification('Please fill in all required fields.', 'error');
                    return;
                }
                
                // Simulate form submission
                this.showNotification('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            });
        }
    }

    setupMapErrorHandling() {
        setTimeout(() => {
            this.checkMapLoaded();
        }, 3000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Use CSS class instead of inline styles
        notification.classList.add(`notification-${type}`);
        
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
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showSimpleNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'loading-overlay';
        
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

    showLoadingIndicator(targetElement = null) {
        const grid = targetElement || document.getElementById('perfumeGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="loading-container" style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 200px; 
                    grid-column: 1 / -1;
                    font-size: 18px;
                    color: var(--text-secondary);
                ">
                    <div style="text-align: center;">
                        <div class="loading-spinner"></div>
                        <p class="loading-text">Loading perfumes...</p>
                    </div>
                </div>
            `;
            
            // Spinner animation is now in CSS
        }
    }

    hideLoadingIndicator(targetElement = null) {
        const grid = targetElement || document.getElementById('perfumeGrid');
        if (grid) {
            const loadingContainer = grid.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.remove();
            }
        }
    }

    showErrorMessage(message, type = 'error') {
        const grid = document.getElementById('perfumeResults') || 
                     document.getElementById('perfumeGrid') || 
                     document.getElementById('results');
        if (grid) {
            const isWarning = type === 'warning';
            const alertClass = isWarning ? 'warning' : 'error';
            const icon = isWarning ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
            
            grid.innerHTML = `
                <div class="floating-alert ${alertClass}" style="
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 200px; 
                    grid-column: 1 / -1;
                    text-align: center;
                    border-radius: 10px;
                    margin: 1rem 0;
                    padding: 2rem;
                    position: relative;
                    transform: none;
                ">
                    <div>
                        <i class="fas ${icon}" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                        <p>${message}</p>
                        <button data-action="reload" class="empty-state-button">Try Again</button>
                    </div>
                </div>
            `;
        }
    }

    checkMapLoaded() {
        const iframe = document.querySelector('.google-map');
        if (iframe && iframe.parentNode) {
            // Check if iframe is still in DOM and visible
            const rect = iframe.getBoundingClientRect();
            if (rect.height === 0) {
                // Google Maps iframe appears to be blocked or failed to load
                this.showMapFallback();
            }
        }
    }

    showMapFallback() {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: var(--text-lighter); margin-bottom: 1rem;"></i>
                    <h3>Map Not Available</h3>
                    <p>Google Maps is not accessible. Click below to open in your map app.</p>
                    <button data-action="open-map" class="empty-state-button">Open in Maps</button>
                </div>
            `;
        }
    }

            // Add delegated handlers for dynamic buttons (reload, open-map)
            initDelegatedHandlers() {
                document.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-action]');
                    if (!btn) return;
                    const action = btn.getAttribute('data-action');
                    if (action === 'reload') {
                        location.reload();
                    } else if (action === 'open-map') {
                        openMap();
                    }
                });
            }

    addNotificationStyles() {
        // Add CSS for notification animation
        if (!document.getElementById('notification-styles')) {
            const notificationStyle = document.createElement('style');
            notificationStyle.id = 'notification-styles';
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
        }
    }
}

// Utility functions for external use
export function openWhatsApp(message = '') {
    const phoneNumber = '213661808980';
    const defaultMessage = 'Hello EDEN PARFUM! I would like to inquire about your perfume collection.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
}

export function openMap() {
    // Opens Google Maps to EDEN PARFUM exact location using place ID for reliability
    const mapsUrl = 'https://www.google.com/maps/place/Eden+parfum/@36.7585922,3.0554277,17z/data=!3m1!4b1!4m6!3m5!1s0x128fb30018c34e03:0x69b304bc5ec91959!8m2!3d36.7585922!4d3.0554277!16s%2Fg%2F11w2cyhqj_';
    window.open(mapsUrl, '_blank');
}

export function showNotification(message, type = 'info') {
    const uiUtils = new UIUtilsModule();
    uiUtils.showNotification(message, type);
}

export function showLoadingIndicator() {
    const uiUtils = new UIUtilsModule();
    uiUtils.showLoadingIndicator();
}

export function hideLoadingIndicator() {
    const uiUtils = new UIUtilsModule();
    uiUtils.hideLoadingIndicator();
}

export function showErrorMessage(message, type = 'error') {
    const uiUtils = new UIUtilsModule();
    uiUtils.showErrorMessage(message, type);
}