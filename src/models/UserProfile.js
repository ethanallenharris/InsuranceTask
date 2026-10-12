/**
 * Represents user information for insurance eligibility.
 */
class UserProfile {
    /**
     * @param {Object} data
     * @param {number|null} data.id
     * @param {number|null} data.userId
     * @param {number|null} data.age
     * @param {number|null} data.annualIncome
     * @param {string|null} data.employmentStatus
     * @param {number|null} data.householdSize
     * @param {boolean|null} data.hasPreexistingConditions
     * @param {boolean|null} data.isSmoker
     * @param {string|null} data.region
     * @param {boolean|null} data.hasNhsDentist
     * @param {boolean|null} data.wantsPrivateDental
     * @param {boolean|null} data.wantsOutpatientCover
     * @param {boolean|null} data.wantsMentalHealthCover
     * @param {boolean} data.hasSpouse
     * @param {number} data.numberOfChildren
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.age = data.age || null;
        this.annualIncome = data.annualIncome || null;
        this.employmentStatus = data.employmentStatus || null;
        this.householdSize = data.householdSize || null;
        this.hasPreexistingConditions = data.hasPreexistingConditions || null;
        this.isSmoker = data.isSmoker || null;
        this.region = data.region || null;
        this.hasNhsDentist = data.hasNhsDentist !== undefined ? data.hasNhsDentist : null;
        this.wantsPrivateDental = data.wantsPrivateDental || null;
        this.wantsOutpatientCover = data.wantsOutpatientCover || null;
        this.wantsMentalHealthCover = data.wantsMentalHealthCover || null;
        this.hasSpouse = data.hasSpouse || false;
        this.numberOfChildren = data.numberOfChildren || 0;
    }

    toDict() {
        return {
            id: this.id,
            userId: this.userId,
            age: this.age,
            annualIncome: this.annualIncome,
            employmentStatus: this.employmentStatus,
            householdSize: this.householdSize,
            hasPreexistingConditions: this.hasPreexistingConditions,
            isSmoker: this.isSmoker,
            region: this.region,
            hasNhsDentist: this.hasNhsDentist,
            wantsPrivateDental: this.wantsPrivateDental,
            wantsOutpatientCover: this.wantsOutpatientCover,
            wantsMentalHealthCover: this.wantsMentalHealthCover,
            hasSpouse: this.hasSpouse,
            numberOfChildren: this.numberOfChildren
        };
    }

    static fromDict(data) {
        return new UserProfile(data);
    }
}

module.exports = UserProfile;
