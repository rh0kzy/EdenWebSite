// IMMEDIATE CACHE KILLER - Runs before any other scripts
(function() {
    console.log('🧹 Cache killer running - clearing old cached data...');
    
    // Clear global variables ONLY if they exist from old cache
    if (window.offlinePerfumeData) {
        console.log('  Clearing window.offlinePerfumeData');
        delete window.offlinePerfumeData;
    }
    
    if (window.perfumesDatabase) {
        console.log('  Clearing window.perfumesDatabase');
        delete window.perfumesDatabase;
    }
    
    // Clear localStorage
    try {
        localStorage.removeItem('perfumesDatabase');
        localStorage.removeItem('offlinePerfumeData');
        localStorage.removeItem('eden_perfumes');
        localStorage.removeItem('perfumes_cache');
        console.log('  Cleared localStorage');
    } catch (e) {
        // Silent fail
    }
    
    // Clear sessionStorage
    try {
        sessionStorage.removeItem('perfumesDatabase');
        sessionStorage.removeItem('offlinePerfumeData');
        sessionStorage.removeItem('eden_perfumes');
        sessionStorage.removeItem('perfumes_cache');
        console.log('  Cleared sessionStorage');
    } catch (e) {
        // Silent fail
    }
    
    console.log('✅ Cache killer completed - ready for fresh data');
})();