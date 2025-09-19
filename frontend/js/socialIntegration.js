/**
 * Eden Parfum Advanced Social Media Integration
 * Comprehensive social sharing, engagement, and marketing system
 * 
 * Features:
 * - Advanced social sharing with custom messages
 * - Instagram/TikTok posting guides
 * - Real-time follower counts
 * - Social analytics tracking
 * - Floating social media bar
 * - Social media feeds integration
 * - User engagement analytics
 */

class EdenSocialIntegration {
    constructor() {
        this.config = {
            siteName: 'Eden Parfum',
            siteUrl: window.location.origin,
            defaultImage: '/photos/eden parfum logo.png',
            socialAccounts: {
                facebook: 'https://facebook.com/edenparfum',
                instagram: 'https://instagram.com/edenparfum',
                tiktok: 'https://tiktok.com/@edenparfum',
                twitter: 'https://twitter.com/edenparfum',
                whatsapp: 'https://wa.me/213123456789',
                youtube: 'https://youtube.com/@edenparfum',
                linkedin: 'https://linkedin.com/company/edenparfum'
            },
            analytics: {
                trackEvents: true,
                endpoint: '/api/social/analytics'
            },
            followerCounts: {
                instagram: '15.2K',
                facebook: '8.7K',
                tiktok: '32.5K',
                youtube: '4.1K',
                twitter: '2.8K'
            }
        };
        
        this.init();
    }

    init() {
        this.loadCSS();
        this.createFloatingSocial();
        this.setupGlobalSocialFeatures();
        this.initializeSocialAnalytics();
        console.log('🌸 Eden Social Integration initialized');
    }

    loadCSS() {
        if (!document.querySelector('#eden-social-styles')) {
            const link = document.createElement('link');
            link.id = 'eden-social-styles';
            link.rel = 'stylesheet';
            link.href = '/css/social-integration.css';
            document.head.appendChild(link);
        }
    }

