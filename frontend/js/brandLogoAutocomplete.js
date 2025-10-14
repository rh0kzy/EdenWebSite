// Brand Logo Autocomplete Module - Suggests available logo files from /photos/ directory
let availableLogos = [];
let currentLogoInput = null;
let currentSuggestionsList = null;
let selectedIndex = -1;

/**
 * Load available logo files from the photos directory
 */
export async function loadAvailableLogos() {
    try {
        console.log('🎨 Step 1: Loading from brands API...');
        // First, try to load from brands API to get existing logos
        await loadLogosFromBrands();
        console.log(`   Result: ${availableLogos.length} logos from API`);
        
        // Then, scan the photos directory via file existence checks
        if (availableLogos.length === 0) {
            console.log('🔍 Step 2: Scanning photos directory...');
            await scanPhotosDirectory();
            console.log(`   Result: ${availableLogos.length} logos from directory`);
        }
        
        // If still no logos, use pattern matching
        if (availableLogos.length === 0) {
            console.log('📦 Step 3: Pattern matching common brands...');
            await loadCommonLogoPatterns();
            console.log(`   Result: ${availableLogos.length} logos from patterns`);
        }
        
        console.log(`✅ Loaded ${availableLogos.length} logo files total`);
        
        // Log first 20 logos for debugging
        if (availableLogos.length > 0) {
            console.log('📋 Sample logos loaded:', availableLogos.slice(0, 20));
        } else {
            console.error('❌ CRITICAL: No logos were loaded after all 3 methods!');
            console.error('   Check: 1) API endpoint /api/v2/brands');
            console.error('   Check: 2) Directory listing /photos/');
            console.error('   Check: 3) File existence photos/Dove.webp');
        }
    } catch (error) {
        console.error('💥 Fatal error loading logos:', error);
    }
}

/**
 * Scan photos directory by checking common file patterns
 */
