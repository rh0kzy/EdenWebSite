// Admin Manage Module - Handles admin perfume management interface
import { getFragranceImage } from './fragranceData.js';
let allPerfumes = [];
let filteredPerfumes = [];
let deletePerfumeId = null;
let deletePerfumeName = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPerfumes();

    // Search and filter functionality
    document.getElementById('search-input').addEventListener('input', filterPerfumes);
    document.getElementById('brand-filter').addEventListener('input', filterPerfumes);
    document.getElementById('gender-filter').addEventListener('change', filterPerfumes);

    // Button event listeners
    document.getElementById('refresh-btn').addEventListener('click', loadPerfumes);
    document.getElementById('update-perfume-btn').addEventListener('click', updatePerfume);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    
    // Delete modal event listeners
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);

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
        const response = await fetch('/api/v2/perfumes?limit=1000'); // Load more perfumes for management
        const data = await response.json();
        allPerfumes = data.data || [];
        filteredPerfumes = [...allPerfumes];
        updateStats();
        displayPerfumes(filteredPerfumes);
    } catch (error) {
        console.error('Error loading perfumes:', error);
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

function filterPerfumes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const brandFilter = document.getElementById('brand-filter').value.toLowerCase();
    const genderFilter = document.getElementById('gender-filter').value;

    filteredPerfumes = allPerfumes.filter(perfume => {
        const matchesSearch = !searchTerm ||
            perfume.name.toLowerCase().includes(searchTerm) ||
            perfume.brand_name.toLowerCase().includes(searchTerm) ||
            perfume.reference.toLowerCase().includes(searchTerm);

        const matchesBrand = !brandFilter ||
            perfume.brand_name.toLowerCase().includes(brandFilter);

        const matchesGender = !genderFilter ||
            perfume.gender === genderFilter;

        return matchesSearch && matchesBrand && matchesGender;
    });

    displayPerfumes(filteredPerfumes);
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
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${perfume.name}" class="perfume-image">
            <div class="perfume-content">
                <div class="perfume-title">${perfume.name}</div>
                <div class="perfume-meta"><strong>Brand:</strong> ${perfume.brand_name}</div>
                <div class="perfume-meta"><strong>Reference:</strong> ${perfume.reference}</div>
                <div class="perfume-meta"><strong>Gender:</strong> ${perfume.gender}</div>
                <div class="perfume-meta"><strong>Price:</strong> ${perfume.price ? perfume.price + ' DZD' : 'N/A'}</div>
                ${perfume.description ? `<div class="perfume-description">${perfume.description}</div>` : ''}
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
            
            // Debug logging (enable by setting window.DEBUG_IMAGE_LOADING = true in console)
            if (window.DEBUG_IMAGE_LOADING) {
                console.log('Loading:', { original: originalUrl, normalized: normalizedUrl, name: perfume.name });
            }
            
            imgEl.addEventListener('load', function() {
                if (window.DEBUG_IMAGE_LOADING) {
                    console.log('✓ Loaded:', normalizedUrl);
                }
            });
            
            imgEl.addEventListener('error', function handleImgError() {
                // Remove this handler to avoid loops
                imgEl.removeEventListener('error', handleImgError);

                console.warn('✗ Failed to load:', finalUrl, 'for', perfume.name);

                // For Fragrances paths, don't try re-encoding as it might break special characters
                if (!finalUrl.startsWith('photos/Fragrances/') && !finalUrl.startsWith('Fragrances/')) {
                    // Try a simple encoding of the original URL
                    try {
                        const originalUrl = perfume.image_url || '';
                        if (originalUrl && originalUrl !== finalUrl) {
                            const simpleEncoded = encodeURI(originalUrl);
                            if (simpleEncoded !== finalUrl && simpleEncoded !== originalUrl) {
                                console.log('→ Retrying with simple encoding:', simpleEncoded);
                                // Wire a one-time error handler to fall back to placeholder after retry
                                imgEl.addEventListener('error', function finalFallback() {
                                    imgEl.removeEventListener('error', finalFallback);
                                    console.warn('✗ Retry failed, using placeholder');
                                    imgEl.src = 'photos/placeholder.svg';
                                });
                                imgEl.src = simpleEncoded;
                                return;
                            }
                        }
                    } catch (e) {
                        console.warn('Encoding error:', e);
                    }
                }

                // Final fallback
                console.log('→ Using placeholder');
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
    document.getElementById('edit-description').value = perfume.description || '';
    document.getElementById('edit-price').value = perfume.price || '';
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
            alert('Perfume deleted successfully!');
            loadPerfumes(); // Refresh the list
        } else {
            const error = await response.json();
            alert('Error deleting perfume: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting perfume:', error);
        alert('Error deleting perfume');
    }

    closeDeleteModal();
}

async function updatePerfume() {
    const form = document.getElementById('edit-perfume-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const id = data.id;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`/api/v2/perfumes/${id}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Perfume updated successfully!');
            closeModal();
            loadPerfumes(); // Refresh the list
        } else {
            const error = await response.json();
            alert('Error updating perfume: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating perfume:', error);
        alert('Error updating perfume');
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