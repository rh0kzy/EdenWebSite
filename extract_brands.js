// Script to extract all brands and find missing logos
const fs = require('fs');

// Read perfumes data
const perfumesData = fs.readFileSync('perfumes-data.js', 'utf8');

// Extract brands from the file
const brands = new Set();
const lines = perfumesData.split('\n');
lines.forEach(line => {
    const brandMatch = line.match(/brand:\s*"([^"]+)"/);
    if (brandMatch) {
        brands.add(brandMatch[1]);
    }
});

// Brands that have logos (from script.js) - UPDATED LIST
const brandsWithLogos = new Set([
    'Chanel',
    'Yves Saint Laurent',
    'Louis Vuitton',
    'Luis Vuitton',
    'Dolce & Gabbana',
    'Dolce&Gabbana',
    'Burberry',
    'Zara',
    'Diesel',
    'Chloé',
    'Chloe',
    'Azzaro',
    'Boucheron',
    'Britney Spears',
    'Bvlgari',
    'Gucci',
    'Jean Paul Gaultier',
    'Jimmy Choo',
    'Kenzo',
    'Kilian',
    'Lacoste',
    'Marco Jacobs',
    'Marc Jacobs',
    'Narciso Rodriguez',
    'Paco Rabbane',
    'Prada',
    'Roberto Cavali',
    'Roberto Cavalli',
    'Versace',
    'Armani',
    'Calvin Klein',
    'Carolina Herrera',
    'Cartier',
    'Dior',
    'Elie Saab',
    'Escada',
    'Givenchy',
    'Guerlain',
    'Hermes',
    'Hugo Boss',
    'Killian',
    'Kurkidjian',
    'Lanvin',
    'Mancera',
    'Mont Blanc',
    'Thierry Mugler',
    'Tom Ford',
    'Valentino',
    'Viktor&Rolf',
    'Xerjoff',
    'Lattafa',
    'Lataffa',
    'Nina Ricci',
    'Al Rehab',
    'Antonio Banderas',
    'Ariana Grande',
    'Arte Profumi',
    'Cacharel',
    'Creed',
    'Davidoff',
    'Ferrari',
    'Issey Miyake',
    'Kajal',
    'Kayali',
    'Lancome',
    'Nasomatto',
    'Ted Lapidus',
    'Tiziana Tirenzi',
    // Recently added brands
    'Banafaa',
    'Bdk',
    'Caron',
    'Cerruti',
    'Clinique',
    'Denhil',
    'Elisabeth Arden',
    'Etro',
    'Evaflor',
    'Franck Olivier',
    'Frédéric Malle',
    'Guy Laroche',
    'Joop!',
    'La Lique',
    'Laverne',
    'Lolita Land',
    'Mateu',
    'Nautica',
    'Nicos',
    'Nishane',
    'Parfums de Marly',
    'Polo',
    'Repetto',
    'Rochas',
    'Roger Gallet',
    'Solinote',
    'Sospiro',
    'Victoria\'S Secret',
    'Yves De Sistelle',
    'Yves Rocher'
]);

// Find brands without logos
const brandsWithoutLogos = [];
brands.forEach(brand => {
    if (brand && !brandsWithLogos.has(brand)) {
        brandsWithoutLogos.push(brand);
    }
});

console.log('=== BRANDS WITHOUT LOGOS ===\n');
brandsWithoutLogos.sort().forEach((brand, index) => {
    console.log(`${index + 1}. ${brand}`);
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total brands in database: ${brands.size}`);
console.log(`Brands with logos: ${brandsWithLogos.size}`);
console.log(`Brands WITHOUT logos: ${brandsWithoutLogos.length}`);
