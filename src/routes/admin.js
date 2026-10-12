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
        createdAt: '2024-01-04T14:15:00Z'
    }
];

// Valid options
const VALID_STATUSES = ['accepted', 'rejected', 'referred'];
const VALID_EMPLOYMENT_STATUSES = ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'];

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

// Helper function to safely decrypt
function safeDecrypt(encryptedText) {
    if (!encryptedText) return '';
    try {
        const { decrypt } = require('../utils/encryption');
        return decrypt(encryptedText);
    } catch (err) {
        console.error('Decryption error:', err.message);
        return '[Decryption Error]';
    }
}

// Helper function to get records from database
function getRecordsFromDatabase() {
    try {
        const { getConnection } = require('../database/connection');
        const db = getConnection();
        
        // Check if users table exists
        const tableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (tableCheck.length === 0 || tableCheck[0].values.length === 0) {
            console.log('Users table does not exist yet');
            return [];
        }
        
        // Get all users
        const usersResult = db.exec(`
            SELECT id, first_name_encrypted, last_name_encrypted, email_encrypted, 
                   postcode_encrypted, status, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        
        if (usersResult.length === 0 || usersResult[0].values.length === 0) {
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
        let profiles = {};
        try {
            const profilesResult = db.exec(`
                SELECT user_id, age, annual_income, employment_status, household_size,
                       has_preexisting_conditions, is_smoker
                FROM user_profiles
            `);
            
            if (profilesResult.length > 0 && profilesResult[0].values.length > 0) {
                const profileColumns = profilesResult[0].columns;
                profilesResult[0].values.forEach(row => {
                    const profile = {};
                    profileColumns.forEach((col, index) => {
                        profile[col] = row[index];
                    });
                    profiles[profile.user_id] = profile;
                });
            }
        } catch (err) {
            console.log('Could not fetch profiles:', err.message);
        }
        
        // Get all family members
        let familyMembers = {};
        try {
            const familyResult = db.exec(`
                SELECT id, user_id, relationship, first_name, last_name, date_of_birth,
                       has_preexisting_conditions
                FROM family_members
                ORDER BY user_id, relationship, id
            `);
            
            if (familyResult.length > 0 && familyResult[0].values.length > 0) {
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
        } catch (err) {
            console.log('Could not fetch family members:', err.message);
        }
        
        // Combine and decrypt data
        const records = users.map(user => {
            const profile = profiles[user.id] || {};
            const family = familyMembers[user.id] || [];
            
            // Decrypt user fields
            const firstName = safeDecrypt(user.first_name_encrypted);
            const lastName = safeDecrypt(user.last_name_encrypted);
            const email = safeDecrypt(user.email_encrypted);
            const postcode = safeDecrypt(user.postcode_encrypted);
            
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
    } catch (err) {
        console.error('Error in getRecordsFromDatabase:', err);
        return [];
    }
}

// Helper function to get a single record from database
function getRecordFromDatabase(id) {
    const records = getRecordsFromDatabase();
    return records.find(r => r.id === id) || null;
}

// Helper function to update family member in database
function updateFamilyMemberInDatabase(memberId, updates) {
    const { getConnection, saveDatabase } = require('../database/connection');
    const db = getConnection();
    
    const updateFields = [];
    const params = [];
    
    if (updates.firstName !== undefined) {
        updateFields.push('first_name = ?');
        params.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
        updateFields.push('last_name = ?');
        params.push(updates.lastName);
    }
    if (updates.dateOfBirth !== undefined) {
        updateFields.push('date_of_birth = ?');
        params.push(updates.dateOfBirth);
    }
    if (updates.hasPreexistingConditions !== undefined) {
        updateFields.push('has_preexisting_conditions = ?');
        params.push(updates.hasPreexistingConditions ? 1 : 0);
    }
    
    if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(memberId);
        db.run(`UPDATE family_members SET ${updateFields.join(', ')} WHERE id = ?`, params);
        saveDatabase();
    }
}

// Helper function to get family member from database
function getFamilyMemberFromDatabase(memberId) {
    const { getConnection } = require('../database/connection');
    const db = getConnection();
    
    try {
        const result = db.exec(`
            SELECT id, user_id, relationship, first_name, last_name, date_of_birth, has_preexisting_conditions
            FROM family_members
            WHERE id = ?
        `, [memberId]);
        
        if (result.length > 0 && result[0].values.length > 0) {
            const columns = result[0].columns;
            const row = result[0].values[0];
            const member = {};
            columns.forEach((col, index) => {
                member[col] = row[index];
            });
            return {
                id: member.id,
                userId: member.user_id,
                relationship: member.relationship,
                firstName: member.first_name,
                lastName: member.last_name,
                dateOfBirth: member.date_of_birth,
                hasPreexistingConditions: member.has_preexisting_conditions === 1
            };
        }
    } catch (err) {
        console.error('Error fetching family member:', err);
    }
    return null;
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
            'firstName', 'lastName', 'email', 'postcode', 'age',
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
        updateRecordInDatabase(id, updates);
        
        // Handle spouse updates
        if (updates.spouse && existingRecord.spouse) {
            const spouseChanges = {};
            const spouseFields = ['firstName', 'lastName', 'dateOfBirth', 'hasPreexistingConditions'];
            
            spouseFields.forEach(field => {
                if (updates.spouse[field] !== undefined && updates.spouse[field] !== existingRecord.spouse[field]) {
                    spouseChanges[`spouse.${field}`] = {
                        from: existingRecord.spouse[field],
                        to: updates.spouse[field]
                    };
                }
            });
            
            if (Object.keys(spouseChanges).length > 0) {
                updateFamilyMemberInDatabase(existingRecord.spouse.id, updates.spouse);
                Object.assign(changes, spouseChanges);
            }
        }
        
        // Handle children updates
        if (updates.children && existingRecord.children) {
            updates.children.forEach(updatedChild => {
                const existingChild = existingRecord.children.find(c => c.id === updatedChild.id);
                if (existingChild) {
                    const childChanges = {};
                    const childFields = ['firstName', 'lastName', 'dateOfBirth', 'hasPreexistingConditions'];
                    
                    childFields.forEach(field => {
                        if (updatedChild[field] !== undefined && updatedChild[field] !== existingChild[field]) {
                            childChanges[`child[${updatedChild.id}].${field}`] = {
                                from: existingChild[field],
                                to: updatedChild[field]
                            };
                        }
                    });
                    
                    if (Object.keys(childChanges).length > 0) {
                        updateFamilyMemberInDatabase(updatedChild.id, updatedChild);
                        Object.assign(changes, childChanges);
                    }
                }
            });
        }
        
        // Add audit log entry if there were changes
        if (Object.keys(changes).length > 0) {
            addAuditLogEntry(adminEmail, id, 'update', changes);
        }
        
        // Get the updated record
        const updatedRecord = getRecordFromDatabase(id);
        
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
