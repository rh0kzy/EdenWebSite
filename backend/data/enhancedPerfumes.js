// Enhanced Perfume Database with Fragrantica-like Features
const enhancedPerfumesDatabase = [
    {
        reference: "1103",
        name: "Decadence",
        brand: "Marc Jacobs",
        gender: "Women",
        
        // Fragrance Notes: Lists top, middle, and base notes
        fragranceNotes: {
            top: ["Italian Plum", "Saffron", "Bulgarian Rose"],
            middle: ["Orris", "Sambac Jasmine", "Rose"],
            base: ["Liquid Amber", "Vetiver", "Papyrus Wood"]
        },
        
        // Fragrance Pyramid: Visual representation data
        fragrancePyramid: {
            longevity: 8, // out of 10
            sillage: 7, // out of 10
            projection: 6, // out of 10
            complexity: 8, // out of 10
            seasonality: ["Fall", "Winter", "Evening"],
            occasion: ["Date Night", "Special Events", "Evening Out"],
            timeOfDay: "Evening"
        },
        
        // Release Information: Launch dates, perfumers, and availability
        releaseInfo: {
            launchYear: 2015,
            perfumer: "Annie Buzantian",
            concentration: "Eau de Parfum",
            availability: "Available",
            sizes: ["30ml", "50ml", "100ml"],
            originalPrice: {
                "30ml": "$68",
                "50ml": "$88", 
                "100ml": "$118"
            },
            currentPrice: {
                "30ml": "$45",
                "50ml": "$65",
                "100ml": "$85"
            }
        },
        
        // Brand Information: Comprehensive brand profiles and histories
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
        
        // Similar Fragrances: Recommendations based on scent profiles
        similarFragrances: [
            {
                reference: "1104",
                name: "Marc Jacobs Perfect",
                brand: "Marc Jacobs", 
                similarity: 85, // percentage
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
                reference: "1103", // Placeholder for other perfumes
                name: "Tom Ford Black Orchid",
                brand: "Tom Ford",
                similarity: 75,
                reason: "Similar dark, luxurious, and seductive character"
            }
        ],
        
        // Additional Features
        description: "A captivating and luxurious fragrance that embodies the spirit of feminine decadence. This rich and opulent scent opens with the exotic sweetness of Italian plum and the warmth of saffron, creating an immediately intoxicating experience.",
        
        reviews: {
            averageRating: 4.3,
            totalReviews: 1247,
            ratingDistribution: {
                5: 523,
                4: 431,
                3: 186,
                2: 74,
                1: 33
            }
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
            },
            climate: {
                hot: 2,
                warm: 3,
                cool: 5,
                cold: 5
            }
        }
    }
];

// Function to get enhanced perfume by reference
function getEnhancedPerfume(reference) {
    return enhancedPerfumesDatabase.find(perfume => perfume.reference === reference);
}

// Function to get similar fragrances
function getSimilarFragrances(reference, limit = 3) {
    const perfume = getEnhancedPerfume(reference);
    if (!perfume) return [];
    
    return perfume.similarFragrances.slice(0, limit);
}

// Function to calculate fragrance compatibility
function calculateCompatibility(userPreferences, perfume) {
    // This would implement logic to match user preferences with perfume characteristics
    // For now, returning a placeholder score
    return Math.floor(Math.random() * 100);
}

module.exports = {
    enhancedPerfumesDatabase,
    getEnhancedPerfume,
    getSimilarFragrances,
    calculateCompatibility
};
