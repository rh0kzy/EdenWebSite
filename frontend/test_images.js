// Test script to check image mapping
const fs = require('fs');

// Read and evaluate the perfumes data
const perfumesData = fs.readFileSync('perfumes-data.js', 'utf8');
eval(perfumesData);

// Find the two specific perfumes
const tomFordPerfume = perfumesDatabase.find(p => p.reference === "5402");
const gucciPerfume = perfumesDatabase.find(p => p.reference === "1404");

console.log('Tom Ford Perfume (#5402):');
console.log('Name:', tomFordPerfume.name);
console.log('Brand:', tomFordPerfume.brand);
console.log('');

console.log('Gucci Perfume (#1404):');
console.log('Name:', gucciPerfume.name);
console.log('Brand:', gucciPerfume.brand);
console.log('');

// Test the image mapping logic
function testImageMapping(perfume) {
    const imageMap = {
        'Black Tom Ford': 'Black tom ford.avif',
        'Gucci Black': 'gucci black.avif'
    };
    
    let imageName = imageMap[perfume.name];
    
    if (!imageName) {
        const lowerName = perfume.name.toLowerCase();
        if (lowerName.includes('black') && perfume.brand.toLowerCase().includes('gucci')) {
            imageName = 'gucci black.avif';
        }
        if (lowerName.includes('black') && perfume.brand.toLowerCase().includes('tom ford')) {
            imageName = 'Black tom ford.avif';
        }
    }
    
    return imageName ? `photos/Fragrances/${imageName}` : null;
}

console.log('Image mapping test:');
console.log('Tom Ford result:', testImageMapping(tomFordPerfume));
console.log('Gucci result:', testImageMapping(gucciPerfume));
