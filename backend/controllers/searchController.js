const { perfumesDatabase } = require('../data/perfumes');

// Search perfumes
const searchPerfumes = (req, res) => {
    try {
        const { q, brand, gender, limit = 20, offset = 0 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required',
                message: 'Please provide a search term'
            });
        }

        const searchTerm = q.trim().toLowerCase();
        let results = perfumesDatabase.filter(perfume => {
            const nameMatch = perfume.name.toLowerCase().includes(searchTerm);
            const brandMatch = perfume.brand.toLowerCase().includes(searchTerm);
            const referenceMatch = perfume.reference.toLowerCase().includes(searchTerm);
            
            return nameMatch || brandMatch || referenceMatch;
        });

        // Apply additional filters
        if (brand && brand !== 'all') {
            results = results.filter(perfume => 
                perfume.brand.toLowerCase() === brand.toLowerCase()
            );
        }

        if (gender && gender !== 'all') {
            results = results.filter(perfume => 
                perfume.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        // Sort by relevance (exact matches first, then partial matches)
        results.sort((a, b) => {
            const aExactName = a.name.toLowerCase() === searchTerm;
            const bExactName = b.name.toLowerCase() === searchTerm;
            const aExactBrand = a.brand.toLowerCase() === searchTerm;
            const bExactBrand = b.brand.toLowerCase() === searchTerm;
            
            if (aExactName && !bExactName) return -1;
            if (!aExactName && bExactName) return 1;
            if (aExactBrand && !bExactBrand) return -1;
            if (!aExactBrand && bExactBrand) return 1;
            
            return a.name.localeCompare(b.name);
        });

        // Pagination
        const total = results.length;
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = results.slice(startIndex, endIndex);

        // Add additional data
        const resultsWithData = paginatedResults.map(perfume => ({
            ...perfume,
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`,
            score: calculateRelevanceScore(perfume, searchTerm)
        }));

        res.json({
            success: true,
            data: resultsWithData,
            pagination: {
                total,
                offset: startIndex,
                limit: parseInt(limit),
                hasMore: endIndex < total
            },
            searchTerm: q
        });
    } catch (error) {
        console.error('Error in searchPerfumes:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get search suggestions
const getSearchSuggestions = (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }

        const searchTerm = q.trim().toLowerCase();
        const suggestions = new Set();

        // Add brand suggestions
        perfumesDatabase.forEach(perfume => {
            if (perfume.brand && perfume.brand.toLowerCase().includes(searchTerm)) {
                suggestions.add(perfume.brand);
            }
            if (perfume.name.toLowerCase().includes(searchTerm)) {
                suggestions.add(perfume.name);
            }
        });

        const suggestionArray = Array.from(suggestions)
            .slice(0, parseInt(limit))
            .map(suggestion => ({
                text: suggestion,
                type: perfumesDatabase.some(p => p.brand === suggestion) ? 'brand' : 'perfume'
            }));

        res.json({
            success: true,
            data: suggestionArray
        });
    } catch (error) {
        console.error('Error in getSearchSuggestions:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Advanced search
const advancedSearch = (req, res) => {
    try {
        const { 
            name, 
            brand, 
            gender, 
            reference, 
            hasMultiplier,
            limit = 20, 
            offset = 0 
        } = req.query;

        let results = [...perfumesDatabase];

        // Apply filters
        if (name) {
            const nameTerm = name.toLowerCase();
            results = results.filter(perfume => 
                perfume.name.toLowerCase().includes(nameTerm)
            );
        }

        if (brand && brand !== 'all') {
            results = results.filter(perfume => 
                perfume.brand.toLowerCase() === brand.toLowerCase()
            );
        }

        if (gender && gender !== 'all') {
            results = results.filter(perfume => 
                perfume.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        if (reference) {
            results = results.filter(perfume => 
                perfume.reference.toLowerCase().includes(reference.toLowerCase())
            );
        }

        if (hasMultiplier === 'true') {
            results = results.filter(perfume => perfume.multiplier);
        } else if (hasMultiplier === 'false') {
            results = results.filter(perfume => !perfume.multiplier);
        }

        // Pagination
        const total = results.length;
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = results.slice(startIndex, endIndex);

        // Add additional data
        const resultsWithData = paginatedResults.map(perfume => ({
            ...perfume,
            imageUrl: `/photos/Fragrances/${perfume.name}.avif`
        }));

        res.json({
            success: true,
            data: resultsWithData,
            pagination: {
                total,
                offset: startIndex,
                limit: parseInt(limit),
                hasMore: endIndex < total
            },
            filters: { name, brand, gender, reference, hasMultiplier }
        });
    } catch (error) {
        console.error('Error in advancedSearch:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Helper function to calculate relevance score
function calculateRelevanceScore(perfume, searchTerm) {
    let score = 0;
    const term = searchTerm.toLowerCase();
    
    // Exact matches get highest score
    if (perfume.name.toLowerCase() === term) score += 100;
    if (perfume.brand.toLowerCase() === term) score += 90;
    if (perfume.reference.toLowerCase() === term) score += 95;
    
    // Partial matches get lower scores
    if (perfume.name.toLowerCase().includes(term)) score += 50;
    if (perfume.brand.toLowerCase().includes(term)) score += 40;
    if (perfume.reference.toLowerCase().includes(term)) score += 45;
    
    // Starting with search term gets bonus
    if (perfume.name.toLowerCase().startsWith(term)) score += 25;
    if (perfume.brand.toLowerCase().startsWith(term)) score += 20;
    
    return score;
}

module.exports = {
    searchPerfumes,
    getSearchSuggestions,
    advancedSearch
};
