// Admin Manage Module - Handles admin perfume management interface
import fragranceDataInstance from './fragranceData.js';
import { getFragranceImage } from './fragranceData.js';
import { 
    debounce, 
    searchInFields, 
    setupSearchShortcuts, 
    getSearchStats,
    normalizeText,
    highlightSearchTerms
} from './searchUtils.js';

let allPerfumes = [];
let filteredPerfumes = [];
let deletePerfumeId = null;
let deletePerfumeName = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize fragranceData and expose globally
    fragranceDataInstance.init();
    window.fragranceData = fragranceDataInstance;
    
    loadPerfumes();

    // Setup search shortcuts (Ctrl+K, Escape)
    const searchInput = document.getElementById('search-input');
    setupSearchShortcuts(searchInput, clearFilters);

    // Search and filter functionality with debouncing for better performance
    const debouncedFilter = debounce(filterPerfumes, 250);
    searchInput.addEventListener('input', debouncedFilter);
    document.getElementById('brand-filter').addEventListener('input', debouncedFilter);
    document.getElementById('gender-filter').addEventListener('change', filterPerfumes);
    document.getElementById('sort-dropdown').addEventListener('change', filterPerfumes);

    // Button event listeners
    document.getElementById('refresh-btn').addEventListener('click', loadPerfumes);
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
    document.getElementById('update-perfume-btn').addEventListener('click', updatePerfume);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    
    // Delete modal event listeners
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        // Escape: Clear filters (if not in a modal)
        if (e.key === 'Escape' && !document.getElementById('edit-modal').style.display) {
            const searchInput = document.getElementById('search-input');
            const brandFilter = document.getElementById('brand-filter');
            if (searchInput.value || brandFilter.value || document.getElementById('gender-filter').value) {
                clearFilters();
            }
        }
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('edit-modal')) {
            closeModal();
        }
        if (event.target == document.getElementById('delete-modal')) {
            closeDeleteModal();
        }
    });

    // Event delegation for dynamically created buttons
    document.getElementById('perfume-grid').addEventListener('click', function(event) {
        const target = event.target;
        const button = target.closest('button');

        if (!button) return;

        const action = button.getAttribute('data-action');
        const perfumeId = button.getAttribute('data-id');
        const perfumeName = button.getAttribute('data-name');

        if (action === 'edit' && perfumeId) {
            editPerfume(parseInt(perfumeId));
        } else if (action === 'delete' && perfumeId && perfumeName) {
            deletePerfume(parseInt(perfumeId), perfumeName.replace(/&quot;/g, '"'));
        }
    });

    // Capture image load errors on the perfume grid (use capture phase)
    document.getElementById('perfume-grid').addEventListener('error', function (e) {
        const t = e.target;
        if (t && t.tagName === 'IMG') t.src = 'photos/placeholder.svg';
    }, true);
});

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
    };
}

async function loadPerfumes() {
    try {
        const response = await fetch('/api/v2/perfumes?limit=1000');
        const data = await response.json();
        allPerfumes = data.data || [];
        filteredPerfumes = [...allPerfumes];
        updateStats();
        displayPerfumes(filteredPerfumes);
    } catch (error) {
        showNoResults('Error loading perfumes. Please try again.');
    }
}

function updateStats() {
    const total = allPerfumes.length;
    const men = allPerfumes.filter(p => p.gender === 'Men').length;
    const women = allPerfumes.filter(p => p.gender === 'Women').length;
    const unisex = allPerfumes.filter(p => p.gender === 'Unisex').length;

    document.getElementById('total-perfumes').textContent = total;
    document.getElementById('men-perfumes').textContent = men;
    document.getElementById('women-perfumes').textContent = women;
    document.getElementById('unisex-perfumes').textContent = unisex;
}

function clearFilters() {
    // Clear all filter inputs
    document.getElementById('search-input').value = '';
    document.getElementById('brand-filter').value = '';
    document.getElementById('gender-filter').value = '';
    
    // Trigger filter update to show all perfumes
    filterPerfumes();
    
    // Show feedback
    showSuccess('Filters cleared - showing all perfumes');
}

