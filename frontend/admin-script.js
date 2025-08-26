// Admin Panel JavaScript

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.perfumesPerPage = 10;
        this.brands = [];
        this.perfumes = [];
        this.analytics = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Forms
        document.getElementById('brandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBrand();
        });

        document.getElementById('perfumeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePerfume();
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;

        // Load section data
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'brands':
                this.loadBrands();
                break;
            case 'perfumes':
                this.loadPerfumes();
                break;
        }
    }

    async loadDashboard() {
        try {
            const response = await fetch('/api/admin/analytics');
            const data = await response.json();
            
            if (response.ok) {
                this.analytics = data;
                this.renderAnalytics();
                this.renderTopBrands();
            } else {
                this.showError('Failed to load analytics');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    renderAnalytics() {
        const grid = document.getElementById('analyticsGrid');
        grid.innerHTML = `
            <div class="analytics-card">
                <h3>${this.analytics.total_brands}</h3>
                <p>Total Brands</p>
            </div>
            <div class="analytics-card">
                <h3>${this.analytics.total_perfumes}</h3>
                <p>Active Perfumes</p>
            </div>
            <div class="analytics-card">
                <h3>${this.analytics.inactive_perfumes}</h3>
                <p>Inactive Perfumes</p>
            </div>
            <div class="analytics-card">
                <h3>${this.analytics.total_brands + this.analytics.total_perfumes}</h3>
                <p>Total Items</p>
            </div>
        `;
    }

    renderTopBrands() {
        const tbody = document.querySelector('#topBrandsTable tbody');
        tbody.innerHTML = this.analytics.top_brands.map(brand => `
            <tr>
                <td>${brand.name}</td>
                <td>${brand.perfume_count}</td>
            </tr>
        `).join('');
    }

    async loadBrands() {
        try {
            const response = await fetch('/api/admin/brands');
            const data = await response.json();
            
            if (response.ok) {
                this.brands = data;
                this.renderBrands();
                this.populateBrandOptions();
            } else {
                this.showError('Failed to load brands');
            }
        } catch (error) {
            console.error('Error loading brands:', error);
            this.showError('Failed to load brands');
        }
    }

    renderBrands() {
        const tbody = document.querySelector('#brandsTable tbody');
        tbody.innerHTML = this.brands.map(brand => `
            <tr>
                <td>
                    ${brand.logoUrl ? 
                        `<img src="${brand.logoUrl}" alt="${brand.name}" class="image-preview">` : 
                        '<span>No logo</span>'}
                </td>
                <td><strong>${brand.name}</strong></td>
                <td>${brand.country || 'N/A'}</td>
                <td>${brand.founded || 'N/A'}</td>
                <td>${brand.perfume_count || 0}</td>
                <td>
                    <button class="btn-edit" onclick="adminPanel.editBrand(${brand.id})">Edit</button>
                    <button class="btn-danger" onclick="adminPanel.deleteBrand(${brand.id}, '${brand.name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async loadPerfumes(page = 1) {
        try {
            const search = document.getElementById('perfumeSearch').value;
            const brand = document.getElementById('brandFilter').value;
            
            const params = new URLSearchParams({
                page: page,
                limit: this.perfumesPerPage
            });
            
            if (search) params.append('search', search);
            if (brand) params.append('brand', brand);
            
            const response = await fetch(`/api/admin/perfumes?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                this.perfumes = data.perfumes;
                this.currentPage = data.pagination.current_page;
                this.renderPerfumes();
                this.renderPagination(data.pagination);
            } else {
                this.showError('Failed to load perfumes');
            }
        } catch (error) {
            console.error('Error loading perfumes:', error);
            this.showError('Failed to load perfumes');
        }
    }

    renderPerfumes() {
        const tbody = document.querySelector('#perfumesTable tbody');
        tbody.innerHTML = this.perfumes.map(perfume => `
            <tr>
                <td>
                    ${perfume.imageUrl ? 
                        `<img src="${perfume.imageUrl}" alt="${perfume.name}" class="image-preview">` : 
                        '<span>No image</span>'}
                </td>
                <td><strong>${perfume.name}</strong></td>
                <td>${perfume.brand}</td>
                <td>${perfume.gender}</td>
                <td>${perfume.size || 'N/A'}</td>
                <td>${perfume.price ? '$' + perfume.price : 'N/A'}</td>
                <td>
                    <span class="status-badge ${perfume.isActive ? 'status-active' : 'status-inactive'}">
                        ${perfume.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-edit" onclick="adminPanel.editPerfume(${perfume.id})">Edit</button>
                    <button class="btn-danger" onclick="adminPanel.deletePerfume(${perfume.id}, '${perfume.name}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderPagination(pagination) {
        const container = document.getElementById('perfumePagination');
        const { current_page, total_pages } = pagination;
        
        let html = '';
        
        // Previous button
        if (current_page > 1) {
            html += `<button onclick="adminPanel.loadPerfumes(${current_page - 1})">Previous</button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(total_pages, current_page + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const active = i === current_page ? 'active' : '';
            html += `<button class="${active}" onclick="adminPanel.loadPerfumes(${i})">${i}</button>`;
        }
        
        // Next button
        if (current_page < total_pages) {
            html += `<button onclick="adminPanel.loadPerfumes(${current_page + 1})">Next</button>`;
        }
        
        container.innerHTML = html;
    }

    populateBrandOptions() {
        const brandFilter = document.getElementById('brandFilter');
        const perfumeBrand = document.getElementById('perfumeBrand');
        
        const options = this.brands.map(brand => 
            `<option value="${brand.name}">${brand.name}</option>`
        ).join('');
        
        brandFilter.innerHTML = '<option value="">All Brands</option>' + options;
        perfumeBrand.innerHTML = '<option value="">Select Brand</option>' + options;
    }

    // Brand operations
    openBrandModal(brand = null) {
        const modal = document.getElementById('brandModal');
        const title = document.getElementById('brandModalTitle');
        const form = document.getElementById('brandForm');
        
        form.reset();
        document.getElementById('brandModalError').innerHTML = '';
        
        if (brand) {
            title.textContent = 'Edit Brand';
            document.getElementById('brandId').value = brand.id;
            document.getElementById('brandName').value = brand.name;
            document.getElementById('brandCountry').value = brand.country || '';
            document.getElementById('brandFounded').value = brand.founded || '';
            document.getElementById('brandDescription').value = brand.description || '';
        } else {
            title.textContent = 'Add New Brand';
            document.getElementById('brandId').value = '';
        }
        
        modal.style.display = 'block';
    }

    closeBrandModal() {
        document.getElementById('brandModal').style.display = 'none';
    }

    async editBrand(id) {
        const brand = this.brands.find(b => b.id === id);
        if (brand) {
            this.openBrandModal(brand);
        }
    }

    async saveBrand() {
        const form = document.getElementById('brandForm');
        const formData = new FormData(form);
        const brandId = formData.get('brandId');
        
        try {
            const url = brandId ? `/api/admin/brands/${brandId}` : '/api/admin/brands';
            const method = brandId ? 'PUT' : 'POST';
            
            // Remove brandId from formData as it's in the URL for PUT requests
            if (brandId) {
                formData.delete('brandId');
            }
            
            const response = await fetch(url, {
                method: method,
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                this.closeBrandModal();
                this.loadBrands();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            } else {
                this.showError(data.error || 'Failed to save brand', 'brandModalError');
            }
        } catch (error) {
            console.error('Error saving brand:', error);
            this.showError('Failed to save brand', 'brandModalError');
        }
    }

    async deleteBrand(id, name) {
        if (!confirm(`Are you sure you want to delete the brand "${name}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/brands/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                this.loadBrands();
                if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            } else {
                this.showError(data.error || 'Failed to delete brand');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            this.showError('Failed to delete brand');
        }
    }

    // Perfume operations
    openPerfumeModal(perfume = null) {
        const modal = document.getElementById('perfumeModal');
        const title = document.getElementById('perfumeModalTitle');
        const form = document.getElementById('perfumeForm');
        
        form.reset();
        document.getElementById('perfumeModalError').innerHTML = '';
        
        if (perfume) {
            title.textContent = 'Edit Perfume';
            document.getElementById('perfumeId').value = perfume.id;
            document.getElementById('perfumeName').value = perfume.name;
            document.getElementById('perfumeBrand').value = perfume.brand;
            document.getElementById('perfumeGender').value = perfume.gender;
            document.getElementById('perfumeSize').value = perfume.size || '';
            document.getElementById('perfumePrice').value = perfume.price || '';
            document.getElementById('perfumeDescription').value = perfume.description || '';
            document.getElementById('perfumeNotes').value = perfume.fragrance_notes || '';
            document.getElementById('perfumeLongevity').value = perfume.longevity || '';
            document.getElementById('perfumeSillage').value = perfume.sillage || '';
            document.getElementById('perfumeSeason').value = perfume.season || '';
            document.getElementById('perfumeOccasion').value = perfume.occasion || '';
            document.getElementById('perfumeStatus').value = perfume.isActive;
        } else {
            title.textContent = 'Add New Perfume';
            document.getElementById('perfumeId').value = '';
            document.getElementById('perfumeStatus').value = '1';
        }
        
        modal.style.display = 'block';
    }

    closePerfumeModal() {
        document.getElementById('perfumeModal').style.display = 'none';
    }

    async editPerfume(id) {
        try {
            const response = await fetch(`/api/admin/perfumes/${id}`);
            const perfume = await response.json();
            
            if (response.ok) {
                this.openPerfumeModal(perfume);
            } else {
                this.showError('Failed to load perfume details');
            }
        } catch (error) {
            console.error('Error loading perfume:', error);
            this.showError('Failed to load perfume details');
        }
    }

    async savePerfume() {
        const form = document.getElementById('perfumeForm');
        const formData = new FormData(form);
        const perfumeId = formData.get('perfumeId');
        
        try {
            const url = perfumeId ? `/api/admin/perfumes/${perfumeId}` : '/api/admin/perfumes';
            const method = perfumeId ? 'PUT' : 'POST';
            
            // Remove perfumeId from formData as it's in the URL for PUT requests
            if (perfumeId) {
                formData.delete('perfumeId');
            }
            
            const response = await fetch(url, {
                method: method,
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                this.closePerfumeModal();
                this.loadPerfumes(this.currentPage);
                if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            } else {
                this.showError(data.error || 'Failed to save perfume', 'perfumeModalError');
            }
        } catch (error) {
            console.error('Error saving perfume:', error);
            this.showError('Failed to save perfume', 'perfumeModalError');
        }
    }

    async deletePerfume(id, name) {
        const action = confirm(`What would you like to do with "${name}"?\n\nOK = Deactivate (soft delete)\nCancel = Abort`);
        if (action === null) return;
        
        const permanent = !action && confirm('Do you want to permanently delete this perfume? This cannot be undone.');
        
        try {
            const url = permanent ? 
                `/api/admin/perfumes/${id}?permanent=true` : 
                `/api/admin/perfumes/${id}`;
            
            const response = await fetch(url, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data.message);
                this.loadPerfumes(this.currentPage);
                if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            } else {
                this.showError(data.error || 'Failed to delete perfume');
            }
        } catch (error) {
            console.error('Error deleting perfume:', error);
            this.showError('Failed to delete perfume');
        }
    }

    // Search and filter functions
    searchBrands() {
        const search = document.getElementById('brandSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#brandsTable tbody tr');
        
        rows.forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const country = row.cells[2].textContent.toLowerCase();
            
            if (name.includes(search) || country.includes(search)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    searchPerfumes() {
        this.loadPerfumes(1);
    }

    filterPerfumes() {
        this.loadPerfumes(1);
    }

    // Utility functions
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showError(message, containerId = null) {
        const container = containerId ? 
            document.getElementById(containerId) : 
            this.createTempAlert();
        
        container.innerHTML = `<div class="error">${message}</div>`;
        
        if (!containerId) {
            setTimeout(() => container.remove(), 5000);
        }
    }

    showSuccess(message) {
        const container = this.createTempAlert();
        container.innerHTML = `<div class="success">${message}</div>`;
        setTimeout(() => container.remove(), 3000);
    }

    createTempAlert() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
}

// Global functions for HTML onclick events
function openBrandModal() {
    adminPanel.openBrandModal();
}

function closeBrandModal() {
    adminPanel.closeBrandModal();
}

function openPerfumeModal() {
    adminPanel.openPerfumeModal();
}

function closePerfumeModal() {
    adminPanel.closePerfumeModal();
}

function searchBrands() {
    adminPanel.searchBrands();
}

function searchPerfumes() {
    adminPanel.searchPerfumes();
}

function filterPerfumes() {
    adminPanel.filterPerfumes();
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
