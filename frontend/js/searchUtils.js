// Enhanced Search Utilities
// Provides advanced search functionality with accent-insensitive matching, multi-word search, and more

/**
 * Normalize text for search by removing accents and special characters
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')  // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
        .replace(/[^\w\s\u0600-\u06FF]/g, ' ')  // Replace special chars with spaces, preserving Arabic
        .replace(/\s+/g, ' ')  // Normalize spaces
        .trim();
}

/**
 * Check if text matches search query with multi-word support
 * @param {string} text - Text to search in
 * @param {string} query - Search query (can be multiple words)
 * @returns {boolean} True if text matches all query terms
 */
export function matchesSearch(text, query) {
    if (!query || !text) return true;
    
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);
    
    // Split query into words
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
    
    if (queryWords.length === 0) return true;
    
    // All words must be found in the text
    return queryWords.every(word => normalizedText.includes(word));
}

/**
 * Search in multiple fields
 * @param {Object} item - Item to search in
 * @param {Array<string>} fields - Fields to search
 * @param {string} query - Search query
 * @returns {boolean} True if any field matches
 */
export function searchInFields(item, fields, query) {
    if (!query) return true;
    
    // Combine all fields into one searchable string for multi-field matching
    const combinedText = fields
        .map(field => getNestedValue(item, field))
        .filter(val => val !== undefined && val !== null)
        .join(' ');
        
    return matchesSearch(combinedText, query);
}

/**
 * Get nested object value by dot notation (e.g., 'brands.name')
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path
 * @returns {*} Value at path
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => {
        return current?.[prop];
    }, obj);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Highlight search terms in text
 * @param {string} text - Original text
 * @param {string} query - Search query to highlight
 * @returns {string} HTML with highlighted terms
 */
export function highlightSearchTerms(text, query) {
    if (!text || !query) return text;
    
    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
    
    if (queryWords.length === 0) return text;
    
    let result = text;
    
    // Find and highlight each word (case-insensitive, accent-insensitive)
    queryWords.forEach(word => {
        const regex = new RegExp(
            `(${escapeRegExp(word)})`,
            'gi'
        );
        
        // Only highlight if the word appears in normalized form
        const normalizedText = normalizeText(text);
        if (normalizedText.includes(word)) {
            // Find actual positions in original text
            const words = text.split(/(\s+)/);
            result = words.map(w => {
                if (normalizeText(w).includes(word)) {
                    return `<mark class="search-highlight">${w}</mark>`;
                }
                return w;
            }).join('');
        }
    });
    
    return result;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Setup keyboard shortcuts for search
 * @param {HTMLElement} searchInput - Search input element
 * @param {Function} onClear - Callback when search is cleared
 */
export function setupSearchShortcuts(searchInput, onClear) {
    if (!searchInput) return;
    
    // Ctrl+K or Cmd+K to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // Escape to clear search (only if search is focused)
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            e.preventDefault();
            searchInput.value = '';
            if (onClear) onClear();
            searchInput.blur();
        }
    });
}

/**
 * Filter array by search query and filters
 * @param {Array} items - Items to filter
 * @param {Object} options - Filter options
 * @returns {Array} Filtered items
 */
export function filterItems(items, options = {}) {
    const {
        searchQuery = '',
        searchFields = [],
        filters = {},
        caseSensitive = false
    } = options;
    
    return items.filter(item => {
        // Check search query
        if (searchQuery && searchFields.length > 0) {
            const matchesQuery = searchInFields(item, searchFields, searchQuery);
            if (!matchesQuery) return false;
        }
        
        // Check additional filters
        for (const [field, value] of Object.entries(filters)) {
            if (!value) continue; // Skip empty filters
            
            const itemValue = getNestedValue(item, field);
            
            if (caseSensitive) {
                if (itemValue !== value) return false;
            } else {
                const normalizedItemValue = normalizeText(itemValue);
                const normalizedFilterValue = normalizeText(value);
                
                if (!normalizedItemValue.includes(normalizedFilterValue)) {
                    return false;
                }
            }
        }
        
        return true;
    });
}

/**
 * Get search statistics
 * @param {number} totalItems - Total number of items
 * @param {number} filteredItems - Number of filtered items
 * @param {string} searchQuery - Current search query
 * @returns {Object} Search statistics
 */
export function getSearchStats(totalItems, filteredItems, searchQuery) {
    return {
        total: totalItems,
        filtered: filteredItems,
        hasResults: filteredItems > 0,
        hasQuery: searchQuery && searchQuery.trim().length > 0,
        percentage: totalItems > 0 ? Math.round((filteredItems / totalItems) * 100) : 0
    };
}