    // Create floating social media bar
    createFloatingSocial() {
        const floatingBar = document.createElement('div');
        floatingBar.className = 'eden-floating-social';
        floatingBar.innerHTML = `
            <div class="floating-social-toggle" title="Follow Eden Parfum">
                <i class="fas fa-heart"></i>
                <span>Follow Us</span>
            </div>
            <div class="floating-social-menu">
                <div class="social-menu-header">
                    <img src="/photos/eden parfum logo.png" alt="Eden Parfum" class="social-logo">
                    <h4>Follow Eden Parfum</h4>
                    <p>Stay updated with our latest fragrances</p>
                </div>
                <div class="social-links-grid">
                    <a href="${this.config.socialAccounts.instagram}" target="_blank" class="social-link instagram" data-platform="instagram">
                        <i class="fab fa-instagram"></i>
                        <div class="social-info">
                            <span class="social-name">Instagram</span>
                        </div>
                    </a>
                    <a href="${this.config.socialAccounts.facebook}" target="_blank" class="social-link facebook" data-platform="facebook">
                        <i class="fab fa-facebook-f"></i>
                        <div class="social-info">
                            <span class="social-name">Facebook</span>
                        </div>
                    </a>
                    <a href="${this.config.socialAccounts.tiktok}" target="_blank" class="social-link tiktok" data-platform="tiktok">
                        <i class="fab fa-tiktok"></i>
                        <div class="social-info">
                            <span class="social-name">TikTok</span>
                        </div>
                    </a>
                    <a href="${this.config.socialAccounts.youtube}" target="_blank" class="social-link youtube" data-platform="youtube">
                        <i class="fab fa-youtube"></i>
                        <div class="social-info">
                            <span class="social-name">YouTube</span>
                        </div>
                    </a>
                    <a href="${this.config.socialAccounts.whatsapp}" target="_blank" class="social-link whatsapp" data-platform="whatsapp">
                        <i class="fab fa-whatsapp"></i>
                        <div class="social-info">
                            <span class="social-name">WhatsApp</span>
                        </div>
                    </a>
                </div>
                <div class="social-menu-footer">
                    <button class="share-page-btn" onclick="window.edenSocial.showShareModal()">
                        <i class="fas fa-share-alt"></i>
                        Share This Page
                    </button>
                </div>
            </div>
        `;

        // Toggle functionality
        const toggle = floatingBar.querySelector('.floating-social-toggle');
        const menu = floatingBar.querySelector('.floating-social-menu');
        
        toggle.addEventListener('click', () => {
            floatingBar.classList.toggle('expanded');
            this.trackEvent('toggle_social_menu', 'interaction');
        });

        // Track social clicks
        floatingBar.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.trackEvent('social_follow_click', platform);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!floatingBar.contains(e.target)) {
                floatingBar.classList.remove('expanded');
            }
        });

        document.body.appendChild(floatingBar);
        return floatingBar;
    }

    // Advanced social sharing system
    createSocialShareButtons(perfumeData = null) {
        const shareContainer = document.createElement('div');
        shareContainer.className = 'eden-social-share';
        
        const title = perfumeData ? 
            `🌸 ${perfumeData.name} by ${perfumeData.brand}` : 
            '🌸 Eden Parfum - Premium Fragrance Collection';
        
        shareContainer.innerHTML = `
            <div class="social-share-header">
                <div class="share-icon">
                    <i class="fas fa-share-alt"></i>
                </div>
                <div class="share-content">
                    <h3>Share ${perfumeData ? 'This Fragrance' : 'Eden Parfum'}</h3>
                    <p>Spread the love of beautiful fragrances</p>
                </div>
            </div>
            <div class="social-share-buttons">
                <button class="share-btn facebook" data-platform="facebook" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fab fa-facebook-f"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">Facebook</span>
                        <span class="btn-desc">Share with friends</span>
                    </div>
                    <div class="share-count" data-platform="facebook">0</div>
                </button>
                
                <button class="share-btn instagram" data-platform="instagram" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fab fa-instagram"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">Instagram</span>
                        <span class="btn-desc">Post to stories</span>
                    </div>
                </button>
                
                <button class="share-btn tiktok" data-platform="tiktok" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fab fa-tiktok"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">TikTok</span>
                        <span class="btn-desc">Create video</span>
                    </div>
                </button>
                
                <button class="share-btn twitter" data-platform="twitter" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fab fa-twitter"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">Twitter</span>
                        <span class="btn-desc">Tweet about it</span>
                    </div>
                    <div class="share-count" data-platform="twitter">0</div>
                </button>
                
                <button class="share-btn whatsapp" data-platform="whatsapp" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">WhatsApp</span>
                        <span class="btn-desc">Send to contacts</span>
                    </div>
                </button>
                
                <button class="share-btn copy" data-platform="copy" data-title="${title}">
                    <div class="btn-icon">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="btn-content">
                        <span class="btn-name">Copy Link</span>
                        <span class="btn-desc">Get shareable URL</span>
                    </div>
                </button>
            </div>
        `;

        // Add event listeners
        shareContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.share-btn');
            if (btn) {
                const platform = btn.dataset.platform;
                this.shareContent(platform, perfumeData);
            }
        });

        // Load share counts
        this.loadShareCounts(shareContainer);

        return shareContainer;
    }

    // Share content with platform-specific optimization
    shareContent(platform, perfumeData = null) {
        const url = perfumeData ? 
            `${this.config.siteUrl}/perfume-detail.html?id=${perfumeData.id}` : 
            window.location.href;
        
        const title = perfumeData ? 
            `🌸 ${perfumeData.name} by ${perfumeData.brand} | Eden Parfum` : 
            '🌸 Eden Parfum - Premium Fragrance Collection in Algeria';
        
        const description = perfumeData ? 
            `Discover the exquisite ${perfumeData.name} fragrance. ${perfumeData.gender} ${perfumeData.concentration || 'perfume'}. Premium quality at Eden Parfum! #EdenParfum #${perfumeData.brand} #Perfume` :
            'Discover 500+ premium fragrances from top luxury brands. Fast delivery across Algeria. Find your perfect scent at Eden Parfum! #EdenParfum #Perfume #Algeria';
        
        const image = perfumeData && perfumeData.photo ? 
            `${this.config.siteUrl}/photos/Fragrances/${perfumeData.photo}` : 
            `${this.config.siteUrl}${this.config.defaultImage}`;

        const hashtags = perfumeData ? 
            `EdenParfum,${perfumeData.brand.replace(/\s+/g, '')},Perfume,${perfumeData.gender},Algeria,Luxury` :
            'EdenParfum,Perfume,Algeria,Luxury,Fragrance,Beauty';

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ' - ' + description)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            copy: url
        };

        switch (platform) {
            case 'facebook':
            case 'twitter':
            case 'whatsapp':
            case 'linkedin':
                this.openShareWindow(shareUrls[platform], platform);
                break;
            case 'instagram':
                this.showInstagramGuide(image, title, description);
                break;
            case 'tiktok':
                this.showTikTokGuide(image, title, description);
                break;
            case 'copy':
                this.copyToClipboard(url);
                break;
        }

        // Track sharing event
        this.trackEvent('share_content', platform, perfumeData?.name || 'homepage');
        this.incrementShareCount(platform);
    }

    // Instagram sharing guide modal
    showInstagramGuide(image, title, description) {
        const modal = document.createElement('div');
        modal.className = 'social-guide-modal instagram-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon instagram">
                        <i class="fab fa-instagram"></i>
                    </div>
                    <h3>Share on Instagram</h3>
                    <button class="close-modal" aria-label="Close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="guide-steps">
                        <div class="step active" data-step="1">
                            <div class="step-header">
                                <span class="step-number">1</span>
                                <h4>Save Image</h4>
                            </div>
                            <div class="step-content">
                                <div class="image-preview">
                                    <img src="${image}" alt="Share image" class="share-preview">
                                    <div class="image-overlay">
                                        <button class="download-btn" onclick="window.edenSocial.downloadImage('${image}', '${title}')">
                                            <i class="fas fa-download"></i>
                                            Save to Phone
                                        </button>
                                    </div>
                                </div>
                                <p>Long press the image above to save it to your device</p>
                            </div>
                        </div>
                        
                        <div class="step" data-step="2">
                            <div class="step-header">
                                <span class="step-number">2</span>
                                <h4>Copy Caption</h4>
                            </div>
                            <div class="step-content">
                                <div class="caption-box">
                                    <textarea readonly class="caption-text">${title}

${description}

🌸 Premium fragrances at Eden Parfum
✨ 500+ fragrances from luxury brands  
🚚 Fast delivery across Algeria
💎 100% authentic perfumes
🎁 Perfect gifts for loved ones

Visit us: ${this.config.siteUrl}

#EdenParfum #Perfume #Algeria #Luxury #Fragrance #Beauty #Authentic #PremiumQuality</textarea>
                                    <button class="copy-caption-btn">
                                        <i class="fas fa-copy"></i>
                                        Copy Caption
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="step" data-step="3">
                            <div class="step-header">
                                <span class="step-number">3</span>
                                <h4>Post & Tag</h4>
                            </div>
                            <div class="step-content">
                                <div class="post-actions">
                                    <a href="${this.config.socialAccounts.instagram}" target="_blank" class="action-btn instagram">
                                        <i class="fab fa-instagram"></i>
                                        Open Instagram
                                    </a>
                                    <div class="tag-info">
                                        <p><strong>Don't forget to:</strong></p>
                                        <ul>
                                            <li>Tag @edenparfum in your post</li>
                                            <li>Use #EdenParfum hashtag</li>
                                            <li>Share to your stories</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step-navigation">
                        <button class="nav-btn prev-btn" onclick="window.edenSocial.previousStep(this)">
                            <i class="fas fa-chevron-left"></i>
                            Previous
                        </button>
                        <div class="step-dots">
                            <span class="dot active" data-step="1"></span>
                            <span class="dot" data-step="2"></span>
                            <span class="dot" data-step="3"></span>
                        </div>
                        <button class="nav-btn next-btn" onclick="window.edenSocial.nextStep(this)">
                            Next
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalInteractions(modal);
        this.trackEvent('open_instagram_guide', 'guide');
    }

    // TikTok sharing guide modal
    showTikTokGuide(image, title, description) {
        const modal = document.createElement('div');
        modal.className = 'social-guide-modal tiktok-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon tiktok">
                        <i class="fab fa-tiktok"></i>
                    </div>
                    <h3>Create TikTok Content</h3>
                    <button class="close-modal" aria-label="Close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="tiktok-ideas">
                        <h4>💡 Content Ideas</h4>
                        <div class="ideas-grid">
                            <div class="idea-card">
                                <div class="idea-icon">🎬</div>
                                <h5>Unboxing Video</h5>
                                <p>Show the perfume packaging and first impressions</p>
                            </div>
                            <div class="idea-card">
                                <div class="idea-icon">👃</div>
                                <h5>Scent Review</h5>
                                <p>Describe the fragrance notes and your experience</p>
                            </div>
                            <div class="idea-card">
                                <div class="idea-icon">✨</div>
                                <h5>Styling Tips</h5>
                                <p>When and how to wear this fragrance</p>
                            </div>
                            <div class="idea-card">
                                <div class="idea-icon">🔥</div>
                                <h5>Before/After</h5>
                                <p>Show the confidence boost from wearing perfume</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="caption-suggestion">
                        <h4>📝 Suggested Caption</h4>
                        <div class="caption-box">
                            <textarea readonly class="caption-text">Just got this amazing ${title} from @edenparfum! 

The scent is absolutely divine 🌸✨

Perfect for ${new Date().toLocaleDateString('en-US', { season: 'long' })} vibes 

What's your signature scent? Drop it below! 👇

#EdenParfum #PerfumeTok #FragranceReview #Algeria #LuxuryPerfume #OOTD #ScentOfTheDay #PerfumeLover #${title.split(' ').join('').substring(0, 20)}</textarea>
                            <button class="copy-caption-btn">
                                <i class="fas fa-copy"></i>
                                Copy Caption
                            </button>
                        </div>
                    </div>
                    
                    <div class="tiktok-tips">
                        <h4>🎯 Pro Tips</h4>
                        <ul>
                            <li>Use trending sounds for better reach</li>
                            <li>Post during peak hours (7-9 PM local time)</li>
                            <li>Engage with comments quickly</li>
                            <li>Tag @edenparfum for potential repost</li>
                            <li>Use good lighting for better video quality</li>
                        </ul>
                    </div>
                    
                    <div class="action-buttons">
                        <a href="${this.config.socialAccounts.tiktok}" target="_blank" class="action-btn tiktok">
                            <i class="fab fa-tiktok"></i>
                            Open TikTok
                        </a>
                        <button class="action-btn secondary" onclick="window.edenSocial.downloadImage('${image}', '${title}')">
                            <i class="fas fa-download"></i>
                            Save Reference Image
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalInteractions(modal);
        this.trackEvent('open_tiktok_guide', 'guide');
    }

    // Setup modal interactions
    setupModalInteractions(modal) {
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn?.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Copy caption functionality
        const copyBtns = modal.querySelectorAll('.copy-caption-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const textarea = btn.parentElement.querySelector('textarea');
                this.copyToClipboard(textarea.value);
                this.trackEvent('copy_caption', 'interaction');
            });
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Navigation for multi-step modals
    nextStep(button) {
        const modal = button.closest('.modal-content');
        const currentStep = modal.querySelector('.step.active');
        const nextStep = currentStep.nextElementSibling;
        
        if (nextStep && nextStep.classList.contains('step')) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // Update dots
            const currentDot = modal.querySelector('.dot.active');
            const nextDot = currentDot.nextElementSibling;
            if (nextDot) {
                currentDot.classList.remove('active');
                nextDot.classList.add('active');
            }
            
            // Update button states
            const prevBtn = modal.querySelector('.prev-btn');
            const nextBtn = modal.querySelector('.next-btn');
            
            prevBtn.style.display = 'flex';
            if (!nextStep.nextElementSibling?.classList.contains('step')) {
                nextBtn.textContent = 'Finish';
                nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
            }
        }
    }

    previousStep(button) {
        const modal = button.closest('.modal-content');
        const currentStep = modal.querySelector('.step.active');
        const prevStep = currentStep.previousElementSibling;
        
        if (prevStep && prevStep.classList.contains('step')) {
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Update dots
            const currentDot = modal.querySelector('.dot.active');
            const prevDot = currentDot.previousElementSibling;
            if (prevDot) {
                currentDot.classList.remove('active');
                prevDot.classList.add('active');
            }
            
            // Update button states
            const prevBtn = modal.querySelector('.prev-btn');
            const nextBtn = modal.querySelector('.next-btn');
            
            if (prevStep.dataset.step === '1') {
                prevBtn.style.display = 'none';
            }
            
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        }
    }

    // Show share modal for current page
    showShareModal() {
        const shareButtons = this.createSocialShareButtons();
        const modal = document.createElement('div');
        modal.className = 'social-guide-modal share-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon share">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <h3>Share Eden Parfum</h3>
                    <button class="close-modal" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    ${shareButtons.outerHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupModalInteractions(modal);
        
        // Setup share button events in modal
        modal.addEventListener('click', (e) => {
            const btn = e.target.closest('.share-btn');
            if (btn) {
                const platform = btn.dataset.platform;
                this.shareContent(platform);
            }
        });
    }

    // Utility functions
    openShareWindow(url, platform) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(
            url,
            `share-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('✅ Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showNotification('✅ Copied to clipboard!', 'success');
    }

    downloadImage(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification('📱 Image saved! Check your downloads', 'success');
        this.trackEvent('download_image', 'interaction');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `eden-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            </div>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Analytics and tracking
    trackEvent(action, platform, content = '') {
        if (!this.config.analytics.trackEvents) return;

        const eventData = {
            action,
            platform,
            content,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };

        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_interaction', {
                social_network: platform,
                social_action: action,
                social_target: content,
                event_category: 'Social Media',
                event_label: `${platform}_${action}`
            });
        }

        // Send to custom analytics endpoint
        this.sendAnalytics(eventData);
    }

    async sendAnalytics(data) {
        try {
            await fetch(this.config.analytics.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.warn('Social analytics error:', error);
        }
    }

    // Load and display share counts
    async loadShareCounts(container) {
        try {
            const url = encodeURIComponent(window.location.href);
            const response = await fetch(`/api/social/share-counts?url=${url}`);
            const counts = await response.json();
            
            if (counts.success) {
                Object.entries(counts.data).forEach(([platform, count]) => {
                    const countElement = container.querySelector(`[data-platform="${platform}"] .share-count`);
                    if (countElement && count > 0) {
                        countElement.textContent = this.formatCount(count);
                        countElement.style.display = 'block';
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load share counts:', error);
        }
    }

    incrementShareCount(platform) {
        // Optimistically update UI
        const countElements = document.querySelectorAll(`[data-platform="${platform}"] .share-count`);
        countElements.forEach(element => {
            const current = parseInt(element.textContent) || 0;
            element.textContent = this.formatCount(current + 1);
            element.style.display = 'block';
        });

        // Send to backend
        fetch('/api/social/increment-share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform,
                url: window.location.href
            })
        }).catch(console.warn);
    }

    formatCount(count) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    // Setup global social features
    setupGlobalSocialFeatures() {
        // Add social meta tags if missing
        this.setupOpenGraphTags();
        
        // Add social sharing to existing share buttons
        this.enhanceExistingShareButtons();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupOpenGraphTags() {
        const metaTags = [
            { property: 'og:site_name', content: 'Eden Parfum' },
            { property: 'og:type', content: 'website' },
            { property: 'og:locale', content: 'fr_DZ' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@edenparfum' },
            { name: 'twitter:creator', content: '@edenparfum' }
        ];

        metaTags.forEach(tag => {
            const existing = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
            if (!existing) {
                const meta = document.createElement('meta');
                if (tag.property) meta.setAttribute('property', tag.property);
                if (tag.name) meta.setAttribute('name', tag.name);
                meta.setAttribute('content', tag.content);
                document.head.appendChild(meta);
            }
        });
    }

    enhanceExistingShareButtons() {
        // Find existing social links and enhance them
        const existingLinks = document.querySelectorAll('a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"]');
        existingLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.href;
                let platform = 'unknown';
                if (href.includes('facebook')) platform = 'facebook';
                else if (href.includes('instagram')) platform = 'instagram';
                else if (href.includes('twitter')) platform = 'twitter';
                
                this.trackEvent('social_link_click', platform);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + S = Share modal
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showShareModal();
            }
            
            // Ctrl/Cmd + Shift + F = Toggle floating social
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                const floatingBar = document.querySelector('.eden-floating-social');
                if (floatingBar) {
                    floatingBar.classList.toggle('expanded');
                }
            }
        });
    }

    // Initialize social analytics
    initializeSocialAnalytics() {
        // Track page view
        this.trackEvent('page_view', 'website');
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (scrollPercent % 25 === 0 && scrollPercent > 0) {
                    this.trackEvent('scroll_depth', scrollPercent.toString());
                }
            }
        });
        
        // Track time on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('time_on_page', timeOnPage.toString());
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.edenSocial) {
        window.edenSocial = new EdenSocialIntegration();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EdenSocialIntegration;
}