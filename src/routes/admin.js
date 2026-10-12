const express = require('express');
const path = require('path');
const router = express.Router();

// Serve admin login page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Serve admin dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

// API endpoint to get all submitted records
router.get('/api/records', (req, res) => {
    try {
        const { getConnection } = require('../database/connection');
        const db = getConnection();
        
        // Query to get users with their profiles
        const result = db.exec(`
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.postcode,
                u.status,
                u.created_at,
                p.age,
                p.annual_income,
                p.employment_status,
                p.household_size,
                p.has_preexisting_conditions,
                p.is_smoker,
                p.region
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            ORDER BY u.created_at DESC
        `);
        
        if (result.length === 0) {
            return res.json({ records: [] });
        }
        
        const columns = result[0].columns;
        const records = result[0].values.map(row => {
            const record = {};
            columns.forEach((col, index) => {
                record[col] = row[index];
            });
            return record;
        });
        
        res.json({ records });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

module.exports = router;
