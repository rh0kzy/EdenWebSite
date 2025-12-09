// IMMEDIATE CACHE KILLER - Runs before any other scripts
(function() {
    // Clear global variables ONLY if they exist from old cache
    if (window.offlinePerfumeData) {
        delete window.offlinePerfumeData;
    }
    
    if (window.perfumesDatabase) {
        delete window.perfumesDatabase;
    }
    
    // Clear localStorage
    try {
        localStorage.removeItem('perfumesDatabase');
        localStorage.removeItem('offlinePerfumeData');
        localStorage.removeItem('eden_perfumes');
        localStorage.removeItem('perfumes_cache');
    } catch (e) {
        // Silent fail
    }
    
    // Clear sessionStorage
    try {
        sessionStorage.removeItem('perfumesDatabase');
        sessionStorage.removeItem('offlinePerfumeData');
        sessionStorage.removeItem('eden_perfumes');
        sessionStorage.removeItem('perfumes_cache');
    } catch (e) {
        // Silent fail
    }
})();