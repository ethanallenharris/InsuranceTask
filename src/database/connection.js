const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/health_insurance.db');

let db = null;
let SQL = null;

/**
 * Initialize SQL.js and load or create database
 * @returns {Promise<Database>}
 */
async function initDatabase() {
    if (db) return db;
    
    SQL = await initSqlJs();
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    return db;
}

/**
 * Get database connection (must call initDatabase first)
 * @returns {Database}
 */
function getConnection() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Save database to file
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

/**
 * Close database connection
 */
function closeConnection() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    getConnection,
    saveDatabase,
    closeConnection
};
