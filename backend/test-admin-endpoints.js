// Simple test for admin endpoints
async function testAdminEndpoints() {
    console.log('Testing admin endpoints...\n');
    
    const baseUrl = 'http://localhost:3000/api/admin';
    
    try {
        // Test analytics endpoint
        console.log('1. Testing /api/admin/analytics');
        const analyticsResponse = await fetch(`${baseUrl}/analytics`);
        console.log('Status:', analyticsResponse.status);
        if (analyticsResponse.ok) {
            const data = await analyticsResponse.json();
            console.log('Analytics data:', data);
        } else {
            const error = await analyticsResponse.text();
            console.log('Analytics error:', error);
        }
        console.log('');
        
        // Test brands endpoint
        console.log('2. Testing /api/admin/brands');
        const brandsResponse = await fetch(`${baseUrl}/brands`);
        console.log('Status:', brandsResponse.status);
        if (brandsResponse.ok) {
            const data = await brandsResponse.json();
            console.log('Brands count:', data.length);
        } else {
            const error = await brandsResponse.text();
            console.log('Brands error:', error);
        }
        console.log('');
        
        // Test perfumes endpoint
        console.log('3. Testing /api/admin/perfumes');
        const perfumesResponse = await fetch(`${baseUrl}/perfumes?page=1&limit=5`);
        console.log('Status:', perfumesResponse.status);
        if (perfumesResponse.ok) {
            const data = await perfumesResponse.json();
            console.log('Perfumes count:', data.perfumes ? data.perfumes.length : 'No perfumes property');
        } else {
            const error = await perfumesResponse.text();
            console.log('Perfumes error:', error);
        }
        
    } catch (error) {
        console.error('Error testing endpoints:', error.message);
    }
}

testAdminEndpoints();
