const { executeQuery, testConnection } = require('./config/database');

async function checkDatabaseStatus() {
    console.log('🔍 Checking Aiven MySQL Database Status...\n');
    
    try {
        // Test connection
        console.log('1. Testing database connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
            console.log('❌ Database connection failed!');
            return;
        }
        
        // Check what tables exist
        console.log('\n2. Checking existing tables...');
        const tablesResult = await executeQuery('SHOW TABLES');
        if (tablesResult.success) {
            console.log('📊 Tables in database:');
            tablesResult.data.forEach(row => {
                const tableName = Object.values(row)[0];
                console.log(`   - ${tableName}`);
            });
        }
        
        // Check brands count
        console.log('\n3. Checking brands data...');
        const brandsResult = await executeQuery('SELECT COUNT(*) as count FROM brands');
        if (brandsResult.success) {
            console.log(`📦 Brands in database: ${brandsResult.data[0].count}`);
            
            // Show some brand examples
            const brandSampleResult = await executeQuery('SELECT name, logoUrl FROM brands LIMIT 5');
            if (brandSampleResult.success) {
                console.log('   Sample brands:');
                brandSampleResult.data.forEach(brand => {
                    console.log(`   - ${brand.name} (Logo: ${brand.logoUrl || 'No logo'})`);
                });
            }
        }
        
        // Check perfumes count
        console.log('\n4. Checking perfumes data...');
        const perfumesResult = await executeQuery('SELECT COUNT(*) as count FROM perfumes');
        if (perfumesResult.success) {
            console.log(`🌸 Perfumes in database: ${perfumesResult.data[0].count}`);
            
            // Show some perfume examples
            const perfumeSampleResult = await executeQuery(`
                SELECT p.name, b.name as brand, p.gender 
                FROM perfumes p 
                LEFT JOIN brands b ON p.brandId = b.id 
                LIMIT 5
            `);
            if (perfumeSampleResult.success) {
                console.log('   Sample perfumes:');
                perfumeSampleResult.data.forEach(perfume => {
                    console.log(`   - ${perfume.name} by ${perfume.brand || 'Unknown'} (${perfume.gender})`);
                });
            }
        }
        
        // Check categories
        console.log('\n5. Checking categories...');
        const categoriesResult = await executeQuery('SELECT COUNT(*) as count FROM categories');
        if (categoriesResult.success) {
            console.log(`📂 Categories in database: ${categoriesResult.data[0].count}`);
        }
        
        // Check other tables if they exist
        const otherTables = ['perfume_sizes', 'reviews', 'search_analytics'];
        for (const table of otherTables) {
            try {
                const result = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
                if (result.success) {
                    console.log(`📋 ${table}: ${result.data[0].count} records`);
                }
            } catch (error) {
                // Table might not exist, that's okay
            }
        }
        
        console.log('\n✅ Database status check complete!');
        
    } catch (error) {
        console.error('❌ Error checking database status:', error.message);
    }
    
    process.exit(0);
}

checkDatabaseStatus();
