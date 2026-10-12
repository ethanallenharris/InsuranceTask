/**
 * Validation error class
 */
class ValidationError extends Error {
    constructor(field, message) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}

/**
 * Collection of validation errors
 */
class ValidationResult {
    constructor() {
        this.errors = [];
    }

    addError(field, message) {
        this.errors.push(new ValidationError(field, message));
    }

    isValid() {
        return this.errors.length === 0;
    }

    getErrors() {
        return this.errors.map(e => ({ field: e.field, message: e.message }));
    }
}

const VALID_EMPLOYMENT_STATUSES = ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'];

const VALID_REGIONS = [
    'London', 'South East', 'South West', 'East of England',
    'West Midlands', 'East Midlands', 'Yorkshire and the Humber',
    'North West', 'North East', 'Scotland', 'Wales', 'Northern Ireland'
];

const VALID_RELATIONSHIPS = ['spouse', 'child'];

// UK postcode regex pattern
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}|GIR ?0AA)$/i;

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Date regex pattern (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate user registration data
 * @param {Object} data - Raw input data
 * @returns {ValidationResult}
 */
function validateUserData(data) {
    const result = new ValidationResult();

    // First name validation
    if (!data.firstName || typeof data.firstName !== 'string') {
        result.addError('firstName', 'First name is required');
    } else if (data.firstName.trim().length < 1) {
        result.addError('firstName', 'First name cannot be empty');
    } else if (data.firstName.trim().length > 50) {
        result.addError('firstName', 'First name must be less than 50 characters');
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.firstName.trim())) {
        result.addError('firstName', 'First name contains invalid characters');
    }

    // Last name validation
    if (!data.lastName || typeof data.lastName !== 'string') {
        result.addError('lastName', 'Last name is required');
    } else if (data.lastName.trim().length < 1) {
        result.addError('lastName', 'Last name cannot be empty');
    } else if (data.lastName.trim().length > 50) {
        result.addError('lastName', 'Last name must be less than 50 characters');
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.lastName.trim())) {
        result.addError('lastName', 'Last name contains invalid characters');
    }

    // Email validation
    if (!data.email || typeof data.email !== 'string') {
        result.addError('email', 'Email is required');
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
        result.addError('email', 'Please enter a valid email address');
    } else if (data.email.trim().length > 254) {
        result.addError('email', 'Email address is too long');
    }

    // Postcode validation
    if (!data.postcode || typeof data.postcode !== 'string') {
        result.addError('postcode', 'Postcode is required');
    } else if (!UK_POSTCODE_REGEX.test(data.postcode.trim())) {
        result.addError('postcode', 'Please enter a valid UK postcode');
    }

    return result;
}

/**
 * Validate user profile data
 * @param {Object} data - Raw input data
 * @returns {ValidationResult}
 */
