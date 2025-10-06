// Quick test to verify the full setup is working
console.log('🚀 Testing complete setup...');

setTimeout(async () => {
    console.log('📍 Location:', window.location.href);
    console.log('🔧 edenAPI available:', !!window.edenAPI);
    
    if (window.edenAPI) {
        console.log('🌐 API Base URL:', window.edenAPI.baseUrl);
        
        try {
            const response = await window.edenAPI.getPerfumes({limit: 506});
            console.log('✅ SUCCESS! Got', response?.data?.length || 0, 'perfumes');
            console.log('📊 Total available:', response?.total || 0);
            
            if (response?.data?.length > 400) {
                console.log('🎉 EXCELLENT: Full catalog is loading!');
            }
        } catch (error) {
            console.log('❌ API call failed:', error.message);
        }
    }
    
    // Check DOM for perfume cards
    setTimeout(() => {
        const cards = document.querySelectorAll('.perfume-card');
        console.log('🎴 Perfume cards in DOM:', cards.length);
        
        if (cards.length > 400) {
            console.log('🏆 PERFECT: All perfumes are displayed!');
        } else if (cards.length > 40) {
            console.log('👍 GOOD: More than 40 perfumes showing');
        } else {
            console.log('⚠️ Still limited to', cards.length, 'perfumes');
        }
    }, 3000);
    
}, 2000);