// Missing Image Analysis Script
const fs = require('fs');

// Read available photos
const availablePhotos = fs.readFileSync('available_photos.txt', 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);

console.log(`Available photos: ${availablePhotos.length}`);

// Load perfumes database
const perfumesData = fs.readFileSync('perfumes-data.js', 'utf8');
const perfumesMatch = perfumesData.match(/const perfumesDatabase = \[([\s\S]*?)\];/);
const perfumesContent = perfumesMatch[1];

// Parse perfumes
const perfumes = [];
const lines = perfumesContent.split('\n');
for (const line of lines) {
    const match = line.match(/{\s*reference:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*brand:\s*"([^"]*)",\s*gender:\s*"([^"]+)"/);
    if (match) {
        perfumes.push({
            reference: match[1],
            name: match[2],
            brand: match[3],
            gender: match[4]
        });
    }
}

console.log(`Found ${perfumes.length} perfumes in database`);

// Load current image mappings from script.js
const scriptContent = fs.readFileSync('script.js', 'utf8');
const imageMappingMatch = scriptContent.match(/const imageMap = {([\s\S]*?)};/);
const mappingContent = imageMappingMatch[1];

// Parse image mappings
const imageMap = {};
const mappingLines = mappingContent.split('\n');
for (const line of mappingLines) {
    const match = line.match(/'([^']+)':\s*'([^']+)'/);
    if (match) {
        imageMap[match[1]] = match[2];
    }
}

console.log(`Found ${Object.keys(imageMap).length} mapped images`);

// Check for missing mappings
const missingImages = [];
const foundMappings = [];

for (const perfume of perfumes) {
    if (!perfume.name || perfume.name.trim() === '') continue;
    
    const mapped = imageMap[perfume.name];
    if (mapped) {
        foundMappings.push({
            name: perfume.name,
            brand: perfume.brand,
            mapped: mapped,
            exists: availablePhotos.includes(mapped)
        });
    } else {
        // Check if there's a potential photo file
        const potentialMatches = availablePhotos.filter(photo => {
            const photoName = photo.replace(/\.(avif|webp|jpg|jpeg|png)$/i, '').toLowerCase();
            const perfumeName = perfume.name.toLowerCase();
            
            // Direct match
            if (photoName === perfumeName) return true;
            
            // Remove common words and check
            const cleanPhoto = photoName.replace(/\b(for|women|men|the|de|le|la|du|des|and|&)\b/g, '').trim();
            const cleanPerfume = perfumeName.replace(/\b(for|women|men|the|de|le|la|du|des|and|&)\b/g, '').trim();
            
            if (cleanPhoto === cleanPerfume) return true;
            
            // Check if perfume name is contained in photo
            if (photoName.includes(perfumeName) || perfumeName.includes(photoName)) return true;
            
            return false;
        });
        
        missingImages.push({
            reference: perfume.reference,
            name: perfume.name,
            brand: perfume.brand,
            gender: perfume.gender,
            potentialMatches: potentialMatches
        });
    }
}

console.log(`\nMapped perfumes: ${foundMappings.length}`);
console.log(`Missing mappings: ${missingImages.length}`);

// Show perfumes with broken mappings (mapped but file doesn't exist)
const brokenMappings = foundMappings.filter(m => !m.exists);
console.log(`\nBroken mappings (mapped but file missing): ${brokenMappings.length}`);
if (brokenMappings.length > 0) {
    console.log('\nBROKEN MAPPINGS:');
    brokenMappings.forEach(broken => {
        console.log(`- ${broken.name} (${broken.brand}) -> ${broken.mapped} [FILE NOT FOUND]`);
    });
}

// Show perfumes without mappings but with potential photo matches
const withPotentialMatches = missingImages.filter(m => m.potentialMatches.length > 0);
console.log(`\nPerfumes without mappings but with potential photo matches: ${withPotentialMatches.length}`);

if (withPotentialMatches.length > 0) {
    console.log('\nPOTENTIAL MATCHES TO ADD:');
    withPotentialMatches.forEach(perfume => {
        console.log(`\n${perfume.reference}: "${perfume.name}" (${perfume.brand}) - ${perfume.gender}`);
        perfume.potentialMatches.forEach(match => {
            console.log(`  -> ${match}`);
        });
    });
}

// Show perfumes with no mappings and no potential matches
const noMatches = missingImages.filter(m => m.potentialMatches.length === 0);
console.log(`\nPerfumes with NO photo matches: ${noMatches.length}`);

if (noMatches.length > 0) {
    console.log('\nNO PHOTO AVAILABLE:');
    noMatches.forEach(perfume => {
        console.log(`- ${perfume.reference}: "${perfume.name}" (${perfume.brand}) - ${perfume.gender}`);
    });
}
