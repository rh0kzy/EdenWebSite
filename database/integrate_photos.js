// Photo Integration System for Eden Parfum
// Maps brand names to their logo files and perfume names to product images

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role for updates
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Read all photo files
const photosDir = path.join(__dirname, '../frontend/photos');
const fragrancesDir = path.join(__dirname, '../frontend/photos/Fragrances');

// Get brand logo files
const brandLogos = fs.readdirSync(photosDir).filter(file => 
    !fs.statSync(path.join(photosDir, file)).isDirectory() && 
    (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.webp') || file.endsWith('.avif'))
);

// Get perfume image files
const perfumeImages = fs.readdirSync(fragrancesDir).filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.webp') || file.endsWith('.avif') || file.endsWith('.jpeg')
);

console.log(`Found ${brandLogos.length} brand logos`);
console.log(`Found ${perfumeImages.length} perfume images`);

// Brand name to logo file mapping
const brandLogoMap = {
    'Diesel': 'Diesel_Parfume_Logo.png',
    'Marc Jacobs': 'marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
    'Jimmy Choo': 'Jimmy_choo.png',
    'Elisabeth Arden': 'Elisabeth Arden.png',
    'Roger Gallet': 'Roger Gallet.jpg',
    'Yves De Sistelle': 'Yves De Sistelle.png',
    'Bvlgari': 'Bulgari_logo.svg.png',
    'Bulgari': 'Bulgari_logo.svg.png',
    'Azzaro': 'Logo_Azzaro.png',
    'Cerruti': 'Cerruti.svg',
    'Killian': 'Killian.png',
    'Kilian': 'kilian paris logo_black_540x260px.png',
    'Prada': 'PRADA.png',
    'Zara': 'ZARA.png',
    'Gucci': 'gucci-1-logo-black-and-white.png',
    'Versace': 'versace.png',
    'Chanel': 'chanel.png',
    'Dior': 'dior.png',
    'YSL': 'YSL_Logo.svg.png',
    'Yves Saint Laurent': 'YSL_Logo.svg.png',
    'Tom Ford': 'tom ford.png',
    'Hugo Boss': 'hugo boss.png',
    'Calvin Klein': 'calvin klein.svg',
    'Armani': 'armani.png',
    'Giorgio Armani': 'armani.png',
    'Burberry': 'logoburberry-1400x433.png',
    'Hermès': 'Hermes.png',
    'Hermes': 'Hermes.png',
    'Cartier': 'Cartier.png',
    'Lancome': 'Lancome.png',
    'Lancôme': 'Lancome.png',
    'Thierry Mugler': 'Thierry Mugler.png',
    'Jean Paul Gaultier': 'jean-paul-gaultier-vector-logo.png',
    'Givenchy': 'givenchy.png',
    'Valentino': 'Valentino.png',
    'Dolce & Gabbana': 'dolce_gabanna.png',
    'Dolce&Gabbana': 'dolce_gabanna.png',
    'Paco Rabanne': 'PACO RABBANE.png',
    'Lacoste': 'lacoste.png',
    'Polo Ralph Lauren': 'Polo.png',
    'Ralph Lauren': 'Polo.png',
    'Issey Miyake': 'Issey Miyake.jpg',
    'Davidoff': 'Davidoff.svg',
    'Escada': 'escada.png',
    'Mont Blanc': 'Mont Blanc.png',
    'Montblanc': 'Mont Blanc.png',
    'Clinique': 'Clinique.png',
    'Cacharel': 'Cacharel.jpg',
    'Nina Ricci': 'NINA RICCI.png',
    'Rochas': 'Rochas.jpg',
    'Guerlain': 'Guerlain.png',
    'Carolina Herrera': 'Carolina Herrera.png',
    'Elie Saab': 'Elie Saab.webp',
    'Britney Spears': 'Britney_Spears.png',
    'Ariana Grande': 'Ariana Grande.jpg',
    'Antonio Banderas': 'Antonio Banderas.jpg',
    'Victoria Secret': "Victoria'S Secret.png",
    "Victoria's Secret": "Victoria'S Secret.png",
    'Creed': 'creed.png',
    'Mancera': 'Mancera.png',
    'Lattafa': 'LATTAFA.svg',
    'Ted Lapidus': 'Ted Lapidus.jpg',
    'Boucheron': 'Logo_of_Boucheron.png',
    'Franck Olivier': 'Franck Olivier.png',
    'Guy Laroche': 'Guy Laroche.png',
    'Lanvin': 'Lanvin.png',
    'Ferrari': 'Ferrari.png',
    'Joop!': 'Joop!.png',
    'Joop': 'Joop!.png',
    'Viktor & Rolf': 'Viktor & Rolf.png',
    'Narciso Rodriguez': 'narcisco.png',
    'Yves Rocher': 'Yves Rocher.png',
    'Etro': 'Etro.png',
    'Al Rehab': 'al rehab.png',
    'Frédéric Malle': 'Frédéric Malle.png',
    'Frederic Malle': 'Frédéric Malle.png',
    'Chloe': 'chloe-Converted.png',
    'Chloé': 'chloe-Converted.png'
};

