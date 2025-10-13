// Admin Add Perfume JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add perfume form
    document.getElementById('add-perfume-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addPerfume();
    });

    // Add image preview helper
    const nameInput = document.getElementById('name');
    const imageUrlInput = document.getElementById('image_url');
    
    nameInput.addEventListener('input', function() {
        if (!imageUrlInput.value) {
            // Show preview hint of what image will be used
            const perfumeName = this.value.trim();
            if (perfumeName) {
                const expectedImage = `photos/Fragrances/${perfumeName}.avif`;
                console.log(`Will automatically try to load: ${expectedImage}`);
            }
        }
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
        console.error('Error adding perfume:', error);
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