function sortPerfumes(perfumes) {
    const sortBy = document.getElementById('sort-dropdown').value;
    const sorted = [...perfumes];
    
    switch(sortBy) {
        case 'name-asc':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        case 'name-desc':
            return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        case 'brand-asc':
            return sorted.sort((a, b) => (a.brand_name || '').localeCompare(b.brand_name || ''));
        case 'brand-desc':
            return sorted.sort((a, b) => (b.brand_name || '').localeCompare(a.brand_name || ''));
        case 'recent':
            return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        default:
            return sorted;
    }
}

function filterPerfumes() {
    const searchTerm = document.getElementById('search-input').value.trim();
    const brandFilter = document.getElementById('brand-filter').value.trim();
    const genderFilter = document.getElementById('gender-filter').value;

    filteredPerfumes = allPerfumes.filter(perfume => {
        // Enhanced search with accent-insensitive, multi-word support
        const matchesSearch = !searchTerm ||
            searchInFields(perfume, ['name', 'brand_name', 'reference'], searchTerm);

        // Brand filter - accent-insensitive contains match
        const matchesBrand = !brandFilter ||
            normalizeText(perfume.brand_name || '').includes(normalizeText(brandFilter));

        // Gender filter (exact match or "Mixte"/"Unisex" compatibility)
        const perfumeGender = perfume.gender || '';
        const matchesGender = !genderFilter ||
            perfumeGender === genderFilter ||
            (genderFilter === 'Unisex' && (perfumeGender === 'Mixte' || perfumeGender === 'Unisex')) ||
            (genderFilter === 'Mixte' && (perfumeGender === 'Unisex' || perfumeGender === 'Mixte'));

        return matchesSearch && matchesBrand && matchesGender;
    });

    // Apply sorting
    const sortedPerfumes = sortPerfumes(filteredPerfumes);
    displayPerfumes(sortedPerfumes);
    updateSearchStats();
}

function updateSearchStats() {
    // Update the displayed counts based on filtered results
    const totalEl = document.getElementById('total-perfumes');
    if (totalEl) {
        totalEl.textContent = filteredPerfumes.length;
    }
    
    // Show search results banner
    const banner = document.getElementById('search-results-banner');
    const bannerText = document.getElementById('search-results-text');
    const searchTerm = document.getElementById('search-input').value.trim();
    const brandFilter = document.getElementById('brand-filter').value.trim();
    const genderFilter = document.getElementById('gender-filter').value;
    
    const hasFilters = searchTerm || brandFilter || genderFilter;
    
    if (hasFilters) {
        banner.style.display = 'block';
        let filterDesc = [];
        if (searchTerm) filterDesc.push(`search: "${searchTerm}"`);
        if (brandFilter) filterDesc.push(`brand: "${brandFilter}"`);
        if (genderFilter) filterDesc.push(`gender: ${genderFilter}`);
        
        bannerText.innerHTML = `<i class="fas fa-search"></i> Found ${filteredPerfumes.length} perfume${filteredPerfumes.length !== 1 ? 's' : ''} matching ${filterDesc.join(', ')}`;
    } else {
        banner.style.display = 'none';
    }
}

