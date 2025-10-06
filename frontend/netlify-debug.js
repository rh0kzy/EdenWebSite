// Netlify Debugging Script
// Add this to your catalog.html temporarily to debug Netlify issues

console.log('🔍 NETLIFY DEBUGGING STARTED');

// Log environment details
console.log('🌐 Current location:', window.location.href);
console.log('🏠 Hostname:', window.location.hostname);
console.log('🗂️ Origin:', window.location.origin);

// Test if we're on Netlify
const isNetlify = window.location.hostname.includes('netlify.app') || 
                  window.location.hostname.includes('netlify.com');
console.log('🚀 Is Netlify?', isNetlify);

// Test API client initialization
setTimeout(() => {
    console.log('🔧 edenAPI available:', !!window.edenAPI);
    
    if (window.edenAPI) {
        console.log('📍 API Base URL:', window.edenAPI.baseUrl);
        
        // Test the URL construction
        const testEndpoint = '/perfumes';
        const testParams = { limit: 5 };
        
        // Manually construct what the URL should be
        let expectedUrl;
        if (window.edenAPI.baseUrl.startsWith('http')) {
            expectedUrl = `${window.edenAPI.baseUrl}${testEndpoint}`;
        } else {
            expectedUrl = `${window.location.origin}${window.edenAPI.baseUrl}${testEndpoint}`;
        }
        
        console.log('🔗 Expected URL:', expectedUrl);
        
        // Test actual API call
        console.log('🧪 Testing API call...');
        window.edenAPI.getPerfumes({ limit: 5 })
            .then(response => {
                console.log('✅ API SUCCESS!');
                console.log('📊 Response:', response);
                console.log('📈 Data count:', response?.data?.length || 0);
                console.log('📋 Total available:', response?.total || 0);
            })
            .catch(error => {
                console.log('❌ API FAILED:', error.message);
                console.log('🔍 Error details:', error);
                
                // Try direct fetch to debug
                console.log('🕵️ Testing direct fetch...');
                fetch(expectedUrl + '?limit=5')
                    .then(response => {
                        console.log('📡 Direct fetch response status:', response.status);
                        return response.text();
                    })
                    .then(text => {
                        console.log('📝 Direct fetch response:', text);
                    })
                    .catch(fetchError => {
                        console.log('💥 Direct fetch failed:', fetchError.message);
                    });
            });
    }
}, 2000);

// Monitor for any global errors
window.addEventListener('error', (e) => {
    console.log('🚨 Global Error:', e.error?.message || e.message);
    console.log('📄 Source:', e.filename, 'Line:', e.lineno);
});

// Monitor for unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.log('⚠️ Unhandled Promise Rejection:', e.reason);
});

console.log('✅ Netlify debugging script loaded');