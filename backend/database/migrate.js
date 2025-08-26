const { executeQuery, executeTransaction, pool } = require('../config/database');
const { perfumesDatabase, getUniqueBrands } = require('../data/perfumes');

async function migratePerfumeData() {
    console.log('🚀 Starting perfume data migration...');
    
    try {
        // First, get unique brands and insert them
        const brands = getUniqueBrands();
        console.log(`📊 Found ${brands.length} unique brands`);
        
        // Insert brands
        for (const brandName of brands) {
            if (brandName && brandName.trim() !== '') {
                const insertBrandQuery = `
                    INSERT IGNORE INTO brands (name, logoUrl, createdAt, updatedAt) 
                    VALUES (?, ?, NOW(), NOW())
                `;
                
                // Get logo URL
                const logoUrl = getBrandLogoPath(brandName);
                
                const result = await executeQuery(insertBrandQuery, [brandName, logoUrl]);
                if (result.success) {
                    console.log(`✅ Brand inserted: ${brandName}`);
                } else {
                    console.log(`⚠️  Brand already exists: ${brandName}`);
                }
            }
        }
        
        console.log(`📊 Processing ${perfumesDatabase.length} perfumes...`);
        
        // Insert perfumes
        let successCount = 0;
        let errorCount = 0;
        
        for (const perfume of perfumesDatabase) {
            try {
                const insertPerfumeQuery = `
                    INSERT IGNORE INTO perfumes (
                        reference,
                        name, 
                        brand, 
                        gender, 
                        description,
                        imageUrl,
                        searchField,
                        createdAt,
                        updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;
                
                const description = `Reference: ${perfume.reference}${perfume.multiplier ? ` | Multiplier: ${perfume.multiplier}` : ''}`;
                const imageUrl = `/photos/Fragrances/${perfume.name}.avif`;
                const searchField = `${perfume.name} ${perfume.brand} ${perfume.reference}`.toLowerCase();
                
                const result = await executeQuery(insertPerfumeQuery, [
                    perfume.reference,
                    perfume.name,
                    perfume.brand || '',
                    perfume.gender || 'Unisex',
                    description,
                    imageUrl,
                    searchField
                ]);
                
                if (result.success) {
                    successCount++;
                    if (successCount % 50 === 0) {
                        console.log(`✅ Processed ${successCount} perfumes...`);
                    }
                } else {
                    errorCount++;
                }
                
            } catch (error) {
                console.error(`❌ Error inserting perfume ${perfume.name}:`, error.message);
                errorCount++;
            }
        }
        
        // Update brand perfume counts
        console.log('📊 Updating brand perfume counts...');
        const updateCountsQuery = `
            UPDATE brands b 
            SET perfumeCount = (
                SELECT COUNT(*) 
                FROM perfumes p 
                WHERE p.brand = b.name AND p.isActive = 1
            )
        `;
        await executeQuery(updateCountsQuery);
        
        console.log(`🎉 Migration completed!`);
        console.log(`✅ Successfully inserted: ${successCount} perfumes`);
        console.log(`❌ Errors: ${errorCount}`);
        
        // Display summary statistics
        const stats = await getDatabaseStats();
        console.log('📊 Database Summary:');
        console.log(`   - Brands: ${stats.brands}`);
        console.log(`   - Perfumes: ${stats.perfumes}`);
        console.log(`   - Active Perfumes: ${stats.activePerfumes}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

async function getDatabaseStats() {
    const brandsResult = await executeQuery('SELECT COUNT(*) as count FROM brands');
    const perfumesResult = await executeQuery('SELECT COUNT(*) as count FROM perfumes');
    const activePerfumesResult = await executeQuery('SELECT COUNT(*) as count FROM perfumes WHERE isActive = 1');
    
    return {
        brands: brandsResult.success ? brandsResult.data[0].count : 0,
        perfumes: perfumesResult.success ? perfumesResult.data[0].count : 0,
        activePerfumes: activePerfumesResult.success ? activePerfumesResult.data[0].count : 0
    };
}

function getBrandLogoPath(brandName) {
    // Map brand names to their logo file paths
    const brandLogos = {
        'Chanel': 'photos/chanel.png',
        'Dior': 'photos/dior.png',
        'Gucci': 'photos/gucci-1-logo-black-and-white.png',
        'Versace': 'photos/versace.png',
        'Prada': 'photos/PRADA.png',
        'Armani': 'photos/armani.png',
        'Burberry': 'photos/BURBERRY.svg',
        'Calvin Klein': 'photos/calvin klein.svg',
        'Hugo Boss': 'photos/hugo boss.png',
        'Jean Paul Gaultier': 'photos/jean-paul-gaultier-vector-logo.png',
        'Marc Jacobs': 'photos/marc-jacobs-fragrances-logo-png_seeklogo-476210.png',
        'Killian': 'photos/kilian paris logo_black_540x260px.png',
        'Bvlgari': 'photos/Bulgari_logo.svg.png',
        'Escada': 'photos/escada.png',
        'Diesel': 'photos/Diesel_Parfume_Logo.png',
        'Jimmy Choo': 'photos/Jimmy_choo.png',
        'Elisabeth Arden': 'photos/Elisabeth Arden.png',
        'Azzaro': 'photos/Logo_Azzaro.png',
        'Cerruti': 'photos/Cerruti.svg',
        'Zara': 'photos/zara.png',
        'Britney Spears': 'photos/Britney_Spears.png',
        'Roberto Cavalli': 'photos/Roberto-Cavalli-logo.png',
        'Repetto': 'photos/Repetto.jpg',
        'Chloe': 'photos/chloe-Converted.png',
        'Rochas': 'photos/Rochas.jpg',
        'Givenchy': 'photos/givenchy.png',
        'Lancome': 'photos/Lancome.png',
        'Kenzo': 'photos/61fd47dd1042bd46515add61_logo (1) kenzo.png',
        'Lacoste': 'photos/lacoste.png',
        'Paco Rabbane': 'photos/PACO RABBANE.png'
    };
    
    return brandLogos[brandName] || null;
}

// Run migration if this file is executed directly
if (require.main === module) {
    migratePerfumeData().then(() => {
        console.log('🎉 Data migration complete!');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Migration error:', error);
        process.exit(1);
    });
}

module.exports = { migratePerfumeData, getDatabaseStats };
