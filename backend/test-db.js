const { executeQuery } = require('./config/database');

async function testDatabase() {
    try {
        console.log('🔍 Testing database queries...');
        
        // Test basic query
        const result = await executeQuery('SELECT COUNT(*) as count FROM perfumes WHERE isActive = 1');
        if (result.success) {
            console.log(`✅ Found ${result.data[0].count} active perfumes`);
        } else {
            console.error('❌ Failed to query perfumes:', result.error);
        }
        
        // Test brand query
        const brandResult = await executeQuery('SELECT COUNT(*) as count FROM brands WHERE isActive = 1');
        if (brandResult.success) {
            console.log(`✅ Found ${brandResult.data[0].count} active brands`);
        } else {
            console.error('❌ Failed to query brands:', brandResult.error);
        }
        
        // Test a simple perfume query
        const perfumeResult = await executeQuery('SELECT * FROM perfumes WHERE isActive = 1 LIMIT 3');
        if (perfumeResult.success) {
            console.log(`✅ Sample perfumes:`, perfumeResult.data.map(p => ({
                name: p.name,
                brand: p.brand,
                gender: p.gender
            })));
        } else {
            console.error('❌ Failed to query sample perfumes:', perfumeResult.error);
        }
        
        console.log('🎉 Database test completed!');
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
    
    process.exit(0);
}

testDatabase();
