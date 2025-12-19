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
    'Roberto Cavalli': 'Roberto-Cavalli-logo.png',
    'Repetto': 'Repetto.jpg',
    'Lataffa': 'LATTAFA.svg',
    'Victoria\'S Secret': "Victoria'S Secret.png",
    'Kayali': 'Kayali.jpg',
    'Dolce&Gabanna': 'dolce_gabanna.png',
    'Arte Profumi': 'Arte Profumi.jpg',
    'Lolita Land': 'Lolita Land.jpg',
    'Bdk': 'Bdk.webp',
    'Laverne': 'Laverne.png',
    'Kenzo': '61fd47dd1042bd46515add61_logo (1) kenzo.png',
    'Paco Rabbane': 'PACO RABBANE.png',
    'Shalis': 'Shalis.png',
    'Luis Vuitton': 'louis-vuitton-1-logo-black-and-white.png',
    'Xerjoff': 'Xerjoff.webp',
    'Solinote': 'Solinote.png',
    'Banafaa': 'Banafaa.jpg',
    'Tiziana Tirenzi': 'Tiziana Tirenzi.png',
    'Parfums de Marly': 'Parfums de Marly.png',
    'Kurkidjian': 'Kurkidjian.png',
    'Viktor&Rolf': 'Viktor & Rolf.png',
    'Polo': 'Polo.png',
    'Mateu': 'Mateu.jpg',
    'Nasomatto': 'Nasomatto.jpg',
    'La Lique': 'La Lique.png',
    'Nishane': 'Nishane.webp',
    'Kajal': 'Kajal.avif',
    'Sospiro': 'Sospiro.avif',
    'Nicos': 'Nicos.webp',
    'Evaflor': 'Evaflor.webp',
    'Nautica': 'Nautica.jpg',
    'Denhil': 'Denhil.jpg',
    'Caron': 'Caron.jpg',
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

// Manual mappings for perfumes that don't match by name
const manualPerfumeMappings = {
    "6309": "photos/Fragrances/375x500.6341.2x.avif", // Angelman
    "6404": "photos/Fragrances/Terre dhermes.avif", // Terre d'Hermès
    "1205": "photos/Fragrances/Creme Bruller.avif", // Crème Brûlée
    "1403": "photos/Fragrances/Bamoboo gucci.avif", // Bamboo
    "1614": "photos/Fragrances/J'adore L'Or.avif", // Jadore L'Or
    "2102": "photos/Fragrances/privet show.avif", // Private Show
    "2307": "photos/Fragrances/Narciso for her.avif", // Narciso Rodriguez FOR HER
    "2312": "photos/Fragrances/L'Eau Couture Elie Saab.avif", // L'Eau Coture
    "2403": "photos/Fragrances/Ameerat Al Arab.avif", // اميرة العرب
    "2405": "photos/Fragrances/Sabaya.avif", // صبايا
    "2501": "photos/Fragrances/Bare vanila.avif", // Bare Vanilla
    "3312": "photos/Dove.webp", // Palmolive -> Dove
    "3609": "photos/Fragrances/Coco Melle.avif", // Coco Mademoiselle
    "4313": "photos/Fragrances/Alexendria Ii.avif", // Alexandria II
    "4406": "photos/Fragrances/Ageur F.Malles.avif", // Musc Ravageur
    "4504": "photos/Fragrances/Nishane.avif" // Hacivat
};

function normalize(text) {
    if (!text) return '';
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep alphanumeric and Arabic characters
        .replace(/\s+/g, ' ')           // Collapse spaces
        .trim();
}

// Perfume name to image mapping
function findPerfumeImage(perfumeName, brandName) {
    const normName = normalize(perfumeName);
    if (!normName) return null; // Don't match empty strings
    
    const normBrand = brandName ? normalize(brandName) : '';
    
    // 1. Try exact match on normalized names
    for (const imageFile of perfumeImages) {
        const imgName = normalize(imageFile.replace(/\.(avif|webp|jpg|png|jpeg)$/i, ''));
        if (imgName && imgName === normName) {
            return `photos/Fragrances/${imageFile}`;
        }
    }
    
    // 2. Try name + brand match
    if (brandName) {
        for (const imageFile of perfumeImages) {
            const imgName = normalize(imageFile.replace(/\.(avif|webp|jpg|png|jpeg)$/i, ''));
            if (imgName && (imgName === `${normName} ${normBrand}` || imgName === `${normBrand} ${normName}`)) {
                return `photos/Fragrances/${imageFile}`;
            }
        }
    }
    
    // 3. Try partial match (only if name is long enough)
    if (normName.length > 3) {
        for (const imageFile of perfumeImages) {
            const imgName = normalize(imageFile.replace(/\.(avif|webp|jpg|png|jpeg)$/i, ''));
            if (imgName && (imgName.includes(normName) || normName.includes(imgName))) {
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
            .select('*');
            
        if (error) throw error;
        
        let updatedCount = 0;
        
        for (const perfume of perfumes) {
            let imageUrl = manualPerfumeMappings[perfume.reference];
            
            if (!imageUrl) {
                imageUrl = findPerfumeImage(perfume.name, perfume.brand_name);
            }
            
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