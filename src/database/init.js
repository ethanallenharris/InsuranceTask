const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/health_insurance.db');

// Dummy data for seeding
const dummyUsers = [
    { firstName: 'James', lastName: 'Smith', email: 'james.smith@email.com', postcode: 'SW1A 1AA', status: 'accepted' },
    { firstName: 'Emma', lastName: 'Johnson', email: 'emma.johnson@email.com', postcode: 'M1 1AE', status: 'accepted' },
    { firstName: 'Oliver', lastName: 'Williams', email: 'oliver.williams@email.com', postcode: 'B1 1AA', status: 'accepted' },
    { firstName: 'Sophia', lastName: 'Brown', email: 'sophia.brown@email.com', postcode: 'L1 1AA', status: 'accepted' },
    { firstName: 'William', lastName: 'Jones', email: 'william.jones@email.com', postcode: 'E1 6AN', status: 'referred' },
    { firstName: 'Isabella', lastName: 'Taylor', email: 'isabella.taylor@email.com', postcode: 'G1 1AA', status: 'referred' },
    { firstName: 'Henry', lastName: 'Davies', email: 'henry.davies@email.com', postcode: 'CF10 1AA', status: 'referred' },
    { firstName: 'Mia', lastName: 'Wilson', email: 'mia.wilson@email.com', postcode: 'EH1 1AA', status: 'referred' },
    { firstName: 'George', lastName: 'Evans', email: 'george.evans@email.com', postcode: 'LS1 1AA', status: 'rejected' },
    { firstName: 'Charlotte', lastName: 'Thomas', email: 'charlotte.thomas@email.com', postcode: 'NE1 1AA', status: 'rejected' },
    { firstName: 'Jack', lastName: 'Roberts', email: 'jack.roberts@email.com', postcode: 'BS1 1AA', status: 'rejected' },
    { firstName: 'Amelia', lastName: 'Walker', email: 'amelia.walker@email.com', postcode: 'NG1 1AA', status: 'rejected' }
];

const dummyProfiles = [
    { age: 32, annualIncome: 45000, employmentStatus: 'Employed', householdSize: 4, hasPreexistingConditions: 0, isSmoker: 0 },
    { age: 28, annualIncome: 52000, employmentStatus: 'Employed', householdSize: 1, hasPreexistingConditions: 0, isSmoker: 0 },
    { age: 45, annualIncome: 68000, employmentStatus: 'Self-employed', householdSize: 5, hasPreexistingConditions: 0, isSmoker: 0 },
    { age: 35, annualIncome: 41000, employmentStatus: 'Employed', householdSize: 3, hasPreexistingConditions: 0, isSmoker: 0 },
    { age: 55, annualIncome: 38000, employmentStatus: 'Employed', householdSize: 2, hasPreexistingConditions: 1, isSmoker: 0 },
    { age: 62, annualIncome: 29000, employmentStatus: 'Retired', householdSize: 1, hasPreexistingConditions: 1, isSmoker: 0 },
    { age: 41, annualIncome: 55000, employmentStatus: 'Employed', householdSize: 4, hasPreexistingConditions: 0, isSmoker: 1 },
    { age: 38, annualIncome: 47000, employmentStatus: 'Self-employed', householdSize: 3, hasPreexistingConditions: 1, isSmoker: 0 },
    { age: 67, annualIncome: 22000, employmentStatus: 'Retired', householdSize: 2, hasPreexistingConditions: 1, isSmoker: 1 },
    { age: 29, annualIncome: 18000, employmentStatus: 'Unemployed', householdSize: 1, hasPreexistingConditions: 0, isSmoker: 1 },
    { age: 71, annualIncome: 19000, employmentStatus: 'Retired', householdSize: 2, hasPreexistingConditions: 1, isSmoker: 0 },
    { age: 24, annualIncome: 21000, employmentStatus: 'Employed', householdSize: 1, hasPreexistingConditions: 0, isSmoker: 1 }
];

