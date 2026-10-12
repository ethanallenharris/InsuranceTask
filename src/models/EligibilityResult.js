/**
 * Represents the result of an eligibility check.
 * Structure designed for easy TypeScript migration.
 */
class EligibilityResult {
    /**
     * @param {Object} data
     * @param {import('./UserProfile')} data.userProfile
     * @param {Array} data.eligiblePlans
     * @param {boolean} data.subsidyEligible
     * @param {number} data.estimatedSubsidy
     * @param {boolean} data.medicaidEligible
     * @param {boolean} data.medicareEligible
     */
    constructor(data) {
        this.userProfile = data.userProfile;
        this.eligiblePlans = data.eligiblePlans || [];
        this.subsidyEligible = data.subsidyEligible || false;
        this.estimatedSubsidy = data.estimatedSubsidy || 0.0;
        this.medicaidEligible = data.medicaidEligible || false;
        this.medicareEligible = data.medicareEligible || false;
    }

    toDict() {
        return {
            userProfile: this.userProfile.toDict(),
            eligiblePlans: this.eligiblePlans.map(plan => plan.toDict()),
            subsidyEligible: this.subsidyEligible,
            estimatedSubsidy: this.estimatedSubsidy,
            medicaidEligible: this.medicaidEligible,
            medicareEligible: this.medicareEligible
        };
    }
}

module.exports = EligibilityResult;
