const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('../config/database');

async function initializeDatabase() {
    console.log('🚀 Starting database initialization...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('❌ Cannot connect to database. Initialization aborted.');
        process.exit(1);
    }
    
    try {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split queries by semicolon and execute them one by one
        const queries = schema.split(';').filter(query => query.trim().length > 0);
        
        console.log(`📝 Executing ${queries.length} database queries...`);
        
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i].trim();
            if (query) {
                try {
                    await pool.execute(query);
                    console.log(`✅ Query ${i + 1}/${queries.length} executed successfully`);
                } catch (error) {
                    // Ignore "already exists" errors for tables and data
                    if (!error.message.includes('already exists') && 
                        !error.message.includes('Duplicate entry')) {
                        throw error;
                    }
                    console.log(`⚠️  Query ${i + 1}/${queries.length} - ${error.message}`);
                }
            }
        }
        
        console.log('✅ Database initialization completed successfully!');
        
        // Verify tables were created
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('📊 Created tables:', tables.map(row => Object.values(row)[0]));
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase().then(() => {
        console.log('🎉 Database setup complete!');
        process.exit(0);
    }).catch(error => {
        console.error('💥 Initialization error:', error);
        process.exit(1);
    });
}

module.exports = { initializeDatabase };