async function scanPhotosDirectory() {
    // Get list of files by checking the parent directory listing
    try {
        console.log('   → Fetching /photos/...');
        const response = await fetch('/photos/');
        console.log(`   → Response status: ${response.status} ${response.statusText}`);
        console.log(`   → Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
            const html = await response.text();
            console.log(`   → HTML received: ${html.length} characters`);
            
            // Parse HTML to extract image files
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');
            console.log(`   → Found ${links.length} links in directory listing`);
            
            let imageCount = 0;
            links.forEach(link => {
                const href = link.getAttribute('href');
                // Filter out parent directory links and non-image files
                if (href && href !== '../' && !href.endsWith('/') && isImageFile(href)) {
                    if (!availableLogos.includes(href)) {
                        availableLogos.push(href);
                        imageCount++;
                    }
                }
            });
            
            console.log(`   ✅ Found ${imageCount} image files via directory listing`);
        } else {
            console.warn('   ⚠️ Directory listing not available (not HTML or failed)');
        }
    } catch (error) {
        console.error('   ❌ Could not scan directory:', error);
    }
}

/**
 * Fallback: Load logos from brands API
 */
async function loadLogosFromBrands() {
    try {
        console.log('   → Fetching /api/v2/brands?limit=1000...');
        const response = await fetch('/api/v2/brands?limit=1000');
        console.log(`   → Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   → Data received:', data.success ? 'success' : 'failed', `(${data.data?.length || 0} brands)`);
            
            if (data.success && data.data) {
                const logosFromAPI = data.data
                    .filter(brand => brand.logo_url)
                    .map(brand => brand.logo_url.replace(/^photos\//, ''));
                
                console.log(`   → Brands with logos: ${logosFromAPI.length}`);
                availableLogos = logosFromAPI;
                
                console.log(`   ✅ Loaded ${availableLogos.length} logos from brands API`);
            } else {
                console.warn('   ⚠️ API response missing data');
            }
        } else {
            console.warn(`   ⚠️ API request failed: ${response.status}`);
        }
    } catch (error) {
        console.error('   ❌ Error loading logos from brands API:', error);
    }
}

/**
 * Load common logo patterns as last resort
 */
async function loadCommonLogoPatterns() {
    console.log('   → Testing common brand logo patterns...');
    
    // List common brand names to try (prioritize most likely formats)
    const commonBrands = [
        'Dior', 'Chanel', 'Gucci', 'Prada', 'Versace', 'Armani', 'YSL', 'Tom Ford',
        'Burberry', 'Givenchy', 'Hermès', 'Dolce', 'Lancôme', 'Estée Lauder',
        'Calvin Klein', 'Hugo Boss', 'Lacoste', 'Bvlgari', 'Cartier', 'Montblanc',
        'Carolina Herrera', 'Jean Paul Gaultier', 'Thierry Mugler', 'Kenzo',
        'Valentino', 'Diesel', 'Davidoff', 'Polo', 'Azzaro', 'Paco Rabanne',
        'Issey Miyake', 'Salvatore Ferragamo', 'Nina Ricci', 'Rochas', 'Lolita Lempicka',
        'Narciso Rodriguez', 'Marc Jacobs', 'Michael Kors', 'Coach', 'Tiffany',
        'Kajal', 'Sospiro', 'Dove', 'Lattafa', 'Armaf', 'Rasasi', 'Swiss Arabian'
    ];
    
    // Only check most common extensions (webp, png, jpg)
    const extensions = ['webp', 'png', 'jpg'];
    
    // Build list of files to check
    const filesToCheck = [];
    for (const brand of commonBrands) {
        for (const ext of extensions) {
            filesToCheck.push(`${brand}.${ext}`);
        }
    }
    
    console.log(`   → Testing ${filesToCheck.length} possible file combinations...`);
    
    let foundCount = 0;
    // Check files in batches of 10 to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < filesToCheck.length; i += batchSize) {
        const batch = filesToCheck.slice(i, i + batchSize);
        const results = await Promise.all(
            batch.map(async filename => {
                const exists = await checkImageExists(`photos/${filename}`);
                if (exists) {
                    console.log(`   ✓ Found: ${filename}`);
                }
                return exists ? filename : null;
            })
        );
        
        // Add existing files to availableLogos
        results.forEach(filename => {
            if (filename && !availableLogos.includes(filename)) {
                availableLogos.push(filename);
                foundCount++;
            }
        });
        
        // Show progress
        if ((i + batchSize) % 50 === 0) {
            console.log(`   → Progress: ${Math.min(i + batchSize, filesToCheck.length)}/${filesToCheck.length} checked, ${foundCount} found`);
        }
    }
    
    console.log(`   ✅ Found ${foundCount} logos via pattern matching (total: ${availableLogos.length})`);
}

/**
 * Check if an image exists
 */
async function checkImageExists(imagePath) {
    try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Check if file is an image
 */
function isImageFile(filename) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.avif', '.gif'];
    const lowerFilename = filename.toLowerCase();
    return imageExtensions.some(ext => lowerFilename.endsWith(ext));
}

/**
 * Setup brand logo autocomplete for an input field
 * @param {string} inputId - ID of the input field
 * @param {string} suggestionsId - ID of the suggestions container
 */
export function setupBrandLogoAutocomplete(inputId = 'brand-logo-input', suggestionsId = 'logo-suggestions') {
    currentLogoInput = document.getElementById(inputId);
    currentSuggestionsList = document.getElementById(suggestionsId);
    
    if (!currentLogoInput || !currentSuggestionsList) {
        console.warn('Brand logo autocomplete elements not found');
        return;
    }
    
    // Input event - show suggestions as user types
    currentLogoInput.addEventListener('input', handleLogoInput);
    
    // Focus event - show suggestions when focused
    currentLogoInput.addEventListener('focus', () => {
        if (currentLogoInput.value.trim()) {
            handleLogoInput();
        }
    });
    
    // Keyboard navigation
    currentLogoInput.addEventListener('keydown', handleLogoKeyboard);
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!currentLogoInput.contains(e.target) && !currentSuggestionsList.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    console.log('✅ Brand logo autocomplete initialized');
}

/**
 * Handle input event
 */
function handleLogoInput() {
    const searchTerm = currentLogoInput.value.trim().toLowerCase();
    
    console.log(`🔍 Searching for: "${searchTerm}" in ${availableLogos.length} logos`);
    console.log('📋 Available logos:', availableLogos.slice(0, 10)); // Show first 10
    
    if (!searchTerm) {
        hideSuggestions();
        return;
    }
    
    // Filter logos based on search term
    const matches = availableLogos.filter(logo => {
        const logoName = logo.toLowerCase();
        return logoName.includes(searchTerm);
    });
    
    console.log(`✅ Found ${matches.length} matches:`, matches);
    
    if (matches.length === 0) {
        showNoResults(searchTerm);
        return;
    }
    
    // Sort matches - exact matches first, then by similarity
    matches.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(searchTerm);
        const bStarts = bLower.startsWith(searchTerm);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
    });
    
    showSuggestions(matches.slice(0, 15)); // Show top 15 matches
}

