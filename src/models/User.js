/**
 * Valid user statuses
 */
const USER_STATUSES = ['accepted', 'rejected', 'referred'];
const DEFAULT_STATUS = 'referred';

/**
 * Represents a registered user with encrypted personal details.
 */
class User {
    /**
     * @param {Object} data
     * @param {number|null} data.id
     * @param {string} data.firstName
     * @param {string} data.lastName
     * @param {string} data.email
     * @param {string} data.postcode
     * @param {string} data.status - One of: 'accepted', 'rejected', 'referred'
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.email = data.email || null;
        this.postcode = data.postcode || null;
        this.status = data.status || DEFAULT_STATUS;
    }

    toDict() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            postcode: this.postcode,
            status: this.status
        };
    }

    /**
     * Return safe version without sensitive data
     */
    toSafeDict() {
        return {
            id: this.id,
            firstName: this.firstName,
            // Mask email: show first 2 chars and domain
            email: this.email ? this.maskEmail(this.email) : null,
            status: this.status
        };
    }

    maskEmail(email) {
        const parts = email.split('@');
        if (parts.length !== 2) return '***';
        const name = parts[0];
        const domain = parts[1];
        const maskedName = name.length > 2 
            ? name.substring(0, 2) + '***' 
            : '***';
        return maskedName + '@' + domain;
    }

    static fromDict(data) {
        return new User(data);
    }

    /**
     * Check if a status value is valid
     * @param {string} status
     * @returns {boolean}
     */
    static isValidStatus(status) {
        return USER_STATUSES.includes(status);
    }

    /**
     * Get all valid statuses
     * @returns {string[]}
     */
    static getValidStatuses() {
        return [...USER_STATUSES];
    }

    /**
     * Get the default status
     * @returns {string}
     */
    static getDefaultStatus() {
        return DEFAULT_STATUS;
    }
}

module.exports = User;
