const { getConnection, saveDatabase } = require('../database/connection');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const EligibilityResult = require('../models/EligibilityResult');
const InsurancePlan = require('../models/InsurancePlan');
const { encrypt, decrypt, hashEmail } = require('../utils/encryption');

/**
 * SQL-based repository for persistent storage
 */
class SQLRepository {
    constructor() {
        this.db = getConnection();
    }

    /**
     * Save a user to the database with encrypted fields
     * @param {User} user
     * @returns {number} The user ID
     */
    saveUser(user) {
        const stmt = this.db.prepare(`
            INSERT INTO users (
                first_name_encrypted, last_name_encrypted, 
                email_encrypted, email_hash, postcode_encrypted
            ) VALUES (?, ?, ?, ?, ?)
        `);

        const emailHash = hashEmail(user.email);

        stmt.run([
            encrypt(user.firstName),
            encrypt(user.lastName),
            encrypt(user.email),
            emailHash,
            encrypt(user.postcode)
        ]);

        stmt.free();

        // Get the last inserted ID
        const result = this.db.exec('SELECT last_insert_rowid() as id');
        const userId = result[0].values[0][0];
        
        user.id = userId;
        
        // Save to file
        saveDatabase();
        
        return userId;
    }

    /**
     * Get a user by ID with decrypted fields
     * @param {number} userId
     * @returns {User|null}
     */
    getUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        stmt.bind([userId]);

        if (!stmt.step()) {
            stmt.free();
            return null;
        }

        const row = stmt.getAsObject();
        stmt.free();

