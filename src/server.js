require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    // Initialize database
    const { initDatabase, closeConnection, getConnection } = require('./database/connection');
    
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/health_insurance.db');
    
    // Check if database exists, if not initialize it
    if (!fs.existsSync(dbPath)) {
        console.log('Database not found, initializing...');
        await require('./database/init');
        // Wait a moment for init to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Initialize database connection
    await initDatabase();
    
    // Check if database has the required tables (schema migration check)
    const db = getConnection();
    const usersTableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    const familyTableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='family_members'");
    
    const needsReinit = (usersTableCheck.length === 0 || usersTableCheck[0].values.length === 0) ||
                        (familyTableCheck.length === 0 || familyTableCheck[0].values.length === 0);
    
    if (needsReinit) {
        console.log('Database schema outdated or missing tables, reinitializing...');
        closeConnection();
        
        // Delete old database
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
        
        // Reinitialize
        await require('./database/init');
        await new Promise(resolve => setTimeout(resolve, 100));
        await initDatabase();
    }
    
    // Now load routes (after database is ready)
    const apiRoutes = require('./routes/api');
    const adminRoutes = require('./routes/admin');

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/api', apiRoutes);
    app.use('/admin', adminRoutes);

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down gracefully...');
        closeConnection();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\nShutting down gracefully...');
        closeConnection();
        process.exit(0);
    });

    app.listen(PORT, () => {
        console.log(`Health Insurance Questionnaire running at http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
