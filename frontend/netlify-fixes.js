// Netlify-specific API Client Fixes
// Place this before the main apiClient.js to patch common Netlify issues

(function() {
    console.log('🔧 Applying Netlify fixes...');
    
    // Override fetch to add debugging for Netlify Functions
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        // Log all API calls for debugging
        if (typeof url === 'string' && url.includes('/.netlify/functions/')) {
            console.log('📡 Netlify Function Call:', url);
            console.log('⚙️ Options:', options);
        }
        
        try {
            const response = await originalFetch(...args);
            
            // Log response details for Netlify functions
            if (typeof url === 'string' && url.includes('/.netlify/functions/')) {
                console.log('📥 Response Status:', response.status);
                console.log('📄 Response Headers:', Object.fromEntries(response.headers));
                
                // Clone response to read body without consuming it
                const clonedResponse = response.clone();
                try {
                    const responseText = await clonedResponse.text();
                    console.log('📝 Response Body Preview:', responseText.substring(0, 200));
                } catch (e) {
                    console.log('❌ Could not read response body');
                }
            }
            
            return response;
        } catch (error) {
            if (typeof url === 'string' && url.includes('/.netlify/functions/')) {
                console.log('💥 Netlify Function Error:', error.message);
            }
            throw error;
        }
    };
    
    // Add a test function to verify Netlify Functions
    window.testNetlifyFunction = async function(functionName = 'perfumes') {
        const testUrl = `${window.location.origin}/.netlify/functions/${functionName}?limit=1`;
        console.log('🧪 Testing Netlify Function:', testUrl);
        
        try {
            const response = await fetch(testUrl);
            const data = await response.json();
            console.log('✅ Function Test Result:', data);
            return data;
        } catch (error) {
            console.log('❌ Function Test Failed:', error.message);
            return { error: error.message };
        }
    };
    
    console.log('✅ Netlify fixes applied');
})();