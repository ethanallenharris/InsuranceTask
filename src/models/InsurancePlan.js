/**
 * Represents an available insurance plan.
 * Structure designed for easy TypeScript migration.
 */
class InsurancePlan {
    /**
     * @param {Object} data
     * @param {string} data.planId
     * @param {string} data.name
     * @param {string} data.planType
     * @param {number} data.monthlyPremium
     * @param {number} data.deductible
     * @param {string} data.coverageLevel
     * @param {string} data.description
     */
    constructor(data) {
        this.planId = data.planId;
        this.name = data.name;
        this.planType = data.planType;
        this.monthlyPremium = data.monthlyPremium;
        this.deductible = data.deductible;
        this.coverageLevel = data.coverageLevel;
        this.description = data.description;
    }

    toDict() {
        return {
            planId: this.planId,
            name: this.name,
            planType: this.planType,
            monthlyPremium: this.monthlyPremium,
            deductible: this.deductible,
            coverageLevel: this.coverageLevel,
            description: this.description
        };
    }
}

module.exports = InsurancePlan;
