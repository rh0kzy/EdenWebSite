console.log('=== EDEN PARFUM CATALOG VERIFICATION ===');

// Wait for page to fully load
setTimeout(async () => {
    console.log('🔍 Checking catalog state...');
    
    // Check API directly
    try {
        const apiResponse = await fetch('/api/v2/perfumes?limit=506');
        const apiData = await apiResponse.json();
        console.log(`✅ API Test: ${apiData.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`📊 API Data: ${apiData.data.length} perfumes (total: ${apiData.total})`);
    } catch (error) {
        console.log(`❌ API Test Failed: ${error.message}`);
    }
    
    // Check current perfumesDatabase
    console.log('📋 Current perfumesDatabase:', window.perfumesDatabase ? window.perfumesDatabase.length : 'null');
    
    // Check for offline data
    console.log('💾 Offline data present:', window.offlinePerfumeData ? 'YES' : 'NO');
    
    // Check DOM elements
    const perfumeResults = document.getElementById('perfumeResults');
    if (perfumeResults) {
        const perfumeCards = perfumeResults.querySelectorAll('.perfume-card');
        console.log(`🎴 Perfume cards displayed: ${perfumeCards.length}`);
    }
    
    // Final verdict
    if (window.perfumesDatabase && window.perfumesDatabase.length >= 500) {
        console.log('🎉 SUCCESS: Catalog appears to be loading all perfumes!');
    } else if (window.perfumesDatabase && window.perfumesDatabase.length === 40) {
        console.log('⚠️ ISSUE: Still using offline data (40 perfumes)');
    } else {
        console.log('❓ UNKNOWN: Unexpected state - check logs above');
    }
}, 3000);