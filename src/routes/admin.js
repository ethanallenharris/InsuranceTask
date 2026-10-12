const express = require('express');
const path = require('path');
const router = express.Router();

// Audit log storage
let auditLog = [];

// Dummy data for testing - kept separate from main database
// Using let so we can modify the records
let dummyRecords = [
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

// Valid options
const VALID_STATUSES = ['accepted', 'rejected', 'referred'];
const VALID_EMPLOYMENT_STATUSES = ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'];
const VALID_REGIONS = [
    'London', 'South East', 'South West', 'East of England',
    'West Midlands', 'East Midlands', 'Yorkshire and the Humber',
    'North West', 'North East', 'Scotland', 'Wales', 'Northern Ireland'
];

// Helper function to add audit log entry
function addAuditLogEntry(adminEmail, recordId, action, changes) {
    auditLog.unshift({
        id: auditLog.length + 1,
        adminEmail: adminEmail,
        recordId: recordId,
        action: action,
        changes: changes,
        timestamp: new Date().toISOString()
    });
}

// Serve admin login page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// Serve admin dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

// Serve admin record detail page
router.get('/record', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/record.html'));
});

// API endpoint to get all submitted records
router.get('/api/records', (req, res) => {
    try {
        res.json({ records: dummyRecords });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

// API endpoint to get a single record by ID
router.get('/api/records/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const record = dummyRecords.find(r => r.id === id);
        
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        res.json({ record });
    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({ error: 'Failed to fetch record', details: error.message });
    }
});

// API endpoint to update a record
router.put('/api/records/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;
        const adminEmail = req.headers['x-admin-email'] || 'unknown';
        
        // Find the record
        const recordIndex = dummyRecords.findIndex(r => r.id === id);
        
        if (recordIndex === -1) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        // Validate status if provided
        if (updates.status && !VALID_STATUSES.includes(updates.status)) {
            return res.status(400).json({ 
                error: 'Invalid status', 
                validStatuses: VALID_STATUSES 
            });
        }
        
        // Validate employment status if provided
        if (updates.employmentStatus && !VALID_EMPLOYMENT_STATUSES.includes(updates.employmentStatus)) {
            return res.status(400).json({ 
                error: 'Invalid employment status', 
                validEmploymentStatuses: VALID_EMPLOYMENT_STATUSES 
            });
        }
        
        // Validate region if provided
        if (updates.region && !VALID_REGIONS.includes(updates.region)) {
            return res.status(400).json({ 
                error: 'Invalid region', 
                validRegions: VALID_REGIONS 
            });
        }
        
        // Validate age if provided
        if (updates.age !== undefined && updates.age !== null) {
            const age = parseInt(updates.age);
            if (isNaN(age) || age < 18 || age > 120) {
                return res.status(400).json({ 
                    error: 'Invalid age. Must be between 18 and 120.' 
                });
            }
            updates.age = age;
        }
        
        // Validate annual income if provided
        if (updates.annualIncome !== undefined && updates.annualIncome !== null) {
            const income = parseFloat(updates.annualIncome);
            if (isNaN(income) || income < 0) {
                return res.status(400).json({ 
                    error: 'Invalid annual income. Must be a positive number.' 
                });
            }
            updates.annualIncome = income;
        }
        
        // Validate household size if provided
        if (updates.householdSize !== undefined && updates.householdSize !== null) {
            const size = parseInt(updates.householdSize);
            if (isNaN(size) || size < 1 || size > 20) {
                return res.status(400).json({ 
                    error: 'Invalid household size. Must be between 1 and 20.' 
                });
            }
            updates.householdSize = size;
        }
        
        // Track changes for audit log
        const allowedFields = [
            'firstName', 'lastName', 'email', 'postcode', 'age', 'region',
            'annualIncome', 'employmentStatus', 'householdSize',
            'hasPreexistingConditions', 'isSmoker', 'status'
        ];
        
        const changes = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined && updates[field] !== dummyRecords[recordIndex][field]) {
                changes[field] = {
                    from: dummyRecords[recordIndex][field],
                    to: updates[field]
                };
                dummyRecords[recordIndex][field] = updates[field];
            }
        });
        
        // Update timestamp
        dummyRecords[recordIndex].updatedAt = new Date().toISOString();
        
        // Add audit log entry if there were changes
        if (Object.keys(changes).length > 0) {
            addAuditLogEntry(adminEmail, id, 'update', changes);
        }
        
        res.json({ 
            success: true, 
            record: dummyRecords[recordIndex] 
        });
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Failed to update record', details: error.message });
    }
});

// API endpoint to get audit log
router.get('/api/audit-log', (req, res) => {
    try {
        res.json({ entries: auditLog });
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ error: 'Failed to fetch audit log', details: error.message });
    }
});

module.exports = router;