function validateProfileData(data) {
    const result = new ValidationResult();

    // Age validation
    if (data.age === undefined || data.age === null) {
        result.addError('age', 'Age is required');
    } else if (typeof data.age !== 'number' || !Number.isInteger(data.age)) {
        result.addError('age', 'Age must be a whole number');
    } else if (data.age < 18) {
        result.addError('age', 'You must be at least 18 years old');
    } else if (data.age > 120) {
        result.addError('age', 'Please enter a valid age');
    }

    // Annual income validation
    if (data.annualIncome === undefined || data.annualIncome === null) {
        result.addError('annualIncome', 'Annual income is required');
    } else if (typeof data.annualIncome !== 'number') {
        result.addError('annualIncome', 'Annual income must be a number');
    } else if (data.annualIncome < 0) {
        result.addError('annualIncome', 'Annual income cannot be negative');
    } else if (data.annualIncome > 100000000) {
        result.addError('annualIncome', 'Please enter a valid annual income');
    }

    // Household size validation
    if (data.householdSize === undefined || data.householdSize === null) {
        result.addError('householdSize', 'Household size is required');
    } else if (typeof data.householdSize !== 'number' || !Number.isInteger(data.householdSize)) {
        result.addError('householdSize', 'Household size must be a whole number');
    } else if (data.householdSize < 1) {
        result.addError('householdSize', 'Household size must be at least 1');
    } else if (data.householdSize > 20) {
        result.addError('householdSize', 'Please enter a valid household size');
    }

    // Employment status validation
    if (!data.employmentStatus) {
        result.addError('employmentStatus', 'Employment status is required');
    } else if (!VALID_EMPLOYMENT_STATUSES.includes(data.employmentStatus)) {
        result.addError('employmentStatus', `Employment status must be one of: ${VALID_EMPLOYMENT_STATUSES.join(', ')}`);
    }

    // Region validation
    if (!data.region) {
        result.addError('region', 'Region is required');
    } else if (!VALID_REGIONS.includes(data.region)) {
        result.addError('region', `Region must be a valid UK region`);
    }

    // Boolean field validations
    if (data.hasPreexistingConditions === undefined || data.hasPreexistingConditions === null) {
        result.addError('hasPreexistingConditions', 'Please indicate if you have pre-existing conditions');
    } else if (typeof data.hasPreexistingConditions !== 'boolean') {
        result.addError('hasPreexistingConditions', 'Invalid value for pre-existing conditions');
    }

    if (data.isSmoker === undefined || data.isSmoker === null) {
        result.addError('isSmoker', 'Please indicate if you smoke');
    } else if (typeof data.isSmoker !== 'boolean') {
        result.addError('isSmoker', 'Invalid value for smoker status');
    }

    if (data.wantsOutpatientCover === undefined || data.wantsOutpatientCover === null) {
        result.addError('wantsOutpatientCover', 'Please indicate if you want outpatient cover');
    } else if (typeof data.wantsOutpatientCover !== 'boolean') {
        result.addError('wantsOutpatientCover', 'Invalid value for outpatient cover preference');
    }

    if (data.wantsMentalHealthCover === undefined || data.wantsMentalHealthCover === null) {
        result.addError('wantsMentalHealthCover', 'Please indicate if you want mental health cover');
    } else if (typeof data.wantsMentalHealthCover !== 'boolean') {
        result.addError('wantsMentalHealthCover', 'Invalid value for mental health cover preference');
    }

    if (data.wantsPrivateDental === undefined || data.wantsPrivateDental === null) {
        result.addError('wantsPrivateDental', 'Please indicate if you want private dental cover');
    } else if (typeof data.wantsPrivateDental !== 'boolean') {
        result.addError('wantsPrivateDental', 'Invalid value for dental cover preference');
    }

    return result;
}

/**
 * Validate family member data
 * @param {Object} data - Raw input data
 * @param {number} index - Index of the family member (for error messages)
 * @returns {ValidationResult}
 */