// Family members: some users have spouse, some have children, some have both, some have none
// User indices: 0, 2, 4, 6, 8, 10 will have spouse
// User indices: 0, 2, 3, 6, 7, 10 will have children
const dummyFamilyMembers = [
    // User 1 (index 0) - James Smith: spouse + 2 children
    { userIndex: 0, relationship: 'spouse', firstName: 'Sarah', lastName: 'Smith', dateOfBirth: '1990-05-15', hasPreexistingConditions: 0 },
    { userIndex: 0, relationship: 'child', firstName: 'Emily', lastName: 'Smith', dateOfBirth: '2015-03-20', hasPreexistingConditions: 0 },
    { userIndex: 0, relationship: 'child', firstName: 'Thomas', lastName: 'Smith', dateOfBirth: '2018-07-10', hasPreexistingConditions: 0 },
    
    // User 3 (index 2) - Oliver Williams: spouse + 3 children
    { userIndex: 2, relationship: 'spouse', firstName: 'Rachel', lastName: 'Williams', dateOfBirth: '1980-11-22', hasPreexistingConditions: 0 },
    { userIndex: 2, relationship: 'child', firstName: 'Daniel', lastName: 'Williams', dateOfBirth: '2008-01-15', hasPreexistingConditions: 0 },
    { userIndex: 2, relationship: 'child', firstName: 'Sophie', lastName: 'Williams', dateOfBirth: '2010-09-03', hasPreexistingConditions: 1 },
    { userIndex: 2, relationship: 'child', firstName: 'Lucas', lastName: 'Williams', dateOfBirth: '2014-12-28', hasPreexistingConditions: 0 },
    
    // User 4 (index 3) - Sophia Brown: 2 children (no spouse - single parent)
    { userIndex: 3, relationship: 'child', firstName: 'Olivia', lastName: 'Brown', dateOfBirth: '2012-06-18', hasPreexistingConditions: 0 },
    { userIndex: 3, relationship: 'child', firstName: 'Noah', lastName: 'Brown', dateOfBirth: '2016-02-25', hasPreexistingConditions: 0 },
    
    // User 5 (index 4) - William Jones: spouse only (no children)
    { userIndex: 4, relationship: 'spouse', firstName: 'Margaret', lastName: 'Jones', dateOfBirth: '1970-08-30', hasPreexistingConditions: 1 },
    
    // User 7 (index 6) - Henry Davies: spouse + 2 children
    { userIndex: 6, relationship: 'spouse', firstName: 'Catherine', lastName: 'Davies', dateOfBirth: '1985-04-12', hasPreexistingConditions: 0 },
    { userIndex: 6, relationship: 'child', firstName: 'Grace', lastName: 'Davies', dateOfBirth: '2013-10-05', hasPreexistingConditions: 0 },
    { userIndex: 6, relationship: 'child', firstName: 'Harry', lastName: 'Davies', dateOfBirth: '2017-03-17', hasPreexistingConditions: 0 },
    
    // User 8 (index 7) - Mia Wilson: 1 child (no spouse - single parent)
    { userIndex: 7, relationship: 'child', firstName: 'Lily', lastName: 'Wilson', dateOfBirth: '2019-08-22', hasPreexistingConditions: 0 },
    
    // User 9 (index 8) - George Evans: spouse only (no children - elderly couple)
    { userIndex: 8, relationship: 'spouse', firstName: 'Dorothy', lastName: 'Evans', dateOfBirth: '1958-12-01', hasPreexistingConditions: 1 },
    
    // User 11 (index 10) - Jack Roberts: spouse only (no children - elderly couple)
    { userIndex: 10, relationship: 'spouse', firstName: 'Patricia', lastName: 'Roberts', dateOfBirth: '1955-07-19', hasPreexistingConditions: 0 }
];

