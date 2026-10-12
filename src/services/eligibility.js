const InsurancePlan = require('../models/InsurancePlan');
const EligibilityResult = require('../models/EligibilityResult');

// 2024 Federal Poverty Level guidelines (simplified)
const FPL_BASE = 14580;
const FPL_PER_PERSON = 5140;

/**
 * Calculate Federal Poverty Level percentage
 * @param {number} annualIncome
 * @param {number} householdSize
 * @returns {number}
 */
function calculateFplPercentage(annualIncome, householdSize) {
    const fplThreshold = FPL_BASE + (householdSize - 1) * FPL_PER_PERSON;
    return (annualIncome / fplThreshold) * 100;
}

/**
 * Get all available insurance plans
 * @returns {InsurancePlan[]}
 */
function getAvailablePlans() {
    return [
        new InsurancePlan({
            planId: 'bronze_basic',
            name: 'Bronze Basic',
            planType: 'Bronze',
            monthlyPremium: 250,
            deductible: 6500,
            coverageLevel: '60%',
            description: 'Lower premiums, higher out-of-pocket costs'
        }),
        new InsurancePlan({
            planId: 'silver_standard',
            name: 'Silver Standard',
            planType: 'Silver',
            monthlyPremium: 350,
            deductible: 4500,
            coverageLevel: '70%',
            description: 'Moderate premiums and out-of-pocket costs'
        }),
        new InsurancePlan({
            planId: 'gold_plus',
            name: 'Gold Plus',
            planType: 'Gold',
            monthlyPremium: 450,
            deductible: 2500,
            coverageLevel: '80%',
            description: 'Higher premiums, lower out-of-pocket costs'
        }),
        new InsurancePlan({
            planId: 'platinum_premium',
            name: 'Platinum Premium',
            planType: 'Platinum',
            monthlyPremium: 550,
            deductible: 1000,
            coverageLevel: '90%',
            description: 'Highest premiums, lowest out-of-pocket costs'
        })
    ];
}

/**
 * Check Medicaid eligibility
 * @param {import('../models/UserProfile')} profile
 * @returns {boolean}
 */
function checkMedicaidEligibility(profile) {
    const fplPercentage = calculateFplPercentage(profile.annualIncome, profile.householdSize);
    // Medicaid expansion states: eligible if income <= 138% FPL
    return fplPercentage <= 138;
}

/**
 * Check Medicare eligibility
 * @param {import('../models/UserProfile')} profile
 * @returns {boolean}
 */
function checkMedicareEligibility(profile) {
    return profile.age >= 65;
}

/**
 * Calculate subsidy eligibility and amount
 * @param {import('../models/UserProfile')} profile
 * @returns {{eligible: boolean, amount: number}}
 */
function calculateSubsidy(profile) {
    const fplPercentage = calculateFplPercentage(profile.annualIncome, profile.householdSize);
    
    // Subsidies available for 100-400% FPL
    if (fplPercentage < 100 || fplPercentage > 400) {
        return { eligible: false, amount: 0 };
    }
    
    // Simplified subsidy calculation
    let subsidyPercentage;
    if (fplPercentage <= 150) {
        subsidyPercentage = 0.8;
    } else if (fplPercentage <= 200) {
        subsidyPercentage = 0.6;
    } else if (fplPercentage <= 250) {
        subsidyPercentage = 0.4;
    } else if (fplPercentage <= 300) {
        subsidyPercentage = 0.25;
    } else {
        subsidyPercentage = 0.1;
    }
    
    // Estimate based on silver plan premium
    const silverPremium = 350;
    const estimatedSubsidy = silverPremium * subsidyPercentage;
    
    return { eligible: true, amount: Math.round(estimatedSubsidy) };
}

/**
 * Filter plans based on user profile
 * @param {import('../models/UserProfile')} profile
 * @param {InsurancePlan[]} plans
 * @returns {InsurancePlan[]}
 */
function filterEligiblePlans(profile, plans) {
    // All marketplace plans are available to everyone
    // Could add filtering logic based on state, etc.
    return plans;
}

/**
 * Determine full eligibility for a user profile
 * @param {import('../models/UserProfile')} profile
 * @returns {EligibilityResult}
 */
function determineEligibility(profile) {
    const medicaidEligible = checkMedicaidEligibility(profile);
    const medicareEligible = checkMedicareEligibility(profile);
    const subsidy = calculateSubsidy(profile);
    
    let eligiblePlans = [];
    
    if (!medicaidEligible && !medicareEligible) {
        const allPlans = getAvailablePlans();
        eligiblePlans = filterEligiblePlans(profile, allPlans);
    }
    
    return new EligibilityResult({
        userProfile: profile,
        eligiblePlans: eligiblePlans,
        subsidyEligible: subsidy.eligible,
        estimatedSubsidy: subsidy.amount,
        medicaidEligible: medicaidEligible,
        medicareEligible: medicareEligible
    });
}

module.exports = {
    calculateFplPercentage,
    getAvailablePlans,
    checkMedicaidEligibility,
    checkMedicareEligibility,
    calculateSubsidy,
    filterEligiblePlans,
    determineEligibility
};