        return new User({
            id: row.id,
            firstName: decrypt(row.first_name_encrypted),
            lastName: decrypt(row.last_name_encrypted),
            email: decrypt(row.email_encrypted),
            postcode: decrypt(row.postcode_encrypted)
        });
    }

    /**
     * Check if email already exists
     * @param {string} email
     * @returns {boolean}
     */
    emailExists(email) {
        const emailHash = hashEmail(email);
        const stmt = this.db.prepare('SELECT 1 FROM users WHERE email_hash = ?');
        stmt.bind([emailHash]);
        const exists = stmt.step();
        stmt.free();
        return exists;
    }

    /**
     * Get user by email
     * @param {string} email
     * @returns {User|null}
     */
    getUserByEmail(email) {
        const emailHash = hashEmail(email);
        const stmt = this.db.prepare('SELECT * FROM users WHERE email_hash = ?');
        stmt.bind([emailHash]);

        if (!stmt.step()) {
            stmt.free();
            return null;
        }

        const row = stmt.getAsObject();
        stmt.free();

        return new User({
            id: row.id,
            firstName: decrypt(row.first_name_encrypted),
            lastName: decrypt(row.last_name_encrypted),
            email: decrypt(row.email_encrypted),
            postcode: decrypt(row.postcode_encrypted)
        });
    }

    /**
     * Save a user profile to the database
     * @param {UserProfile} profile
     * @returns {number} The profile ID
     */
    saveProfile(profile) {
        const stmt = this.db.prepare(`
            INSERT INTO user_profiles (
                user_id, age, annual_income, employment_status, household_size,
                has_preexisting_conditions, is_smoker, region,
                has_nhs_dentist, wants_private_dental, wants_outpatient_cover,
                wants_mental_health_cover
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
            profile.userId,
            profile.age,
            profile.annualIncome,
            profile.employmentStatus,
            profile.householdSize,
            profile.hasPreexistingConditions ? 1 : 0,
            profile.isSmoker ? 1 : 0,
            profile.region,
            profile.hasNhsDentist === null ? null : (profile.hasNhsDentist ? 1 : 0),
            profile.wantsPrivateDental ? 1 : 0,
            profile.wantsOutpatientCover ? 1 : 0,
            profile.wantsMentalHealthCover ? 1 : 0
        ]);

        stmt.free();

        // Get the last inserted ID
        const result = this.db.exec('SELECT last_insert_rowid() as id');
        const profileId = result[0].values[0][0];
        
        profile.id = profileId;
        
        // Save to file
        saveDatabase();
        
        return profileId;
    }

    /**
     * Get a user profile by ID
     * @param {number} profileId
     * @returns {UserProfile|null}
     */
    getProfile(profileId) {
        const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE id = ?');
        stmt.bind([profileId]);

        if (!stmt.step()) {
            stmt.free();
            return null;
        }

        const row = stmt.getAsObject();
        stmt.free();

        return new UserProfile({
            id: row.id,
            userId: row.user_id,
            age: row.age,
            annualIncome: row.annual_income,
            employmentStatus: row.employment_status,
            householdSize: row.household_size,
            hasPreexistingConditions: row.has_preexisting_conditions === 1,
            isSmoker: row.is_smoker === 1,
            region: row.region,
            hasNhsDentist: row.has_nhs_dentist === null ? null : row.has_nhs_dentist === 1,
            wantsPrivateDental: row.wants_private_dental === 1,
            wantsOutpatientCover: row.wants_outpatient_cover === 1,
            wantsMentalHealthCover: row.wants_mental_health_cover === 1
        });
    }

    /**
     * Save an eligibility result
     * @param {number} profileId
     * @param {EligibilityResult} result
     */
    saveResult(profileId, result) {
        // Insert result
        const insertResult = this.db.prepare(`
            INSERT INTO eligibility_results (
                profile_id, has_preexisting_condition_restrictions,
                recommendation, estimated_monthly_budget
            ) VALUES (?, ?, ?, ?)
        `);

        insertResult.run([
            profileId,
            result.hasPreexistingConditionRestrictions ? 1 : 0,
            result.recommendation,
            result.estimatedMonthlyBudget
        ]);
        insertResult.free();

        // Get the result ID
        const idResult = this.db.exec('SELECT last_insert_rowid() as id');
        const resultId = idResult[0].values[0][0];

        // Insert plans
        const insertPlan = this.db.prepare(`
            INSERT INTO result_plans (
                result_id, plan_id, plan_name, plan_type,
                monthly_premium, deductible, coverage_level, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const plan of result.eligiblePlans) {
            insertPlan.run([
                resultId,
                plan.planId,
                plan.name,
                plan.planType,
                plan.monthlyPremium,
                plan.deductible,
                plan.coverageLevel,
                plan.description
            ]);
        }
        insertPlan.free();

        // Save to file
        saveDatabase();
    }

    /**
     * Get an eligibility result by profile ID
     * @param {number} profileId
     * @returns {EligibilityResult|null}
     */
    getResult(profileId) {
        // Get result
        const resultStmt = this.db.prepare('SELECT * FROM eligibility_results WHERE profile_id = ?');
        resultStmt.bind([profileId]);

        if (!resultStmt.step()) {
            resultStmt.free();
            return null;
        }

        const resultRow = resultStmt.getAsObject();
        resultStmt.free();

        // Get profile
        const profile = this.getProfile(profileId);
        if (!profile) return null;

        // Get plans
        const plansStmt = this.db.prepare('SELECT * FROM result_plans WHERE result_id = ?');
        plansStmt.bind([resultRow.id]);

        const plans = [];
        while (plansStmt.step()) {
            const planRow = plansStmt.getAsObject();
            plans.push(new InsurancePlan({
                planId: planRow.plan_id,
                name: planRow.plan_name,
                planType: planRow.plan_type,
                monthlyPremium: planRow.monthly_premium,
                deductible: planRow.deductible,
                coverageLevel: planRow.coverage_level,
                description: planRow.description
            }));
        }
        plansStmt.free();

        return new EligibilityResult({
            userProfile: profile,
            eligiblePlans: plans,
            hasPreexistingConditionRestrictions: resultRow.has_preexisting_condition_restrictions === 1,
            recommendation: resultRow.recommendation,
            estimatedMonthlyBudget: resultRow.estimated_monthly_budget
        });
    }

    /**
     * Get all user profiles
     * @returns {UserProfile[]}
     */
    getAllProfiles() {
        const results = this.db.exec('SELECT * FROM user_profiles ORDER BY created_at DESC');
        
        if (results.length === 0) return [];

        const columns = results[0].columns;
        const rows = results[0].values;

        return rows.map(row => {
            const obj = {};
            columns.forEach((col, i) => {
                obj[col] = row[i];
            });

            return new UserProfile({
                id: obj.id,
                userId: obj.user_id,
                age: obj.age,
                annualIncome: obj.annual_income,
                employmentStatus: obj.employment_status,
                householdSize: obj.household_size,
                hasPreexistingConditions: obj.has_preexisting_conditions === 1,
                isSmoker: obj.is_smoker === 1,
                region: obj.region,
                hasNhsDentist: obj.has_nhs_dentist === null ? null : obj.has_nhs_dentist === 1,
                wantsPrivateDental: obj.wants_private_dental === 1,
                wantsOutpatientCover: obj.wants_outpatient_cover === 1,
                wantsMentalHealthCover: obj.wants_mental_health_cover === 1
            });
        });
    }

    /**
     * Check if a region is valid
     * @param {string} region
     * @returns {boolean}
     */
    isValidRegion(region) {
        const stmt = this.db.prepare('SELECT 1 FROM valid_regions WHERE region = ?');
        stmt.bind([region]);
        const exists = stmt.step();
        stmt.free();
        return exists;
    }

    /**
     * Get all valid regions
     * @returns {string[]}
     */
    getValidRegions() {
        const results = this.db.exec('SELECT region FROM valid_regions ORDER BY region');
        if (results.length === 0) return [];
        return results[0].values.map(row => row[0]);
    }
}

module.exports = SQLRepository;
