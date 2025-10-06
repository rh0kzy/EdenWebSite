// IMMEDIATE CACHE KILLER - Runs before any other scripts
(function() {
    console.log('🧹 CACHE KILLER: Clearing all cached perfume data...');
    
    // Clear global variables
    if (window.offlinePerfumeData) {
        console.log('❌ Destroying cached offlinePerfumeData');
        window.offlinePerfumeData = null;
        delete window.offlinePerfumeData;
    }
    
    if (window.perfumesDatabase) {
        console.log('❌ Destroying cached perfumesDatabase');
        window.perfumesDatabase = null;
        delete window.perfumesDatabase;
    }
    
    // Clear localStorage
    try {
        localStorage.removeItem('perfumesDatabase');
        localStorage.removeItem('offlinePerfumeData');
        localStorage.removeItem('eden_perfumes');
        localStorage.removeItem('perfumes_cache');
        console.log('🧹 Cleared localStorage perfume data');
    } catch (e) {
        console.log('⚠️ Could not clear localStorage');
    }
    
    // Clear sessionStorage
    try {
        sessionStorage.removeItem('perfumesDatabase');
        sessionStorage.removeItem('offlinePerfumeData');
        sessionStorage.removeItem('eden_perfumes');
        sessionStorage.removeItem('perfumes_cache');
        console.log('🧹 Cleared sessionStorage perfume data');
    } catch (e) {
        console.log('⚠️ Could not clear sessionStorage');
    }
    
    // Prevent any script from restoring offline data
    Object.defineProperty(window, 'offlinePerfumeData', {
        set: function(value) {
            console.log('🚫 BLOCKED: Attempt to set offlinePerfumeData to:', value ? value.constructor.name : value);
            return null;
        },
        get: function() {
            return null;
        },
        configurable: false
    });
    
    console.log('✅ CACHE KILLER: All cached data destroyed');
})();