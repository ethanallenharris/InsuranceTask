/**
 * Represents the result of an eligibility check.
 * Structure designed for easy TypeScript migration.
 */
class EligibilityResult {
    /**
     * @param {Object} data
     * @param {import('./UserProfile')} data.userProfile
     * @param {Array} data.eligiblePlans
     * @param {boolean} data.hasPreexistingConditionRestrictions
     * @param {string} data.recommendation
     * @param {number} data.estimatedMonthlyBudget
     */
    constructor(data) {
        this.userProfile = data.userProfile;
        this.eligiblePlans = data.eligiblePlans || [];
        this.hasPreexistingConditionRestrictions = data.hasPreexistingConditionRestrictions || false;
        this.recommendation = data.recommendation || '';
        this.estimatedMonthlyBudget = data.estimatedMonthlyBudget || 0;
    }

    toDict() {
        return {
            userProfile: this.userProfile.toDict(),
            eligiblePlans: this.eligiblePlans.map(plan => plan.toDict()),
            hasPreexistingConditionRestrictions: this.hasPreexistingConditionRestrictions,
            recommendation: this.recommendation,
            estimatedMonthlyBudget: this.estimatedMonthlyBudget
        };
    }
}

module.exports = EligibilityResult;