function displayPerfumes(perfumes) {
    const container = document.getElementById('perfume-grid');

    if (perfumes.length === 0) {
        showNoResults('No perfumes found matching your criteria.');
        return;
    }

    container.innerHTML = '';

    perfumes.forEach(perfume => {
        const card = document.createElement('div');
        card.className = 'perfume-card';
        
        // Get image URL using the same logic as catalog page
        const fragranceImage = getFragranceImage(perfume);
        let imageUrl = 'photos/placeholder.svg';
        if (fragranceImage) {
            // For Fragrances directory, don't encode to preserve special characters
            imageUrl = fragranceImage;
        } else if (perfume.image_url) {
            imageUrl = normalizeImageUrl(perfume.image_url);
        }
        
        const searchTerm = document.getElementById('search-input').value.trim();
        const highlightedName = highlightSearchTerms(perfume.name, searchTerm);
        const highlightedBrand = highlightSearchTerms(perfume.brand_name || 'No Brand', searchTerm);
        const highlightedRef = highlightSearchTerms(perfume.reference, searchTerm);
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${perfume.name}" class="perfume-image">
            <div class="perfume-content">
                <div class="perfume-title">${highlightedName}</div>
                <div class="perfume-meta"><strong>Brand:</strong> ${highlightedBrand}</div>
                <div class="perfume-meta"><strong>Reference:</strong> ${highlightedRef}</div>
                <div class="perfume-meta"><strong>Gender:</strong> ${perfume.gender}</div>
                <div class="perfume-actions">
                    <button class="btn btn-primary" data-action="edit" data-id="${perfume.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" data-action="delete" data-id="${perfume.id}" data-name="${perfume.name.replace(/"/g, '&quot;')}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Attach image fallback and performance attributes after DOM insertion
        const imgEl = card.querySelector('img.perfume-image');
        if (imgEl) {
            // Store original URL for retry logic
            const originalUrl = imgEl.getAttribute('src') || '';

            // Don't normalize Fragrances paths to preserve special characters
            let finalUrl = originalUrl;
            if (!originalUrl.startsWith('photos/Fragrances/') && !originalUrl.startsWith('Fragrances/')) {
                finalUrl = normalizeImageUrl(originalUrl);
            }
            imgEl.src = finalUrl;
            imgEl.loading = 'lazy';
            imgEl.decoding = 'async';
            
            imgEl.addEventListener('error', function handleImgError() {
                imgEl.removeEventListener('error', handleImgError);

                if (!finalUrl.startsWith('photos/Fragrances/') && !finalUrl.startsWith('Fragrances/')) {
                    try {
                        const originalUrl = perfume.image_url || '';
                        if (originalUrl && originalUrl !== finalUrl) {
                            const simpleEncoded = encodeURI(originalUrl);
                            if (simpleEncoded !== finalUrl && simpleEncoded !== originalUrl) {
                                imgEl.addEventListener('error', function finalFallback() {
                                    imgEl.removeEventListener('error', finalFallback);
                                    imgEl.src = 'photos/placeholder.svg';
                                });
                                imgEl.src = simpleEncoded;
                                return;
                            }
                        }
                    } catch (e) {
                        // Silent error handling
                    }
                }

                imgEl.src = 'photos/placeholder.svg';
            });
        }
    });
}

