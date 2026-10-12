const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
const fs = require('fs');
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/health_insurance.db');
const dataDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Check if database exists, if not initialize it
if (!fs.existsSync(dbPath)) {
    console.log('Database not found, initializing...');
    require('./database/init');
}

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
    const { closeConnection } = require('./database/connection');
    closeConnection();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    const { closeConnection } = require('./database/connection');
    closeConnection();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Health Insurance Questionnaire running at http://localhost:${PORT}`);
});
