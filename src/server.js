const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    // Initialize database
    const { initDatabase, closeConnection } = require('./database/connection');
    
    const fs = require('fs');
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
    
    // Now load routes (after database is ready)
    const apiRoutes = require('./routes/api');

    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/api', apiRoutes);

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
