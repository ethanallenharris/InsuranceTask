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
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.firstName = data.firstName || null;
        this.lastName = data.lastName || null;
        this.email = data.email || null;
        this.postcode = data.postcode || null;
    }

    toDict() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            postcode: this.postcode
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
            email: this.email ? this.maskEmail(this.email) : null
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
}

module.exports = User;
