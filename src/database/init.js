const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/health_insurance.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    -- User profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER NOT NULL CHECK(age >= 18 AND age <= 120),
        annual_income REAL NOT NULL CHECK(annual_income >= 0),
        employment_status TEXT NOT NULL CHECK(employment_status IN ('Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student')),
        household_size INTEGER NOT NULL CHECK(household_size >= 1 AND household_size <= 20),
        has_preexisting_conditions INTEGER NOT NULL CHECK(has_preexisting_conditions IN (0, 1)),
        is_smoker INTEGER NOT NULL CHECK(is_smoker IN (0, 1)),
        region TEXT NOT NULL,
        has_nhs_dentist INTEGER CHECK(has_nhs_dentist IN (0, 1, NULL)),
        wants_private_dental INTEGER NOT NULL CHECK(wants_private_dental IN (0, 1)),
        wants_outpatient_cover INTEGER NOT NULL CHECK(wants_outpatient_cover IN (0, 1)),
        wants_mental_health_cover INTEGER NOT NULL CHECK(wants_mental_health_cover IN (0, 1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Eligibility results table
    CREATE TABLE IF NOT EXISTS eligibility_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL UNIQUE,
        has_preexisting_condition_restrictions INTEGER NOT NULL CHECK(has_preexisting_condition_restrictions IN (0, 1)),
        recommendation TEXT,
        estimated_monthly_budget REAL NOT NULL CHECK(estimated_monthly_budget >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    );

    -- Eligible plans for each result (many-to-many relationship)
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
    );

    -- Valid UK regions lookup table
    CREATE TABLE IF NOT EXISTS valid_regions (
        region TEXT PRIMARY KEY
    );

    -- Insert valid regions
    INSERT OR IGNORE INTO valid_regions (region) VALUES
        ('London'),
        ('South East'),
        ('South West'),
        ('East of England'),
        ('West Midlands'),
        ('East Midlands'),
        ('Yorkshire and the Humber'),
        ('North West'),
        ('North East'),
        ('Scotland'),
        ('Wales'),
        ('Northern Ireland');

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_profiles_region ON user_profiles(region);
    CREATE INDEX IF NOT EXISTS idx_profiles_age ON user_profiles(age);
    CREATE INDEX IF NOT EXISTS idx_results_profile ON eligibility_results(profile_id);
`);

console.log('Database initialized successfully at:', dbPath);

db.close();
