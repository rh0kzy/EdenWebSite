// Enhanced Perfume Detail Page JavaScript
class PerfumeDetailPage {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.perfumeReference = this.getPerfumeReference();
        this.init();
    }

    getPerfumeReference() {
        // Get reference from URL parameter or default to Marc Jacobs Decadence
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref') || '1103';
    }

    async init() {
        try {
            await this.loadPerfumeData();
            this.attachEventListeners();
        } catch (error) {
            console.error('Error initializing perfume detail page:', error);
            this.showError('Failed to load perfume details');
        }
    }

    async loadPerfumeData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/enhanced/enhanced/${this.perfumeReference}`);
            if (!response.ok) {
                throw new Error('Failed to fetch perfume data');
            }
            
            const result = await response.json();
            if (result.success) {
                this.perfumeData = result.data;
                this.renderPerfumeDetails();
            } else {
                throw new Error(result.message || 'Failed to load perfume data');
            }
        } catch (error) {
            console.error('Error loading perfume data:', error);
            // Use fallback data for demonstration
            this.loadFallbackData();
        }
    }

    loadFallbackData() {
        // Fallback data matching our enhanced structure
        this.perfumeData = {
            reference: "1103",
            name: "Decadence",
            brand: "Marc Jacobs",
            gender: "Women",
            fragranceNotes: {
                top: ["Italian Plum", "Saffron", "Bulgarian Rose"],
                middle: ["Orris", "Sambac Jasmine", "Rose"],
                base: ["Liquid Amber", "Vetiver", "Papyrus Wood"]
            },
            fragrancePyramid: {
                longevity: 8,
                sillage: 7,
                projection: 6,
                complexity: 8,
                seasonality: ["Fall", "Winter", "Evening"],
                occasion: ["Date Night", "Special Events", "Evening Out"],
                timeOfDay: "Evening"
            },
            releaseInfo: {
                launchYear: 2015,
                perfumer: "Annie Buzantian",
                concentration: "Eau de Parfum",
                availability: "Available",
                sizes: ["30ml", "50ml", "100ml"],
                currentPrice: {
                    "30ml": "$45",
                    "50ml": "$65",
                    "100ml": "$85"
                }
            },
            brandInfo: {
                brandName: "Marc Jacobs",
                founded: 1984,
                founder: "Marc Jacobs",
                country: "United States",
                headquarters: "New York City",
                brandStory: "Marc Jacobs is a world-renowned American fashion designer known for his grunge aesthetic and eclectic designs. His fragrance line reflects his bold, unconventional approach to fashion.",
                signature: "Modern, edgy, and sophisticated fragrances that capture the essence of contemporary femininity",
                notableFragrances: ["Daisy", "Perfect", "Decadence", "Dot"],
                brandValues: ["Creativity", "Individuality", "Modern Luxury"]
            },
            similarFragrances: [
                {
                    reference: "1104",
                    name: "Marc Jacobs Perfect",
                    brand: "Marc Jacobs",
                    similarity: 85,
                    reason: "Same brand, similar fruity-floral profile"
                },
                {
                    reference: "1111",
                    name: "Marc Jacobs Perfect Intense",
                    brand: "Marc Jacobs",
                    similarity: 80,
                    reason: "Intensified version with similar DNA"
                },
                {
                    reference: "1103",
                    name: "Tom Ford Black Orchid",
                    brand: "Tom Ford",
                    similarity: 75,
                    reason: "Similar dark, luxurious, and seductive character"
                }
            ],
            description: "A captivating and luxurious fragrance that embodies the spirit of feminine decadence. This rich and opulent scent opens with the exotic sweetness of Italian plum and the warmth of saffron, creating an immediately intoxicating experience.",
            reviews: {
                averageRating: 4.3,
                totalReviews: 1247
            },
            characteristics: {
                fragranceFamily: "Oriental Floral",
                mood: ["Seductive", "Luxurious", "Sophisticated"],
                intensity: "Strong",
                uniqueness: "High",
                versatility: "Medium",
                ageGroup: "25-45",
                personality: ["Confident", "Bold", "Glamorous"]
            },
            wearabilityGuide: {
                seasons: {
                    spring: 3,
                    summer: 2,
                    fall: 5,
                    winter: 5
                },
                occasions: {
                    daily: 2,
                    office: 3,
                    evening: 5,
                    special: 5,
                    date: 5
                }
            }
        };
        
        this.renderPerfumeDetails();
    }

    renderPerfumeDetails() {
        this.updateBasicInfo();
        this.updateFragranceNotes();
        this.updatePyramidMetrics();
        this.updateBrandInfo();
        this.updateReleaseInfo();
        this.updateWearabilityGuide();
        this.updateSimilarFragrances();
        this.updatePageTitle();
    }

    updateBasicInfo() {
        const nameElement = document.getElementById('perfumeName');
        const brandElement = document.getElementById('perfumeBrand');
        const descriptionElement = document.getElementById('perfumeDescription');

        if (nameElement) nameElement.textContent = this.perfumeData.name;
        if (brandElement) brandElement.textContent = this.perfumeData.brand;
        if (descriptionElement) descriptionElement.textContent = this.perfumeData.description;

        // Update rating display
        if (this.perfumeData.reviews) {
            const ratingText = document.querySelector('.rating-text');
            if (ratingText) {
                ratingText.textContent = `${this.perfumeData.reviews.averageRating}/5 (${this.perfumeData.reviews.totalReviews.toLocaleString()} reviews)`;
            }
        }
    }

    updateFragranceNotes() {
        const noteCategories = ['top', 'middle', 'base'];
        
        noteCategories.forEach(category => {
            const noteList = document.querySelector(`.note-category:nth-child(${noteCategories.indexOf(category) + 1}) .note-list`);
            if (noteList && this.perfumeData.fragranceNotes[category]) {
                noteList.innerHTML = '';
                this.perfumeData.fragranceNotes[category].forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'note-item';
                    noteElement.textContent = note;
                    noteList.appendChild(noteElement);
                });
            }
        });
    }

    updatePyramidMetrics() {
        const metrics = [
            { name: 'longevity', value: this.perfumeData.fragrancePyramid.longevity },
            { name: 'sillage', value: this.perfumeData.fragrancePyramid.sillage },
            { name: 'projection', value: this.perfumeData.fragrancePyramid.projection },
            { name: 'complexity', value: this.perfumeData.fragrancePyramid.complexity }
        ];

        metrics.forEach((metric, index) => {
            const metricElement = document.querySelector(`.metric:nth-child(${index + 1})`);
            if (metricElement) {
                const fillElement = metricElement.querySelector('.metric-fill');
                const valueElement = metricElement.querySelector('span');
                
                if (fillElement) fillElement.style.width = `${metric.value * 10}%`;
                if (valueElement) valueElement.textContent = `${metric.value}/10`;
            }
        });

        // Update quick stats
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = `${this.perfumeData.fragrancePyramid.longevity}/10`;
            statValues[1].textContent = `${this.perfumeData.fragrancePyramid.sillage}/10`;
            statValues[2].textContent = this.perfumeData.releaseInfo.launchYear;
        }
    }

    updateBrandInfo() {
        const brandStory = document.querySelector('.brand-story');
        if (brandStory && this.perfumeData.brandInfo) {
            const brandInfo = this.perfumeData.brandInfo;
            brandStory.innerHTML = `
                <h3>${brandInfo.brandName}</h3>
                <p><strong>Founded:</strong> ${brandInfo.founded} | <strong>Founder:</strong> ${brandInfo.founder} | <strong>Country:</strong> ${brandInfo.country}</p>
                <p>${brandInfo.brandStory}</p>
                <div class="brand-values">
                    ${brandInfo.brandValues.map(value => `<span class="value-tag">${value}</span>`).join('')}
                </div>
            `;
        }
    }

    updateReleaseInfo() {
        const releaseCards = document.querySelectorAll('.characteristic-card');
        if (releaseCards.length >= 4 && this.perfumeData.releaseInfo) {
            const releaseInfo = this.perfumeData.releaseInfo;
            
            const infoData = [
                { icon: 'calendar', title: 'Launch Year', value: releaseInfo.launchYear },
                { icon: 'user', title: 'Perfumer', value: releaseInfo.perfumer },
                { icon: 'flask', title: 'Concentration', value: releaseInfo.concentration },
                { icon: 'check-circle', title: 'Availability', value: releaseInfo.availability }
            ];

            infoData.forEach((info, index) => {
                if (releaseCards[index]) {
                    releaseCards[index].innerHTML = `
                        <h4><i class="fas fa-${info.icon}"></i> ${info.title}</h4>
                        <p>${info.value}</p>
                    `;
                }
            });
        }
    }

    updateWearabilityGuide() {
        // Update seasons chart
        const seasonsSection = document.querySelector('.chart-section:first-child');
        if (seasonsSection && this.perfumeData.wearabilityGuide.seasons) {
            const seasons = this.perfumeData.wearabilityGuide.seasons;
            const seasonItems = seasonsSection.querySelectorAll('.chart-item');
            
            const seasonNames = ['spring', 'summer', 'fall', 'winter'];
            seasonNames.forEach((season, index) => {
                if (seasonItems[index]) {
                    const fill = seasonItems[index].querySelector('.chart-fill');
                    if (fill) {
                        fill.style.width = `${(seasons[season] / 5) * 100}%`;
                    }
                }
            });
        }

        // Update occasions chart
        const occasionsSection = document.querySelector('.chart-section:last-child');
        if (occasionsSection && this.perfumeData.wearabilityGuide.occasions) {
            const occasions = this.perfumeData.wearabilityGuide.occasions;
            const occasionItems = occasionsSection.querySelectorAll('.chart-item');
            
            const occasionNames = ['daily', 'office', 'evening', 'special'];
            occasionNames.forEach((occasion, index) => {
                if (occasionItems[index]) {
                    const fill = occasionItems[index].querySelector('.chart-fill');
                    if (fill) {
                        fill.style.width = `${(occasions[occasion] / 5) * 100}%`;
                    }
                }
            });
        }
    }

    updateSimilarFragrances() {
        const similarContainer = document.querySelector('.similar-perfumes');
        if (similarContainer && this.perfumeData.similarFragrances) {
            similarContainer.innerHTML = '';
            
            this.perfumeData.similarFragrances.forEach(perfume => {
                const perfumeElement = document.createElement('div');
                perfumeElement.className = 'similar-item';
                perfumeElement.innerHTML = `
                    <div class="similarity-score">${perfume.similarity}% Match</div>
                    <h4>${perfume.name}</h4>
                    <p class="brand">${perfume.brand}</p>
                    <p>${perfume.reason}</p>
                `;
                
                // Add click event to navigate to similar perfume
                perfumeElement.style.cursor = 'pointer';
                perfumeElement.addEventListener('click', () => {
                    window.location.href = `perfume-detail.html?ref=${perfume.reference}`;
                });
                
                similarContainer.appendChild(perfumeElement);
            });
        }
    }

    updatePageTitle() {
        document.title = `${this.perfumeData.name} by ${this.perfumeData.brand} - EDEN PARFUM`;
        
        // Update breadcrumb
        const breadcrumbElement = document.getElementById('breadcrumbPerfumeName');
        if (breadcrumbElement) {
            breadcrumbElement.textContent = `${this.perfumeData.name} - ${this.perfumeData.brand}`;
        }
    }

    attachEventListeners() {
        // Add any interactive functionality here
        this.addAnimationEffects();
        this.addHoverEffects();
    }

    addAnimationEffects() {
        // Animate metric bars on scroll
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const metricFills = entry.target.querySelectorAll('.metric-fill');
                    metricFills.forEach((fill, index) => {
                        setTimeout(() => {
                            fill.style.transform = 'scaleX(1)';
                        }, index * 200);
                    });
                }
            });
        }, observerOptions);

        const pyramidSection = document.querySelector('.fragrance-pyramid');
        if (pyramidSection) {
            observer.observe(pyramidSection);
        }
    }

    addHoverEffects() {
        // Add hover effects to note items
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the perfume detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerfumeDetailPage();
});