/**
 * Show suggestions
 */
function showSuggestions(logos) {
    currentSuggestionsList.innerHTML = '';
    selectedIndex = -1;
    
    logos.forEach((logo, index) => {
        const li = document.createElement('li');
        li.className = 'logo-suggestion-item';
        li.dataset.index = index;
        
        // Create preview image
        const img = document.createElement('img');
        img.src = `photos/${logo}`;
        img.alt = logo;
        img.className = 'logo-preview';
        img.onerror = () => {
            img.style.display = 'none';
        };
        
        // Create text
        const text = document.createElement('span');
        text.textContent = logo;
        text.className = 'logo-name';
        
        li.appendChild(img);
        li.appendChild(text);
        
        // Click event
        li.addEventListener('click', () => selectLogo(logo));
        
        currentSuggestionsList.appendChild(li);
    });
    
    currentSuggestionsList.style.display = 'block';
}

/**
 * Show "no results" message
 */
function showNoResults(searchTerm) {
    currentSuggestionsList.innerHTML = `
        <li class="logo-no-results">
            <span>❌ No logos found matching "${searchTerm}"</span>
            <small>Try: "${searchTerm}.png" or "${searchTerm}.webp"</small>
        </li>
    `;
    currentSuggestionsList.style.display = 'block';
}

/**
 * Hide suggestions
 */
function hideSuggestions() {
    if (currentSuggestionsList) {
        currentSuggestionsList.style.display = 'none';
        currentSuggestionsList.innerHTML = '';
        selectedIndex = -1;
    }
}

/**
 * Select a logo
 */
function selectLogo(logo) {
    if (currentLogoInput) {
        // Set the value with photos/ prefix for database storage
        currentLogoInput.value = `photos/${logo}`;
        
        // Trigger change event for any listeners
        currentLogoInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Update preview if preview element exists
        updateLogoPreview(`photos/${logo}`);
    }
    hideSuggestions();
}

/**
 * Update logo preview
 */
function updateLogoPreview(logoPath) {
    // Try to use global updateLogoPreview if available
    if (typeof window.updateLogoPreview === 'function') {
        window.updateLogoPreview(logoPath);
        return;
    }
    
    // Fallback to direct DOM manipulation
    const preview = document.getElementById('logo-preview');
    if (preview) {
        preview.src = logoPath;
        preview.style.display = 'block';
        preview.onerror = () => {
            preview.style.display = 'none';
        };
    }
}

/**
 * Handle keyboard navigation
 */
function handleLogoKeyboard(e) {
    const items = currentSuggestionsList.querySelectorAll('.logo-suggestion-item');
    
    if (!items.length) return;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                const logoName = items[selectedIndex].querySelector('.logo-name').textContent;
                selectLogo(logoName);
            }
            break;
            
        case 'Escape':
            e.preventDefault();
            hideSuggestions();
            currentLogoInput.blur();
            break;
    }
}

/**
 * Update visual selection
 */
function updateSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * Get available logos (for external use)
 */
export function getAvailableLogos() {
    return [...availableLogos];
}

/**
 * Search logos by term
 */
export function searchLogos(term) {
    const searchTerm = term.toLowerCase();
    return availableLogos.filter(logo => 
        logo.toLowerCase().includes(searchTerm)
    );
}