async function initializeDatabase() {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create users table with encrypted fields
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name_encrypted TEXT NOT NULL,
            last_name_encrypted TEXT NOT NULL,
            email_encrypted TEXT NOT NULL,
            email_hash TEXT NOT NULL UNIQUE,
            postcode_encrypted TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'referred' CHECK(status IN ('accepted', 'rejected', 'referred')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create user_profiles table (without region column)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            age INTEGER NOT NULL CHECK(age >= 18 AND age <= 120),
            annual_income REAL NOT NULL CHECK(annual_income >= 0),
            employment_status TEXT NOT NULL CHECK(employment_status IN ('Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student')),
            household_size INTEGER NOT NULL CHECK(household_size >= 1 AND household_size <= 20),
            has_preexisting_conditions INTEGER NOT NULL CHECK(has_preexisting_conditions IN (0, 1)),
            is_smoker INTEGER NOT NULL CHECK(is_smoker IN (0, 1)),
            has_nhs_dentist INTEGER CHECK(has_nhs_dentist IN (0, 1, NULL)),
            wants_private_dental INTEGER NOT NULL CHECK(wants_private_dental IN (0, 1)),
            wants_outpatient_cover INTEGER NOT NULL CHECK(wants_outpatient_cover IN (0, 1)),
            wants_mental_health_cover INTEGER NOT NULL CHECK(wants_mental_health_cover IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create family_members table with encrypted fields
    db.run(`
        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            relationship TEXT NOT NULL CHECK(relationship IN ('spouse', 'child')),
            first_name_encrypted TEXT NOT NULL,
            last_name_encrypted TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            has_preexisting_conditions INTEGER NOT NULL DEFAULT 0 CHECK(has_preexisting_conditions IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS eligibility_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL UNIQUE,
            has_preexisting_condition_restrictions INTEGER NOT NULL CHECK(has_preexisting_condition_restrictions IN (0, 1)),
            recommendation TEXT,
            estimated_monthly_budget REAL NOT NULL CHECK(estimated_monthly_budget >= 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS result_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            result_id INTEGER NOT NULL,
            plan_id TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            plan_type TEXT NOT NULL,
            monthly_premium REAL NOT NULL,
            deductible REAL NOT NULL,
            coverage_level TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (result_id) REFERENCES eligibility_results(id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users(email_hash)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_profiles_age ON user_profiles(age)');
    db.run('CREATE INDEX IF NOT EXISTS idx_results_profile ON eligibility_results(profile_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_family_user ON family_members(user_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_family_relationship ON family_members(relationship)');

    // Seed dummy data
    console.log('Seeding dummy data...');
    
    const { encrypt, hashEmail } = require('../utils/encryption');
    
    // Insert users and profiles
    for (let i = 0; i < dummyUsers.length; i++) {
        const user = dummyUsers[i];
        const profile = dummyProfiles[i];
        
        // Insert user with encrypted fields
        db.run(`
            INSERT INTO users (first_name_encrypted, last_name_encrypted, email_encrypted, email_hash, postcode_encrypted, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            encrypt(user.firstName),
            encrypt(user.lastName),
            encrypt(user.email),
            hashEmail(user.email),
            encrypt(user.postcode),
            user.status
        ]);
        
        const userId = i + 1; // SQLite AUTOINCREMENT starts at 1
        
        // Insert profile
        db.run(`
            INSERT INTO user_profiles (user_id, age, annual_income, employment_status, household_size, has_preexisting_conditions, is_smoker, wants_private_dental, wants_outpatient_cover, wants_mental_health_cover)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            userId,
            profile.age,
            profile.annualIncome,
            profile.employmentStatus,
            profile.householdSize,
            profile.hasPreexistingConditions,
            profile.isSmoker,
            0, // wants_private_dental
            0, // wants_outpatient_cover
            0  // wants_mental_health_cover
        ]);
    }
    
    // Insert family members with encrypted fields
    for (const member of dummyFamilyMembers) {
        const userId = member.userIndex + 1; // Convert index to user ID
        
        db.run(`
            INSERT INTO family_members (user_id, relationship, first_name_encrypted, last_name_encrypted, date_of_birth, has_preexisting_conditions)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            userId,
            member.relationship,
            encrypt(member.firstName),
            encrypt(member.lastName),
            member.dateOfBirth,
            member.hasPreexistingConditions
        ]);
    }
    
    console.log('Dummy data seeded successfully:');
    console.log(`  - ${dummyUsers.length} users with profiles`);
    console.log(`  - ${dummyFamilyMembers.length} family members`);

    // Save to file
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);

    console.log('Database initialized successfully at:', dbPath);

    db.close();
}

initializeDatabase().catch(console.error);
