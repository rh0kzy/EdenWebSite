console.log('🔍 EDEN PARFUM CATALOG VERIFICATION - HTTP MODE');

// Wait for page to fully load
setTimeout(async () => {
    console.log('🔍 Checking catalog state...');
    
    // Check if we're running over HTTP (not file://)
    console.log('🌐 Protocol:', window.location.protocol);
    console.log('🏠 Origin:', window.location.origin);
    
    // Check edenAPI
    console.log('🔧 edenAPI available:', !!window.edenAPI);
    if (window.edenAPI) {
        console.log('🌐 Base URL:', window.edenAPI.baseUrl);
    }
    
    // Test API call through edenAPI
    if (window.edenAPI) {
        try {
            console.log('🧪 Testing edenAPI.getPerfumes()...');
            const edenResponse = await window.edenAPI.getPerfumes({limit: 10});
            console.log('✅ edenAPI Test SUCCESS!');
            console.log('📊 edenAPI returned:', edenResponse?.data?.length || 0, 'perfumes');
        } catch (error) {
            console.log('❌ edenAPI Test Failed:', error.message);
        }
    }
    
    // Check current perfumesDatabase
    console.log('📋 Current perfumesDatabase:', window.perfumesDatabase ? window.perfumesDatabase.length : 'null');
    
    // Check for offline data
    console.log('💾 Offline data:', window.offlinePerfumeData ? window.offlinePerfumeData.length : 'null');
    
    // Check perfume cards in DOM
    const perfumeCards = document.querySelectorAll('.perfume-card');
    console.log('🎴 Perfume cards in DOM:', perfumeCards.length);
    
    // Monitor for changes
    let checkCount = 0;
    const checkInterval = setInterval(() => {
        const cards = document.querySelectorAll('.perfume-card');
        console.log(`🔄 Check ${++checkCount}: ${cards.length} perfumes displayed`);
        
        if (cards.length > 100 || checkCount >= 15) {
            clearInterval(checkInterval);
            if (cards.length > 100) {
                console.log('🎉 SUCCESS: Significant perfumes loaded!');
            } else {
                console.log('⚠️ Limited perfumes after all checks');
            }
        }
    }, 2000);
    
}, 2000);
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