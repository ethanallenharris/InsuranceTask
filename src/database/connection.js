const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/health_insurance.db');

let db = null;

/**
 * Get database connection (singleton)
 * @returns {Database}
 */
function getConnection() {
    if (!db) {
        db = new Database(dbPath);
        db.pragma('foreign_keys = ON');
    }
    return db;
}

/**
 * Close database connection
 */
function closeConnection() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    getConnection,
    closeConnection
};
