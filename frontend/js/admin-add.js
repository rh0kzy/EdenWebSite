// Admin Add Perfume JavaScript
import fragranceDataInstance from './fragranceData.js';
import { getFragranceImage } from './fragranceData.js';
import { loadBrands, setupBrandAutocomplete } from './brandAutocomplete.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize fragranceData and expose globally
    fragranceDataInstance.init();
    window.fragranceData = fragranceDataInstance;
    
    // Load brands for autocomplete
    loadBrands();
    
    // Setup brand autocomplete
    setupBrandAutocomplete();

    // Add perfume form
    document.getElementById('add-perfume-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addPerfume();
    });

    // Handle automatic reference generation
    const armoireInput = document.getElementById('armoire');
    const etageInput = document.getElementById('etage');
    const perfumeNumberInput = document.getElementById('perfume-number');
    const referenceInput = document.getElementById('reference');
    const referencePreview = document.getElementById('reference-preview');
    const referenceDisplay = document.getElementById('reference-display');

    // Function to fetch and calculate next perfume number
    async function updatePerfumeNumber() {
        const armoire = armoireInput.value;
        const etage = etageInput.value;

        if (!armoire || !etage) {
            perfumeNumberInput.value = '';
            referencePreview.style.display = 'none';
            return;
        }

        try {
            // Fetch all perfumes to find the highest number in this armoire+etage
            const response = await fetch('/api/v2/perfumes?limit=1000');
            if (!response.ok) throw new Error('Failed to fetch perfumes');
            
            const data = await response.json();
            const perfumes = data.data || [];

            // Filter perfumes that match this armoire and etage
            const prefix = `${armoire}${etage}`;
            const matchingRefs = perfumes
                .map(p => p.reference)
                .filter(ref => ref && ref.startsWith(prefix))
                .map(ref => {
                    const numPart = ref.substring(2); // Get last 2 digits
                    return parseInt(numPart, 10);
                })
                .filter(num => !isNaN(num));

            // Find the highest number
            const maxNum = matchingRefs.length > 0 ? Math.max(...matchingRefs) : 0;
            const nextNum = maxNum + 1;
            
            // Format as 2 digits
            const formattedNum = String(nextNum).padStart(2, '0');
            perfumeNumberInput.value = formattedNum;

            const fullReference = `${armoire}${etage}${formattedNum}`;
            referenceInput.value = fullReference;
            referenceDisplay.textContent = fullReference;
            referencePreview.style.display = 'block';

        } catch (error) {
            perfumeNumberInput.value = '01';
            const fullReference = `${armoire}${etage}01`;
            referenceInput.value = fullReference;
            referenceDisplay.textContent = fullReference;
            referencePreview.style.display = 'block';
        }
    }

    // Update perfume number when armoire or etage changes
    armoireInput.addEventListener('input', updatePerfumeNumber);
    etageInput.addEventListener('input', updatePerfumeNumber);

    // Add image preview helper
    const nameInput = document.getElementById('name');
    const imageUrlInput = document.getElementById('image_url');
    
    nameInput.addEventListener('input', function() {
        // Silent - image will be detected automatically
    });
});

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
    };
}

async function addPerfume() {
    const form = document.getElementById('add-perfume-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

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

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Adding...';
    submitBtn.disabled = true;

    // Hide previous messages
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    try {
        const response = await fetch('/api/v2/perfumes', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            showSuccess(`Perfume "${result.name}" added successfully!`);
            form.reset();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to add perfume');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide after 8 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 8000);
}