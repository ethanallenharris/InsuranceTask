const express = require('express');
const path = require('path');
const router = express.Router();

// Dummy data for testing - kept separate from main database
const dummyRecords = [
    { 
        id: 1,
        firstName: 'James', 
        lastName: 'Smith', 
        email: 'james.smith@email.com', 
        postcode: 'SW1A 1AA', 
        status: 'accepted',
        age: 32, 
        annualIncome: 45000, 
        employmentStatus: 'Employed', 
        householdSize: 2, 
        hasPreexistingConditions: false, 
        isSmoker: false, 
        region: 'London',
        createdAt: '2024-01-15T10:30:00Z'
    },
    { 
        id: 2,
        firstName: 'Emma', 
        lastName: 'Johnson', 
        email: 'emma.johnson@email.com', 
        postcode: 'M1 1AE', 
        status: 'accepted',
        age: 28, 
        annualIncome: 52000, 
        employmentStatus: 'Employed', 
        householdSize: 1, 
        hasPreexistingConditions: false, 
        isSmoker: false, 
        region: 'North West',
        createdAt: '2024-01-14T14:20:00Z'
    },
    { 
        id: 3,
        firstName: 'Oliver', 
        lastName: 'Williams', 
        email: 'oliver.williams@email.com', 
        postcode: 'B1 1AA', 
        status: 'accepted',
        age: 45, 
        annualIncome: 68000, 
        employmentStatus: 'Self-employed', 
        householdSize: 4, 
        hasPreexistingConditions: false, 
        isSmoker: false, 
        region: 'West Midlands',
        createdAt: '2024-01-13T09:15:00Z'
    },
    { 
        id: 4,
        firstName: 'Sophia', 
        lastName: 'Brown', 
        email: 'sophia.brown@email.com', 
        postcode: 'L1 1AA', 
        status: 'accepted',
        age: 35, 
        annualIncome: 41000, 
        employmentStatus: 'Employed', 
        householdSize: 3, 
        hasPreexistingConditions: false, 
        isSmoker: false, 
        region: 'North West',
        createdAt: '2024-01-12T16:45:00Z'
    },
    { 
        id: 5,
        firstName: 'William', 
        lastName: 'Jones', 
        email: 'william.jones@email.com', 
        postcode: 'E1 6AN', 
        status: 'referred',
        age: 55, 
        annualIncome: 38000, 
        employmentStatus: 'Employed', 
        householdSize: 2, 
        hasPreexistingConditions: true, 
        isSmoker: false, 
        region: 'London',
        createdAt: '2024-01-11T11:00:00Z'
    },
    { 
        id: 6,
        firstName: 'Isabella', 
        lastName: 'Taylor', 
        email: 'isabella.taylor@email.com', 
        postcode: 'G1 1AA', 
        status: 'referred',
        age: 62, 
        annualIncome: 29000, 
        employmentStatus: 'Retired', 
        householdSize: 1, 
        hasPreexistingConditions: true, 
        isSmoker: false, 
        region: 'Scotland',
        createdAt: '2024-01-10T13:30:00Z'
    },
    { 
        id: 7,
        firstName: 'Henry', 
        lastName: 'Davies', 
        email: 'henry.davies@email.com', 
        postcode: 'CF10 1AA', 
        status: 'referred',
        age: 41, 
        annualIncome: 55000, 
        employmentStatus: 'Employed', 
        householdSize: 3, 
        hasPreexistingConditions: false, 
        isSmoker: true, 
        region: 'Wales',
        createdAt: '2024-01-09T08:45:00Z'
    },
    { 
        id: 8,
        firstName: 'Mia', 
        lastName: 'Wilson', 
        email: 'mia.wilson@email.com', 
        postcode: 'EH1 1AA', 
        status: 'referred',
        age: 38, 
        annualIncome: 47000, 
        employmentStatus: 'Self-employed', 
        householdSize: 2, 
        hasPreexistingConditions: true, 
        isSmoker: false, 
        region: 'Scotland',
        createdAt: '2024-01-08T15:20:00Z'
    },
    { 
        id: 9,
        firstName: 'George', 
        lastName: 'Evans', 
        email: 'george.evans@email.com', 
        postcode: 'LS1 1AA', 
        status: 'rejected',
        age: 67, 
        annualIncome: 22000, 
        employmentStatus: 'Retired', 
        householdSize: 1, 
        hasPreexistingConditions: true, 
        isSmoker: true, 
        region: 'Yorkshire and the Humber',
        createdAt: '2024-01-07T10:10:00Z'
    },
    { 
        id: 10,
        firstName: 'Charlotte', 
        lastName: 'Thomas', 
        email: 'charlotte.thomas@email.com', 
        postcode: 'NE1 1AA', 
        status: 'rejected',
        age: 29, 
        annualIncome: 18000, 
        employmentStatus: 'Unemployed', 
        householdSize: 1, 
        hasPreexistingConditions: false, 
        isSmoker: true, 
        region: 'North East',
        createdAt: '2024-01-06T12:00:00Z'
    },
    { 
        id: 11,
        firstName: 'Jack', 
        lastName: 'Roberts', 
        email: 'jack.roberts@email.com', 
        postcode: 'BS1 1AA', 
        status: 'rejected',
        age: 71, 
        annualIncome: 19000, 
        employmentStatus: 'Retired', 
        householdSize: 2, 
        hasPreexistingConditions: true, 
        isSmoker: false, 
        region: 'South West',
        createdAt: '2024-01-05T09:30:00Z'
    },
    { 
        id: 12,
        firstName: 'Amelia', 
        lastName: 'Walker', 
        email: 'amelia.walker@email.com', 
        postcode: 'NG1 1AA', 
        status: 'rejected',
        age: 24, 
        annualIncome: 21000, 
        employmentStatus: 'Employed', 
        householdSize: 1, 
        hasPreexistingConditions: false, 
        isSmoker: true, 
        region: 'East Midlands',
        createdAt: '2024-01-04T14:15:00Z'
    }
];

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
        // Return dummy data - kept separate from encrypted user database
        // TODO: Integrate with actual database when admin decryption is implemented
        res.json({ records: dummyRecords });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

module.exports = router;
