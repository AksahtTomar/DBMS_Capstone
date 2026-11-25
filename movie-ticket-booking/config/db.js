const mysql = require('mysql2/promise');
require('dotenv').config();

// Determine SSL requirement (Required for cloud MySQL like TiDB, Aiven, PlanetScale, Railway)
const isCloudDb = process.env.DB_SSL === 'true' || 
                  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

// Create a MySQL connection pool supporting both local and cloud MySQL
const poolConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        dateStrings: true
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'movie_ticket_booking',
        ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        dateStrings: true
    };

const pool = mysql.createPool(poolConfig);

// Test the database connection pool on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`🔌 [MySQL Pool Connected] Successfully connected to database "${process.env.DB_NAME || 'movie_ticket_booking'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
        connection.release();
        return true;
    } catch (err) {
        console.error('\n❌ [MySQL Connection Failed] Could not establish connection to MySQL database:');
        console.error(`   Host:     ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
        console.error(`   User:     ${process.env.DB_USER || 'root'}`);
        console.error(`   Database: ${process.env.DB_NAME || 'movie_ticket_booking'}`);
        console.error(`   Error:    ${err.message}\n`);
        console.error('👉 Quick Setup Checklist:');
        console.error('   1. Ensure the MySQL Windows service (MySQL80) is running.');
        console.error('   2. Set your MySQL root password in the ".env" file (DB_PASSWORD=your_actual_password).');
        console.error('   3. Run "database/schema.sql" and "database/seed.sql" in MySQL Workbench or run "npm run init-db".\n');
        return false;
    }
}

// Perform health check on initial require
testConnection();

module.exports = pool;
