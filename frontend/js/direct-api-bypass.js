// DIRECT API BYPASS - Forces fresh data without any API clients
(function() {
    'use strict';
    
    console.log('🎯 DIRECT API BYPASS: Starting...');
    
    // Wait for page to load
    function initDirectBypass() {
        // Check if we're on catalog page
        if (!document.getElementById('brandFilter') || !document.getElementById('genderFilter')) {
            console.log('⏭️ Not on catalog page, skipping direct bypass');
            return;
        }
        
        console.log('🚀 DIRECT BYPASS: Loading data directly...');
        
        // Force clear everything
        window.offlinePerfumeData = null;
        window.perfumesDatabase = null;
        
        // Use XMLHttpRequest to bypass any fetch interceptors
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/v2/perfumes?limit=506&direct=true&bypass=cache', true);
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('Expires', '0');
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('🎯 DIRECT BYPASS SUCCESS:', data);
                    
                    if (data.success && data.data && data.data.length > 0) {
                        window.perfumesDatabase = data.data;
                        console.log(`✅ DIRECT BYPASS: Set ${data.data.length} perfumes to window.perfumesDatabase`);
                        
                        // Trigger display update
                        if (window.setupCatalogWithData) {
                            window.setupCatalogWithData();
                        }
                        
                        // Dispatch event
                        window.dispatchEvent(new CustomEvent('perfumesLoaded', {
                            detail: {
                                perfumes: data.data,
                                total: data.total || data.data.length,
                                offline: false,
                                source: 'direct-bypass'
                            }
                        }));
                        
                    } else {
                        console.error('❌ DIRECT BYPASS: Invalid data received', data);
                    }
                } catch (error) {
                    console.error('❌ DIRECT BYPASS: JSON parse error', error);
                }
            } else {
                console.error('❌ DIRECT BYPASS: HTTP error', xhr.status, xhr.statusText);
            }
        };
        
        xhr.onerror = function() {
            console.error('❌ DIRECT BYPASS: Network error');
        };
        
        xhr.send();
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDirectBypass);
    } else {
        initDirectBypass();
    }
    
})();