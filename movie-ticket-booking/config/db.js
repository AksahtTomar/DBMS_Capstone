const mysql = require('mysql2/promise');
require('dotenv').config();

// Detect serverless environment without cloud database
const isVercelWithoutCloudDb = Boolean(
    process.env.VERCEL &&
    !process.env.DATABASE_URL &&
    (!process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1')
);

// Determine SSL requirement (Required for cloud MySQL like TiDB, Aiven, PlanetScale, Railway)
const isCloudDb = process.env.DB_SSL === 'true' || 
                  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

let pool = null;
let dbConnected = false;

if (!isVercelWithoutCloudDb) {
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

    pool = mysql.createPool(poolConfig);

    // Initial connection verification
    (async () => {
        try {
            const connection = await pool.getConnection();
            dbConnected = true;
            console.log(`🔌 [MySQL Pool Connected] Successfully connected to database "${process.env.DB_NAME || 'movie_ticket_booking'}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
            connection.release();
        } catch (err) {
            dbConnected = false;
            console.warn(`⚠️ [MySQL Unavailable] Local/remote MySQL unreachable (${err.message}). Seed fallback mode enabled.`);
        }
    })();
} else {
    console.log('⚡ [CinePass Vercel Mode] Running with fast In-Memory Seed Store (no cloud MySQL configured).');
}

// Attach helper functions directly to pool export for backward compatibility
if (!pool) {
    // Provide a dummy pool so requiring controllers don't crash
    pool = {
        query: async () => { throw new Error('DATABASE_OFFLINE'); },
        getConnection: async () => { throw new Error('DATABASE_OFFLINE'); }
    };
}

pool.isDbAvailable = () => dbConnected && !isVercelWithoutCloudDb;
pool.isVercelFallback = () => isVercelWithoutCloudDb;

module.exports = pool;
