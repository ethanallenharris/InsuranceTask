/**
 * Valid relationship types
 */
const RELATIONSHIP_TYPES = ['spouse', 'child'];

/**
 * Represents a family member (spouse or child) linked to a user.
 */
class FamilyMember {
    /**
     * @param {Object} data
     * @param {number|null} data.id
     * @param {number} data.userId - The ID of the user this family member belongs to
     * @param {string} data.relationship - 'spouse' or 'child'
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.dateOfBirth - Date of birth in YYYY-MM-DD format
     * @param {boolean} data.hasPreexistingConditions
     * @param {string|null} data.preexistingConditionsDetails
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.userId = data.userId || null;
        this.relationship = data.relationship || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.dateOfBirth = data.dateOfBirth || null;
        this.hasPreexistingConditions = data.hasPreexistingConditions || false;
        this.preexistingConditionsDetails = data.preexistingConditionsDetails || null;
    }

    /**
     * Calculate age from date of birth
     * @returns {number|null}
     */
    getAge() {
        if (!this.dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    toDict() {
        return {
            id: this.id,
            userId: this.userId,
            relationship: this.relationship,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            age: this.getAge(),
            hasPreexistingConditions: this.hasPreexistingConditions,
            preexistingConditionsDetails: this.preexistingConditionsDetails
        };
    }

    /**
     * Return safe version without sensitive details
     */
    toSafeDict() {
        return {
            id: this.id,
            relationship: this.relationship,
            firstName: this.firstName,
            age: this.getAge(),
            hasPreexistingConditions: this.hasPreexistingConditions
        };
    }

    static fromDict(data) {
        return new FamilyMember(data);
    }

    /**
     * Check if a relationship type is valid
     * @param {string} relationship
     * @returns {boolean}
     */
    static isValidRelationship(relationship) {
        return RELATIONSHIP_TYPES.includes(relationship);
    }

    /**
     * Get all valid relationship types
     * @returns {string[]}
     */
    static getValidRelationships() {
        return [...RELATIONSHIP_TYPES];
    }
}

module.exports = FamilyMember;
