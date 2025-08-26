const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // For development - use proper certificates in production
    },
    connectTimeout: 20000,
    acquireTimeout: 20000,
    connectionLimit: 10
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Database test query successful:', rows[0]);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return { success: true, data: rows };
    } catch (error) {
        console.error('Database query error:', error.message);
        return { success: false, error: error.message };
    }
}

// Execute transaction
async function executeTransaction(queries) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return { success: true, data: results };
    } catch (error) {
        await connection.rollback();
        console.error('Transaction error:', error.message);
        return { success: false, error: error.message };
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeTransaction
};
