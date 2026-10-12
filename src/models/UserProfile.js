/**
 * Represents user information for insurance eligibility.
 * Structure designed for easy TypeScript migration.
 */
class UserProfile {
    /**
     * @param {Object} data
     * @param {number|null} data.age
     * @param {number|null} data.annualIncome
     * @param {string|null} data.employmentStatus
     * @param {number|null} data.householdSize
     * @param {boolean|null} data.hasPreexistingConditions
     * @param {boolean|null} data.isSmoker
     * @param {string|null} data.state
     * @param {boolean|null} data.currentlyInsured
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.age = data.age || null;
        this.annualIncome = data.annualIncome || null;
        this.employmentStatus = data.employmentStatus || null;
        this.householdSize = data.householdSize || null;
        this.hasPreexistingConditions = data.hasPreexistingConditions || null;
        this.isSmoker = data.isSmoker || null;
        this.state = data.state || null;
        this.currentlyInsured = data.currentlyInsured || null;
    }

    toDict() {
        return {
            id: this.id,
            age: this.age,
            annualIncome: this.annualIncome,
            employmentStatus: this.employmentStatus,
            householdSize: this.householdSize,
            hasPreexistingConditions: this.hasPreexistingConditions,
            isSmoker: this.isSmoker,
            state: this.state,
            currentlyInsured: this.currentlyInsured
        };
    }

    static fromDict(data) {
        return new UserProfile(data);
    }
}

module.exports = UserProfile;
