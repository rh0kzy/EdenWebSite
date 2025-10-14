// Brand Autocomplete Module
let allBrands = [];
let selectedSuggestionIndex = -1;

// Load all brands from API
export async function loadBrands() {
    try {
        const response = await fetch('/api/v2/brands?limit=1000');
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        const data = await response.json();
        allBrands = data.data || [];
        console.log(`✅ Loaded ${allBrands.length} brands for autocomplete`);
    } catch (error) {
        console.error('❌ Error loading brands:', error);
        allBrands = [];
    }
}

// Setup brand autocomplete on input field
export function setupBrandAutocomplete() {
    const brandInput = document.getElementById('brand_name');
    const suggestionsContainer = document.getElementById('brand-suggestions');

    if (!brandInput || !suggestionsContainer) {
        console.error('Brand input or suggestions container not found');
        return;
    }

    // Input event - show suggestions as user types
    brandInput.addEventListener('input', function(e) {
        const value = e.target.value.trim();
        
        if (value.length === 0) {
            hideSuggestions();
            return;
        }

        const filteredBrands = filterBrands(value);
        displaySuggestions(filteredBrands);
    });

    // Keyboard navigation
    brandInput.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            updateSelectedSuggestion(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSelectedSuggestion(suggestions);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            suggestions[selectedSuggestionIndex].click();
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!brandInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });

    // Focus event - show suggestions if there's text
    brandInput.addEventListener('focus', function(e) {
        const value = e.target.value.trim();
        if (value.length > 0) {
            const filteredBrands = filterBrands(value);
            displaySuggestions(filteredBrands);
        }
    });
}

// Filter brands based on query
function filterBrands(query) {
    const lowerQuery = query.toLowerCase();
    
    // Filter brands that start with or contain the query
    return allBrands
        .filter(brand => {
            const brandName = brand.name.toLowerCase();
            return brandName.startsWith(lowerQuery) || brandName.includes(lowerQuery);
        })
        .sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            // Prioritize brands that start with the query
            const aStarts = aName.startsWith(lowerQuery);
            const bStarts = bName.startsWith(lowerQuery);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Then sort alphabetically
            return aName.localeCompare(bName);
        })
        .slice(0, 10); // Limit to 10 suggestions
}

// Display filtered suggestions
function displaySuggestions(brands) {
    const suggestionsContainer = document.getElementById('brand-suggestions');
    selectedSuggestionIndex = -1;

    if (brands.length === 0) {
        suggestionsContainer.innerHTML = '<div class="no-suggestions">⚠️ No brands found. You can still type a new brand name.</div>';
        suggestionsContainer.classList.add('active');
        return;
    }

    const html = brands.map(brand => `
        <div class="suggestion-item" data-brand-name="${brand.name}">
            <span class="brand-name">${brand.name}</span>
            <span class="perfume-count">${brand.perfume_count || 0} parfum(s)</span>
        </div>
    `).join('');

    suggestionsContainer.innerHTML = html;
    suggestionsContainer.classList.add('active');

    // Add click handlers
    const suggestionItems = suggestionsContainer.querySelectorAll('.suggestion-item');
    suggestionItems.forEach(item => {
        item.addEventListener('click', function() {
            const brandName = this.dataset.brandName;
            document.getElementById('brand_name').value = brandName;
            hideSuggestions();
        });
    });
}

// Update selected suggestion highlight
function updateSelectedSuggestion(suggestions) {
    suggestions.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Hide suggestions dropdown
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('brand-suggestions');
    suggestionsContainer.classList.remove('active');
    suggestionsContainer.innerHTML = '';
    selectedSuggestionIndex = -1;
}
