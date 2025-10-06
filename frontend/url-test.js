// Test URL construction fix
console.log('Testing URL construction fix...');

// Simulate the fixed URL construction logic
const testBaseUrl = '/.netlify/functions';
const testEndpoint = '/perfumes';

// Old way (broken)
try {
    const oldUrl = new URL(`${testBaseUrl}${testEndpoint}`);
    console.log('❌ Old way should have failed but didn\'t:', oldUrl.toString());
} catch (error) {
    console.log('✅ Old way fails as expected:', error.message);
}

// New way (fixed)
try {
    let fullUrl;
    if (testBaseUrl.startsWith('http')) {
        fullUrl = `${testBaseUrl}${testEndpoint}`;
    } else {
        fullUrl = `${window.location.origin}${testBaseUrl}${testEndpoint}`;
    }
    const newUrl = new URL(fullUrl);
    console.log('✅ New way works:', newUrl.toString());
} catch (error) {
    console.log('❌ New way failed:', error.message);
}

// Test with actual edenAPI if available
if (window.edenAPI) {
    console.log('Testing with actual edenAPI...');
    window.edenAPI.getPerfumes({limit: 10}).then(response => {
        console.log('✅ edenAPI.getPerfumes() success! Got', response?.data?.length || 0, 'perfumes');
        console.log('Response:', response);
    }).catch(error => {
        console.log('❌ edenAPI.getPerfumes() failed:', error.message);
    });
} else {
    console.log('edenAPI not available yet');
}