function validateFamilyMemberData(data, index = 0) {
    const result = new ValidationResult();
    const prefix = data.relationship === 'spouse' ? 'Spouse' : `Child ${index + 1}`;

    // Relationship validation
    if (!data.relationship || typeof data.relationship !== 'string') {
        result.addError('relationship', `${prefix}: Relationship is required`);
    } else if (!VALID_RELATIONSHIPS.includes(data.relationship)) {
        result.addError('relationship', `${prefix}: Invalid relationship type`);
    }

    // First name validation
    if (!data.firstName || typeof data.firstName !== 'string') {
        result.addError('firstName', `${prefix}: First name is required`);
    } else if (data.firstName.trim().length < 1) {
        result.addError('firstName', `${prefix}: First name cannot be empty`);
    } else if (data.firstName.trim().length > 50) {
        result.addError('firstName', `${prefix}: First name must be less than 50 characters`);
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.firstName.trim())) {
        result.addError('firstName', `${prefix}: First name contains invalid characters`);
    }

    // Last name validation
    if (!data.lastName || typeof data.lastName !== 'string') {
        result.addError('lastName', `${prefix}: Last name is required`);
    } else if (data.lastName.trim().length < 1) {
        result.addError('lastName', `${prefix}: Last name cannot be empty`);
    } else if (data.lastName.trim().length > 50) {
        result.addError('lastName', `${prefix}: Last name must be less than 50 characters`);
    } else if (!/^[a-zA-Z\s\-']+$/.test(data.lastName.trim())) {
        result.addError('lastName', `${prefix}: Last name contains invalid characters`);
    }

    // Date of birth validation
    if (!data.dateOfBirth || typeof data.dateOfBirth !== 'string') {
        result.addError('dateOfBirth', `${prefix}: Date of birth is required`);
    } else if (!DATE_REGEX.test(data.dateOfBirth)) {
        result.addError('dateOfBirth', `${prefix}: Date of birth must be in YYYY-MM-DD format`);
    } else {
        const dob = new Date(data.dateOfBirth);
        const today = new Date();
        
        if (isNaN(dob.getTime())) {
            result.addError('dateOfBirth', `${prefix}: Invalid date of birth`);
        } else if (dob > today) {
            result.addError('dateOfBirth', `${prefix}: Date of birth cannot be in the future`);
        } else {
            // Calculate age
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            // Spouse must be at least 18
            if (data.relationship === 'spouse' && age < 18) {
                result.addError('dateOfBirth', `${prefix}: Spouse must be at least 18 years old`);
            }
            
            // Child must be under 26 for most insurance policies
            if (data.relationship === 'child' && age >= 26) {
                result.addError('dateOfBirth', `${prefix}: Children must be under 26 years old`);
            }
        }
    }

    // Pre-existing conditions validation (optional, defaults to false)
    if (data.hasPreexistingConditions !== undefined && 
        data.hasPreexistingConditions !== null && 
        typeof data.hasPreexistingConditions !== 'boolean') {
        result.addError('hasPreexistingConditions', `${prefix}: Invalid value for pre-existing conditions`);
    }

    return result;
}

/**
 * Sanitize string input to prevent injection
 * @param {string} input
 * @returns {string}
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return input;
    return input.trim().slice(0, 1000); // Limit length and trim whitespace
}

/**
 * Sanitize user registration data
 * @param {Object} data
 * @returns {Object}
 */
function sanitizeUserData(data) {
    return {
        firstName: sanitizeString(data.firstName),
        lastName: sanitizeString(data.lastName),
        email: data.email ? data.email.toLowerCase().trim().slice(0, 254) : data.email,
        postcode: data.postcode ? data.postcode.toUpperCase().trim().replace(/\s+/g, ' ') : data.postcode
    };
}

/**
 * Sanitize profile data
 * @param {Object} data
 * @returns {Object}
 */
function sanitizeProfileData(data) {
    return {
        age: typeof data.age === 'number' ? Math.floor(data.age) : data.age,
        annualIncome: typeof data.annualIncome === 'number' ? Math.round(data.annualIncome * 100) / 100 : data.annualIncome,
        householdSize: typeof data.householdSize === 'number' ? Math.floor(data.householdSize) : data.householdSize,
        employmentStatus: sanitizeString(data.employmentStatus),
        region: sanitizeString(data.region),
        hasPreexistingConditions: Boolean(data.hasPreexistingConditions),
        isSmoker: Boolean(data.isSmoker),
        hasNhsDentist: data.hasNhsDentist === undefined ? null : Boolean(data.hasNhsDentist),
        wantsPrivateDental: Boolean(data.wantsPrivateDental),
        wantsOutpatientCover: Boolean(data.wantsOutpatientCover),
        wantsMentalHealthCover: Boolean(data.wantsMentalHealthCover)
    };
}

/**
 * Sanitize family member data
 * @param {Object} data
 * @returns {Object}
 */
function sanitizeFamilyMemberData(data) {
    return {
        relationship: sanitizeString(data.relationship),
        firstName: sanitizeString(data.firstName),
        lastName: sanitizeString(data.lastName),
        dateOfBirth: sanitizeString(data.dateOfBirth),
        hasPreexistingConditions: Boolean(data.hasPreexistingConditions)
    };
}

module.exports = {
    ValidationError,
    ValidationResult,
    validateUserData,
    validateProfileData,
    validateFamilyMemberData,
    sanitizeString,
    sanitizeUserData,
    sanitizeProfileData,
    sanitizeFamilyMemberData,
    VALID_EMPLOYMENT_STATUSES,
    VALID_REGIONS,
    VALID_RELATIONSHIPS
};
