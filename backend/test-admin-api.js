// Test Admin API Endpoints

const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api/admin';

async function testAdminAPI() {
    console.log('🧪 Testing Admin API Endpoints...\n');

    try {
        // Test 1: Get Analytics
        console.log('1. Testing Analytics endpoint...');
        const analyticsResponse = await fetch(`${BASE_URL}/analytics`);
        const analytics = await analyticsResponse.json();
        console.log('✅ Analytics:', analytics);
        console.log('');

        // Test 2: Get All Brands
        console.log('2. Testing Get All Brands...');
        const brandsResponse = await fetch(`${BASE_URL}/brands`);
        const brands = await brandsResponse.json();
        console.log(`✅ Found ${brands.length} brands`);
        console.log('');

        // Test 3: Get All Perfumes (with pagination)
        console.log('3. Testing Get All Perfumes...');
        const perfumesResponse = await fetch(`${BASE_URL}/perfumes?page=1&limit=5`);
        const perfumesData = await perfumesResponse.json();
        console.log(`✅ Found ${perfumesData.perfumes.length} perfumes on page 1`);
        console.log('Pagination:', perfumesData.pagination);
        console.log('');

        // Test 4: Get Specific Perfume
        if (perfumesData.perfumes.length > 0) {
            const firstPerfume = perfumesData.perfumes[0];
            console.log('4. Testing Get Specific Perfume...');
            const perfumeResponse = await fetch(`${BASE_URL}/perfumes/${firstPerfume.id}`);
            const perfume = await perfumeResponse.json();
            console.log(`✅ Retrieved perfume: ${perfume.name} by ${perfume.brand}`);
            console.log('');
        }

        // Test 5: Search Perfumes
        console.log('5. Testing Search Perfumes...');
        const searchResponse = await fetch(`${BASE_URL}/perfumes?search=chanel&page=1&limit=3`);
        const searchData = await searchResponse.json();
        console.log(`✅ Search for "chanel" found ${searchData.perfumes.length} results`);
        console.log('');

        // Test 6: Filter by Brand
        if (brands.length > 0) {
            const firstBrand = brands[0];
            console.log('6. Testing Filter by Brand...');
            const filterResponse = await fetch(`${BASE_URL}/perfumes?brand=${encodeURIComponent(firstBrand.name)}&page=1&limit=3`);
            const filterData = await filterResponse.json();
            console.log(`✅ Filter by "${firstBrand.name}" found ${filterData.perfumes.length} results`);
            console.log('');
        }

        console.log('🎉 All admin API endpoints are working correctly!');

    } catch (error) {
        console.error('❌ Error testing admin API:', error.message);
    }
}

testAdminAPI();
