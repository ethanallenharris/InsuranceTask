const express = require('express');
const path = require('path');
const router = express.Router();
const { decrypt } = require('../utils/encryption');

// Audit log storage
let auditLog = [];

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

// Helper function to get records from database
function getRecordsFromDatabase() {
    const { getConnection } = require('../database/connection');
    const db = getConnection();
    
    // Get all users
    const usersResult = db.exec(`
        SELECT id, first_name_encrypted, last_name_encrypted, email_encrypted, 
               postcode_encrypted, status, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    `);
    
    if (usersResult.length === 0) {
        return [];
    }
    
    const userColumns = usersResult[0].columns;
    const users = usersResult[0].values.map(row => {
        const user = {};
        userColumns.forEach((col, index) => {
            user[col] = row[index];
        });
        return user;
    });
    
    // Get all profiles
    const profilesResult = db.exec(`
        SELECT user_id, age, annual_income, employment_status, household_size,
               has_preexisting_conditions, is_smoker, region
        FROM user_profiles
    `);
    
    const profiles = {};
    if (profilesResult.length > 0) {
        const profileColumns = profilesResult[0].columns;
        profilesResult[0].values.forEach(row => {
            const profile = {};
            profileColumns.forEach((col, index) => {
                profile[col] = row[index];
            });
            profiles[profile.user_id] = profile;
        });
    }
    
    // Get all family members
    const familyResult = db.exec(`
        SELECT id, user_id, relationship, first_name, last_name, date_of_birth,
               has_preexisting_conditions
        FROM family_members
        ORDER BY user_id, relationship, id
    `);
    
    const familyMembers = {};
    if (familyResult.length > 0) {
        const familyColumns = familyResult[0].columns;
        familyResult[0].values.forEach(row => {
            const member = {};
            familyColumns.forEach((col, index) => {
                member[col] = row[index];
            });
            if (!familyMembers[member.user_id]) {
                familyMembers[member.user_id] = [];
            }
            familyMembers[member.user_id].push(member);
        });
    }
    
    // Combine and decrypt data
    const records = users.map(user => {
        const profile = profiles[user.id] || {};
        const family = familyMembers[user.id] || [];
        
        // Decrypt user fields
        let firstName, lastName, email, postcode;
        try {
            firstName = decrypt(user.first_name_encrypted);
            lastName = decrypt(user.last_name_encrypted);
            email = decrypt(user.email_encrypted);
            postcode = decrypt(user.postcode_encrypted);
        } catch (err) {
            console.error('Error decrypting user data for id:', user.id, err);
            firstName = '[Decryption Error]';
            lastName = '';
            email = '';
            postcode = '';
        }
        
        // Process family members
        const spouse = family.find(m => m.relationship === 'spouse');
        const children = family.filter(m => m.relationship === 'child');
        
        return {
            id: user.id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            postcode: postcode,
            status: user.status,
            age: profile.age || null,
            annualIncome: profile.annual_income || null,
            employmentStatus: profile.employment_status || null,
            householdSize: profile.household_size || null,
            hasPreexistingConditions: profile.has_preexisting_conditions === 1,
            isSmoker: profile.is_smoker === 1,
            region: profile.region || null,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            spouse: spouse ? {
                id: spouse.id,
                firstName: spouse.first_name,
                lastName: spouse.last_name,
                dateOfBirth: spouse.date_of_birth,
                hasPreexistingConditions: spouse.has_preexisting_conditions === 1
            } : null,
            children: children.map(child => ({
                id: child.id,
                firstName: child.first_name,
                lastName: child.last_name,
                dateOfBirth: child.date_of_birth,
                hasPreexistingConditions: child.has_preexisting_conditions === 1
            }))
        };
    });
    
    return records;
}

// Helper function to get a single record from database
function getRecordFromDatabase(id) {
    const records = getRecordsFromDatabase();
    return records.find(r => r.id === id) || null;
}

// Helper function to update record in database
function updateRecordInDatabase(id, updates) {
    const { getConnection, saveDatabase } = require('../database/connection');
    const { encrypt, hashEmail } = require('../utils/encryption');
    const db = getConnection();
    
    // Update users table
    const userUpdates = [];
    const userParams = [];
    
    if (updates.firstName !== undefined) {
        userUpdates.push('first_name_encrypted = ?');
        userParams.push(encrypt(updates.firstName));
    }
    if (updates.lastName !== undefined) {
        userUpdates.push('last_name_encrypted = ?');
        userParams.push(encrypt(updates.lastName));
    }
    if (updates.email !== undefined) {
        userUpdates.push('email_encrypted = ?');
        userParams.push(encrypt(updates.email));
        userUpdates.push('email_hash = ?');
        userParams.push(hashEmail(updates.email));
    }
    if (updates.postcode !== undefined) {
        userUpdates.push('postcode_encrypted = ?');
        userParams.push(encrypt(updates.postcode));
    }
    if (updates.status !== undefined) {
        userUpdates.push('status = ?');
        userParams.push(updates.status);
    }
    
    if (userUpdates.length > 0) {
        userUpdates.push('updated_at = CURRENT_TIMESTAMP');
        userParams.push(id);
        db.run(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userParams);
    }
    
    // Update user_profiles table
    const profileUpdates = [];
    const profileParams = [];
    
    if (updates.age !== undefined) {
        profileUpdates.push('age = ?');
        profileParams.push(updates.age);
    }
    if (updates.annualIncome !== undefined) {
        profileUpdates.push('annual_income = ?');
        profileParams.push(updates.annualIncome);
    }
    if (updates.employmentStatus !== undefined) {
        profileUpdates.push('employment_status = ?');
        profileParams.push(updates.employmentStatus);
    }
    if (updates.householdSize !== undefined) {
        profileUpdates.push('household_size = ?');
        profileParams.push(updates.householdSize);
    }
    if (updates.hasPreexistingConditions !== undefined) {
        profileUpdates.push('has_preexisting_conditions = ?');
        profileParams.push(updates.hasPreexistingConditions ? 1 : 0);
    }
    if (updates.isSmoker !== undefined) {
        profileUpdates.push('is_smoker = ?');
        profileParams.push(updates.isSmoker ? 1 : 0);
    }
    if (updates.region !== undefined) {
        profileUpdates.push('region = ?');
        profileParams.push(updates.region);
    }
    
    if (profileUpdates.length > 0) {
        profileUpdates.push('updated_at = CURRENT_TIMESTAMP');
        profileParams.push(id);
        db.run(`UPDATE user_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?`, profileParams);
    }
    
    saveDatabase();
    
    return getRecordFromDatabase(id);
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
        const records = getRecordsFromDatabase();
        res.json({ records });
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Failed to fetch records', details: error.message });
    }
});

// API endpoint to get a single record by ID
router.get('/api/records/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const record = getRecordFromDatabase(id);
        
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
        
        // Check if record exists
        const existingRecord = getRecordFromDatabase(id);
        if (!existingRecord) {
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
            if (updates[field] !== undefined && updates[field] !== existingRecord[field]) {
                changes[field] = {
                    from: existingRecord[field],
                    to: updates[field]
                };
            }
        });
        
        // Update the record in database
        const updatedRecord = updateRecordInDatabase(id, updates);
        
        // Add audit log entry if there were changes
        if (Object.keys(changes).length > 0) {
            addAuditLogEntry(adminEmail, id, 'update', changes);
        }
        
        res.json({ 
            success: true, 
            record: updatedRecord 
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