// Perfume name to image mapping (simplified - you can extend this)
function findPerfumeImage(perfumeName, brandName) {
    // Normalize the perfume name for matching
    const normalized = perfumeName.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();
    
    // Look for exact matches first
    for (const imageFile of perfumeImages) {
        const imageName = imageFile.toLowerCase().replace(/\.(avif|webp|jpg|png|jpeg)$/, '');
        if (imageName === normalized || imageName.includes(normalized.split(' ')[0])) {
            return `photos/Fragrances/${imageFile}`;
        }
    }
    
    // Look for partial matches
    const firstWord = normalized.split(' ')[0];
    if (firstWord.length > 3) {
        for (const imageFile of perfumeImages) {
            const imageName = imageFile.toLowerCase().replace(/\.(avif|webp|jpg|png|jpeg)$/, '');
            if (imageName.includes(firstWord)) {
                return `photos/Fragrances/${imageFile}`;
            }
        }
    }
    
    return null;
}

async function updateBrandLogos() {
    console.log('🎨 Updating brand logos...');
    
    try {
        // Get all brands
        const { data: brands, error } = await supabase
            .from('brands')
            .select('*');
            
        if (error) throw error;
        
        let updatedCount = 0;
        
        for (const brand of brands) {
            const logoFile = brandLogoMap[brand.name];
            if (logoFile && brandLogos.includes(logoFile)) {
                const logoUrl = `photos/${logoFile}`;
                
                const { error: updateError } = await supabase
                    .from('brands')
                    .update({ logo_url: logoUrl })
                    .eq('id', brand.id);
                    
                if (updateError) {
                    console.error(`Error updating logo for ${brand.name}:`, updateError);
                } else {
                    console.log(`✅ Updated logo for ${brand.name}: ${logoUrl}`);
                    updatedCount++;
                }
            } else {
                console.log(`⚠️  No logo found for brand: ${brand.name}`);
            }
        }
        
        console.log(`📊 Brand logos update complete: ${updatedCount}/${brands.length} brands updated`);
        
    } catch (error) {
        console.error('Error updating brand logos:', error);
    }
}

async function updatePerfumeImages() {
    console.log('\n🌸 Updating perfume images...');
    
    try {
        // Get all perfumes
        const { data: perfumes, error } = await supabase
            .from('perfumes')
            .select('*')
            .limit(50); // Start with first 50 for testing
            
        if (error) throw error;
        
        let updatedCount = 0;
        
        for (const perfume of perfumes) {
            const imageUrl = findPerfumeImage(perfume.name, perfume.brand_name);
            
            if (imageUrl) {
                const { error: updateError } = await supabase
                    .from('perfumes')
                    .update({ image_url: imageUrl })
                    .eq('id', perfume.id);
                    
                if (updateError) {
                    console.error(`Error updating image for ${perfume.name}:`, updateError);
                } else {
                    console.log(`✅ Updated image for ${perfume.reference}: ${perfume.name} -> ${imageUrl}`);
                    updatedCount++;
                }
            } else {
                console.log(`⚠️  No image found for: ${perfume.reference} - ${perfume.name}`);
            }
        }
        
        console.log(`📊 Perfume images update complete: ${updatedCount}/${perfumes.length} perfumes updated`);
        
    } catch (error) {
        console.error('Error updating perfume images:', error);
    }
}

async function integratePhotos() {
    console.log('📸 Starting photo integration for Eden Parfum database...\n');
    
    await updateBrandLogos();
    await updatePerfumeImages();
    
    console.log('\n🎉 Photo integration completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check the results in your Supabase dashboard');
    console.log('2. Update the remaining perfume images if needed');
    console.log('3. Test the API endpoints with image URLs');
    console.log('4. Update your frontend to display the images');
}

// Run if called directly
if (require.main === module) {
    integratePhotos();
}

module.exports = { 
    integratePhotos, 
    updateBrandLogos, 
    updatePerfumeImages, 
    findPerfumeImage,
    brandLogoMap 
};