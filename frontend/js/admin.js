// Admin panel JavaScript
let adminToken = null;

document.addEventListener('DOMContentLoaded', function() {
    loadPerfumes();

    // Add perfume form
    document.getElementById('add-perfume-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addPerfume();
    });

    // Edit perfume form
    document.getElementById('edit-perfume-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updatePerfume();
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('edit-modal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == document.getElementById('edit-modal')) {
            document.getElementById('edit-modal').style.display = 'none';
        }
    });
});

function getAuthHeaders() {
    if (!adminToken) {
        adminToken = prompt('Enter admin password:');
        if (!adminToken) return null;
    }
    return {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
    };
}

async function loadPerfumes() {
    try {
        const response = await fetch('/api/v2/perfumes');
        const data = await response.json();
        displayPerfumes(data.data);
    } catch (error) {
        console.error('Error loading perfumes:', error);
    }
}

function displayPerfumes(perfumes) {
    const container = document.getElementById('perfume-list');
    container.innerHTML = '';

    perfumes.forEach(perfume => {
        const card = document.createElement('div');
        card.className = 'perfume-card';
        card.innerHTML = `
            <img src="${perfume.image_url || 'photos/placeholder.jpg'}" alt="${perfume.name}" class="perfume-thumb">
            <h3>${perfume.name}</h3>
            <p><strong>Brand:</strong> ${perfume.brand_name}</p>
            <p><strong>Reference:</strong> ${perfume.reference}</p>
            <p><strong>Gender:</strong> ${perfume.gender}</p>
            <p><strong>Price:</strong> ${perfume.price ? perfume.price + ' DZD' : 'N/A'}</p>
            <div class="actions">
                <button class="btn btn-primary" data-action="edit" data-id="${perfume.id}">Edit</button>
                <button class="btn btn-danger" data-action="delete" data-id="${perfume.id}">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Event delegation for image load error fallback and action buttons
    container.addEventListener('error', function (e) {
        const target = e.target;
        if (target && target.classList && target.classList.contains('perfume-thumb')) {
            target.src = 'photos/placeholder.jpg';
        }
    }, true);

    container.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (action === 'edit' && id) {
            editPerfume(parseInt(id));
        } else if (action === 'delete' && id) {
            deletePerfume(parseInt(id));
        }
    });
}

async function addPerfume() {
    const form = document.getElementById('add-perfume-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch('/api/v2/perfumes', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Perfume added successfully!');
            form.reset();
            loadPerfumes();
        } else {
            const error = await response.json();
            alert('Error adding perfume: ' + error.error);
        }
    } catch (error) {
        console.error('Error adding perfume:', error);
        alert('Error adding perfume');
    }
}

function editPerfume(id) {
    // Fetch perfume details and populate modal
    fetch(`/api/v2/perfumes/${id}`)
        .then(response => response.json())
        .then(perfume => {
            document.getElementById('edit-id').value = perfume.id;
            document.getElementById('edit-reference').value = perfume.reference;
            document.getElementById('edit-name').value = perfume.name;
            document.getElementById('edit-brand_name').value = perfume.brand_name;
            document.getElementById('edit-gender').value = perfume.gender;
            document.getElementById('edit-description').value = perfume.description || '';
            document.getElementById('edit-price').value = perfume.price || '';
            document.getElementById('edit-image_url').value = perfume.image_url || '';
            document.getElementById('edit-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching perfume:', error);
        });
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
            document.getElementById('edit-modal').style.display = 'none';
            loadPerfumes();
        } else {
            const error = await response.json();
            alert('Error updating perfume: ' + error.error);
        }
    } catch (error) {
        console.error('Error updating perfume:', error);
        alert('Error updating perfume');
    }
}

async function deletePerfume(id) {
    if (!confirm('Are you sure you want to delete this perfume?')) {
        return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`/api/v2/perfumes/${id}`, {
            method: 'DELETE',
            headers: headers,
        });

        if (response.ok) {
            alert('Perfume deleted successfully!');
            loadPerfumes();
        } else {
            const error = await response.json();
            alert('Error deleting perfume: ' + error.error);
        }
    } catch (error) {
        console.error('Error deleting perfume:', error);
        alert('Error deleting perfume');
    }
}