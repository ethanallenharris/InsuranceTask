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
        
        // First, check what tables exist
        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Available tables:', tablesResult.length > 0 ? tablesResult[0].values : 'none');
        
        // Try to get users first
        const usersResult = db.exec('SELECT * FROM users ORDER BY created_at DESC');
        
        if (usersResult.length === 0) {
            return res.json({ records: [] });
        }
        
        const columns = usersResult[0].columns;
        const records = usersResult[0].values.map(row => {
            const record = {};
            columns.forEach((col, index) => {
                record[col] = row[index];
            });
            return record;
        });
        
        // Try to get profiles and join them if the table exists
        try {
            const profilesResult = db.exec('SELECT * FROM user_profiles');
            if (profilesResult.length > 0) {
                const profileColumns = profilesResult[0].columns;
                const profiles = profilesResult[0].values.map(row => {
                    const profile = {};
                    profileColumns.forEach((col, index) => {
                        profile[col] = row[index];
                    });
                    return profile;
                });
                
                // Join profiles to records
                records.forEach(record => {
                    const profile = profiles.find(p => p.user_id === record.id);
                    if (profile) {
                        record.age = profile.age;
                        record.annual_income = profile.annual_income;
                        record.employment_status = profile.employment_status;
                        record.household_size = profile.household_size;
                        record.has_preexisting_conditions = profile.has_preexisting_conditions;
                        record.is_smoker = profile.is_smoker;
                        record.region = profile.region;
                    }
                });
            }
        } catch (profileError) {
            console.log('Could not fetch profiles:', profileError.message);
        }
        
        res.json({ records });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

module.exports = router;
