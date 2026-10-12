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
 * Sanitize string input to prevent injection
 * @param {string} input
 * @returns {string}
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return input;
    return input.trim().slice(0, 1000); // Limit length and trim whitespace
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

module.exports = {
    ValidationError,
    ValidationResult,
    validateProfileData,
    sanitizeString,
    sanitizeProfileData,
    VALID_EMPLOYMENT_STATUSES,
    VALID_REGIONS
};
