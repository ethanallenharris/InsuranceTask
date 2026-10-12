const express = require('express');
const path = require('path');
const router = express.Router();

// Dummy data for testing
const dummyUsers = [
    { first_name: 'James', last_name: 'Smith', email: 'james.smith@email.com', postcode: 'SW1A 1AA', status: 'accepted' },
    { first_name: 'Emma', last_name: 'Johnson', email: 'emma.johnson@email.com', postcode: 'M1 1AE', status: 'accepted' },
    { first_name: 'Oliver', last_name: 'Williams', email: 'oliver.williams@email.com', postcode: 'B1 1AA', status: 'accepted' },
    { first_name: 'Sophia', last_name: 'Brown', email: 'sophia.brown@email.com', postcode: 'L1 1AA', status: 'accepted' },
    { first_name: 'William', last_name: 'Jones', email: 'william.jones@email.com', postcode: 'E1 6AN', status: 'referred' },
    { first_name: 'Isabella', last_name: 'Taylor', email: 'isabella.taylor@email.com', postcode: 'G1 1AA', status: 'referred' },
    { first_name: 'Henry', last_name: 'Davies', email: 'henry.davies@email.com', postcode: 'CF10 1AA', status: 'referred' },
    { first_name: 'Mia', last_name: 'Wilson', email: 'mia.wilson@email.com', postcode: 'EH1 1AA', status: 'referred' },
    { first_name: 'George', last_name: 'Evans', email: 'george.evans@email.com', postcode: 'LS1 1AA', status: 'rejected' },
    { first_name: 'Charlotte', last_name: 'Thomas', email: 'charlotte.thomas@email.com', postcode: 'NE1 1AA', status: 'rejected' },
    { first_name: 'Jack', last_name: 'Roberts', email: 'jack.roberts@email.com', postcode: 'BS1 1AA', status: 'rejected' },
    { first_name: 'Amelia', last_name: 'Walker', email: 'amelia.walker@email.com', postcode: 'NG1 1AA', status: 'rejected' }
];

const dummyProfiles = [
    { age: 32, annual_income: 45000, employment_status: 'employed', household_size: 2, has_preexisting_conditions: 0, is_smoker: 0, region: 'London' },
    { age: 28, annual_income: 52000, employment_status: 'employed', household_size: 1, has_preexisting_conditions: 0, is_smoker: 0, region: 'North West' },
    { age: 45, annual_income: 68000, employment_status: 'self-employed', household_size: 4, has_preexisting_conditions: 0, is_smoker: 0, region: 'West Midlands' },
    { age: 35, annual_income: 41000, employment_status: 'employed', household_size: 3, has_preexisting_conditions: 0, is_smoker: 0, region: 'North West' },
    { age: 55, annual_income: 38000, employment_status: 'employed', household_size: 2, has_preexisting_conditions: 1, is_smoker: 0, region: 'London' },
    { age: 62, annual_income: 29000, employment_status: 'part-time', household_size: 1, has_preexisting_conditions: 1, is_smoker: 0, region: 'Scotland' },
    { age: 41, annual_income: 55000, employment_status: 'employed', household_size: 3, has_preexisting_conditions: 0, is_smoker: 1, region: 'Wales' },
    { age: 38, annual_income: 47000, employment_status: 'self-employed', household_size: 2, has_preexisting_conditions: 1, is_smoker: 0, region: 'Scotland' },
    { age: 67, annual_income: 22000, employment_status: 'retired', household_size: 1, has_preexisting_conditions: 1, is_smoker: 1, region: 'Yorkshire' },
    { age: 29, annual_income: 18000, employment_status: 'unemployed', household_size: 1, has_preexisting_conditions: 0, is_smoker: 1, region: 'North East' },
    { age: 71, annual_income: 19000, employment_status: 'retired', household_size: 2, has_preexisting_conditions: 1, is_smoker: 0, region: 'South West' },
    { age: 24, annual_income: 21000, employment_status: 'employed', household_size: 1, has_preexisting_conditions: 0, is_smoker: 1, region: 'East Midlands' }
];

function seedDummyData(db) {
    console.log('Seeding dummy data...');
    
    const now = new Date().toISOString();
    
    dummyUsers.forEach((user, index) => {
        // Insert user
        db.run(
            `INSERT INTO users (first_name, last_name, email, email_hash, postcode, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.first_name, user.last_name, user.email, 'hash_' + index, user.postcode, user.status, now]
        );
        
        const userId = index + 1;
        const profile = dummyProfiles[index];
        
        // Insert profile
        db.run(
            `INSERT INTO user_profiles (user_id, age, annual_income, employment_status, household_size, has_preexisting_conditions, is_smoker, region) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, profile.age, profile.annual_income, profile.employment_status, profile.household_size, profile.has_preexisting_conditions, profile.is_smoker, profile.region]
        );
    });
    
    // Save the database
    const { saveDatabase } = require('../database/connection');
    saveDatabase();
    
    console.log('Dummy data seeded successfully');
}

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
        
        // Check if users table has any data
        const countResult = db.exec('SELECT COUNT(*) as count FROM users');
        const userCount = countResult.length > 0 ? countResult[0].values[0][0] : 0;
        
        // Seed dummy data if no records exist
        if (userCount === 0) {
            seedDummyData(db);
        }
        
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
