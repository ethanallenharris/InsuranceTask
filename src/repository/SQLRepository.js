const { getConnection } = require('../database/connection');
const UserProfile = require('../models/UserProfile');
const EligibilityResult = require('../models/EligibilityResult');
const InsurancePlan = require('../models/InsurancePlan');

/**
 * SQL-based repository for persistent storage
 */
class SQLRepository {
    constructor() {
        this.db = getConnection();
    }

    /**
     * Save a user profile to the database
     * @param {UserProfile} profile
     * @returns {number} The profile ID
     */
    saveProfile(profile) {
        const stmt = this.db.prepare(`
            INSERT INTO user_profiles (
                age, annual_income, employment_status, household_size,
                has_preexisting_conditions, is_smoker, region,
                has_nhs_dentist, wants_private_dental, wants_outpatient_cover,
                wants_mental_health_cover
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
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
        );

        profile.id = result.lastInsertRowid;
        return result.lastInsertRowid;
    }

    /**
     * Get a user profile by ID
     * @param {number} profileId
     * @returns {UserProfile|null}
     */
    getProfile(profileId) {
        const stmt = this.db.prepare(`
            SELECT * FROM user_profiles WHERE id = ?
        `);

        const row = stmt.get(profileId);
        if (!row) return null;

        return new UserProfile({
            id: row.id,
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
        const insertResult = this.db.prepare(`
            INSERT INTO eligibility_results (
                profile_id, has_preexisting_condition_restrictions,
                recommendation, estimated_monthly_budget
            ) VALUES (?, ?, ?, ?)
        `);

        const insertPlan = this.db.prepare(`
            INSERT INTO result_plans (
                result_id, plan_id, plan_name, plan_type,
                monthly_premium, deductible, coverage_level, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = this.db.transaction(() => {
            const res = insertResult.run(
                profileId,
                result.hasPreexistingConditionRestrictions ? 1 : 0,
                result.recommendation,
                result.estimatedMonthlyBudget
            );

            const resultId = res.lastInsertRowid;

            for (const plan of result.eligiblePlans) {
                insertPlan.run(
                    resultId,
                    plan.planId,
                    plan.name,
                    plan.planType,
                    plan.monthlyPremium,
                    plan.deductible,
                    plan.coverageLevel,
                    plan.description
                );
            }
        });

        transaction();
    }

    /**
     * Get an eligibility result by profile ID
     * @param {number} profileId
     * @returns {EligibilityResult|null}
     */
    getResult(profileId) {
        const resultStmt = this.db.prepare(`
            SELECT * FROM eligibility_results WHERE profile_id = ?
        `);

        const plansStmt = this.db.prepare(`
            SELECT * FROM result_plans WHERE result_id = ?
        `);

        const resultRow = resultStmt.get(profileId);
        if (!resultRow) return null;

        const profile = this.getProfile(profileId);
        if (!profile) return null;

        const planRows = plansStmt.all(resultRow.id);
        const plans = planRows.map(row => new InsurancePlan({
            planId: row.plan_id,
            name: row.plan_name,
            planType: row.plan_type,
            monthlyPremium: row.monthly_premium,
            deductible: row.deductible,
            coverageLevel: row.coverage_level,
            description: row.description
        }));

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
        const stmt = this.db.prepare(`
            SELECT * FROM user_profiles ORDER BY created_at DESC
        `);

        const rows = stmt.all();
        return rows.map(row => new UserProfile({
            id: row.id,
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
        }));
    }

    /**
     * Check if a region is valid
     * @param {string} region
     * @returns {boolean}
     */
    isValidRegion(region) {
        const stmt = this.db.prepare(`
            SELECT 1 FROM valid_regions WHERE region = ?
        `);
        return stmt.get(region) !== undefined;
    }

    /**
     * Get all valid regions
     * @returns {string[]}
     */
    getValidRegions() {
        const stmt = this.db.prepare(`
            SELECT region FROM valid_regions ORDER BY region
        `);
        return stmt.all().map(row => row.region);
    }
}

module.exports = SQLRepository;