function normalizeImageUrl(url) {
    if (!url) return 'photos/placeholder.svg';
    url = String(url).trim();

    // already data URI
    if (url.startsWith('data:')) return url;

    // protocol-relative
    if (url.startsWith('//')) return 'https:' + url;

    // ensure https for http urls
    if (url.startsWith('http://')) return url.replace(/^http:\/\//i, 'https://');

    // absolute path on site - encode it
    if (url.startsWith('/')) return encodeUrlPreservingSlashes(url);

    // common storage paths - encode them too
    if (url.includes('supabase') || url.includes('amazonaws') || url.includes('storage')) {
        return encodeUrlPreservingSlashes(url);
    }

    // normalize backslashes to forward slashes
    url = url.replace(/\\/g, '/');

    // if it's a plain filename, assume photos folder
    if (!url.includes('/')) {
        return 'photos/' + encodeURIComponent(url);
    }

    // For relative paths (including photos/...), encode them
    return encodeUrlPreservingSlashes(url);
}

// Encode URL path segments but preserve slashes and protocol
function encodeUrlPreservingSlashes(raw) {
    if (!raw) return raw;
    let url = String(raw).trim().replace(/\\/g, '/');

    // Protocol-relative
    if (url.startsWith('//')) url = 'https:' + url;

    // If absolute URL, use URL API to encode pathname segments
    try {
        if (/^https?:\/\//i.test(url)) {
            const u = new URL(url);
            u.pathname = u.pathname.split('/').map(seg => {
                try {
                    // Try to decode first (in case it's already encoded)
                    const decoded = decodeURIComponent(seg);
                    // Then encode it
                    return encodeURIComponent(decoded);
                } catch (e) {
                    // If decoding fails, encode as-is
                    return encodeURIComponent(seg);
                }
            }).join('/');
            // Preserve search and hash as-is (they should be encoded by caller if needed)
            return u.toString();
        }
    } catch (e) {
        // fall through to relative handling
    }

    // For relative paths (like '/photos/Fragrances/1 Million.avif' or 'photos/..'), encode each segment
    const leadingSlash = url.startsWith('/');
    const segments = url.split('/').map(seg => {
        try {
            const decoded = decodeURIComponent(seg);
            return encodeURIComponent(decoded);
        } catch (e) {
            return encodeURIComponent(seg);
        }
    });
    const joined = segments.join('/');
    return leadingSlash ? '/' + joined.replace(/^\/+/, '') : joined;
}

function showNoResults(message) {
    const container = document.getElementById('perfume-grid');
    container.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <div>${message}</div>
        </div>
    `;
}

function editPerfume(id) {
    const perfume = allPerfumes.find(p => p.id === id);
    if (!perfume) return;

    // Populate edit form
    document.getElementById('edit-id').value = perfume.id;
    document.getElementById('edit-reference').value = perfume.reference;
    document.getElementById('edit-name').value = perfume.name;
    document.getElementById('edit-brand_name').value = perfume.brand_name;
    document.getElementById('edit-gender').value = perfume.gender;
    document.getElementById('edit-image_url').value = perfume.image_url || '';

    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    deletePerfumeId = null;
    deletePerfumeName = null;
}

async function confirmDelete() {
    if (!deletePerfumeId || !deletePerfumeName) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`/api/v2/perfumes/${deletePerfumeId}`, {
            method: 'DELETE',
            headers: headers,
        });

        if (response.ok) {
            showToast('Perfume deleted successfully!', 'success');
            loadPerfumes();
        } else {
            const error = await response.json();
            showToast('Error deleting perfume: ' + error.error, 'error');
        }
    } catch (error) {
        showToast('Error deleting perfume', 'error');
    }

    closeDeleteModal();
}

async function updatePerfume() {
    const form = document.getElementById('edit-perfume-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const id = data.id;

    // Automatically detect image based on perfume name
    let imageUrl = null;
    
    // Strategy 1: Check fragranceData.js map
    const detectedImage = getFragranceImage({ name: data.name });
    if (detectedImage) {
        imageUrl = detectedImage;
    } else {
        // Strategy 2: Try direct filename match
        // Try with .avif extension
        const possiblePaths = [
            `photos/Fragrances/${data.name}.avif`,
            `photos/Fragrances/${data.name.toLowerCase()}.avif`,
            `photos/Fragrances/${data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase()}.avif`
        ];
        
        // Test if any of these paths exist by trying to load them
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    imageUrl = path;
                    break;
                }
            } catch (e) {
                // Continue to next path
            }
        }
    }
    
    if (imageUrl) {
        data.image_url = imageUrl;
    } else {
        // No image found, store null
        delete data.image_url;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`/api/v2/perfumes/${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (response.ok) {
            showToast('Perfume updated successfully!', 'success');
            closeModal();
            loadPerfumes();
        } else {
            const error = await response.json();
            showToast('Error updating perfume: ' + error.error, 'error');
        }
    } catch (error) {
        showToast('Error updating perfume', 'error');
    }
}

function deletePerfume(id, name) {
    deletePerfumeId = id;
    deletePerfumeName = name;
    document.getElementById('delete-perfume-name').textContent = name;
    document.getElementById('delete-modal').style.display = 'block';
}

// Add delegated handlers for images and action buttons if not already present
(function attachDelegatedHandlers() {
    const grid = document.getElementById('perfume-grid');
    if (!grid) return;

    // Remove any existing error handlers to avoid duplicates
    grid.removeEventListener('error', grid._imageErrorHandler);
    
    // image fallback
    grid._imageErrorHandler = function (e) {
        const t = e.target;
        if (t && t.tagName === 'IMG') t.src = 'photos/placeholder.svg';
    };
    grid.addEventListener('error', grid._imageErrorHandler, true);

    // Remove any existing click handlers to avoid duplicates
    grid.removeEventListener('click', grid._clickHandler);
    
    // action buttons
    grid._clickHandler = function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');

        if (action === 'edit' && id) {
            editPerfume(parseInt(id));
        } else if (action === 'delete' && id) {
            deletePerfume(parseInt(id), name ? name.replace(/&quot;/g, '"') : '');
        }
    };
    grid.addEventListener('click', grid._clickHandler);
})();