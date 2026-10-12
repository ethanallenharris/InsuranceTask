const InsurancePlan = require('../models/InsurancePlan');
const EligibilityResult = require('../models/EligibilityResult');

/**
 * Get all available private health insurance plans
 * @returns {InsurancePlan[]}
 */
function getAvailablePlans() {
    return [
        new InsurancePlan({
            planId: 'essential_cover',
            name: 'Essential Cover',
            planType: 'Basic',
            monthlyPremium: 45,
            deductible: 500,
            coverageLevel: 'Core',
            description: 'Covers inpatient treatment and day-patient surgery. Ideal for those wanting basic private hospital cover.'
        }),
        new InsurancePlan({
            planId: 'standard_cover',
            name: 'Standard Cover',
            planType: 'Standard',
            monthlyPremium: 75,
            deductible: 250,
            coverageLevel: 'Extended',
            description: 'Includes inpatient, day-patient, and outpatient consultations. Good all-round protection.'
        }),
        new InsurancePlan({
            planId: 'comprehensive_cover',
            name: 'Comprehensive Cover',
            planType: 'Comprehensive',
            monthlyPremium: 120,
            deductible: 100,
            coverageLevel: 'Full',
            description: 'Full cover including mental health, therapies, and dental. Our most complete package.'
        }),
        new InsurancePlan({
            planId: 'premium_cover',
            name: 'Premium Cover',
            planType: 'Premium',
            monthlyPremium: 180,
            deductible: 0,
            coverageLevel: 'Premium',
            description: 'No excess, worldwide cover, private GP access, and full wellness benefits. The ultimate in private healthcare.'
        })
    ];
}

/**
 * Calculate recommended monthly budget based on income
 * @param {number} annualIncome
 * @returns {number}
 */
function calculateRecommendedBudget(annualIncome) {
    // Recommend 2-4% of annual income for health insurance
    const monthlyIncome = annualIncome / 12;
    return Math.round(monthlyIncome * 0.03); // 3% as middle ground
}

/**
 * Check if pre-existing conditions may affect coverage
 * @param {import('../models/UserProfile')} profile
 * @returns {boolean}
 */
function checkPreexistingConditionRestrictions(profile) {
    // In the UK, pre-existing conditions are typically excluded or have waiting periods
    return profile.hasPreexistingConditions === true;
}

/**
 * Generate a recommendation based on user profile
 * @param {import('../models/UserProfile')} profile
 * @returns {string}
 */
function generateRecommendation(profile) {
    const recommendations = [];
    
    if (profile.age >= 55) {
        recommendations.push('Given your age, we recommend considering a comprehensive plan with good outpatient cover for routine check-ups.');
    }
    
    if (profile.hasPreexistingConditions) {
        recommendations.push('Pre-existing conditions are typically not covered immediately. Look for plans with moratorium underwriting which may cover conditions after 2 years without symptoms.');
    }
    
    if (profile.isSmoker) {
        recommendations.push('As a smoker, premiums may be higher. Some insurers offer discounts if you join a smoking cessation programme.');
    }
    
    if (profile.wantsMentalHealthCover) {
        recommendations.push('Mental health cover varies significantly between providers. Check the specific limits on therapy sessions and psychiatric treatment.');
    }
    
    if (profile.wantsPrivateDental) {
        recommendations.push('Dental cover can be added to most plans or purchased separately. Consider the annual limits on treatment.');
    }
    
    if (profile.employmentStatus === 'Self-employed') {
        recommendations.push('As self-employed, you may want to consider income protection insurance alongside health cover.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Based on your profile, a standard private health insurance plan should meet your needs well.');
    }
    
    return recommendations.join(' ');
}

/**
 * Filter plans based on user profile and preferences
 * @param {import('../models/UserProfile')} profile
 * @param {InsurancePlan[]} plans
 * @returns {InsurancePlan[]}
 */
function filterEligiblePlans(profile, plans) {
    const budget = calculateRecommendedBudget(profile.annualIncome);
    
    // Filter based on preferences
    let filteredPlans = plans;
    
    // If they want mental health or dental, recommend comprehensive or premium
    if (profile.wantsMentalHealthCover || profile.wantsPrivateDental) {
        filteredPlans = plans.filter(plan => 
            plan.planType === 'Comprehensive' || plan.planType === 'Premium'
        );
    }
    
    // If they want outpatient cover, exclude basic
    if (profile.wantsOutpatientCover) {
        filteredPlans = filteredPlans.filter(plan => plan.planType !== 'Basic');
    }
    
    // If no plans match preferences, return all plans
    if (filteredPlans.length === 0) {
        filteredPlans = plans;
    }
    
    // Sort by premium (lowest first)
    return filteredPlans.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
}

/**
 * Apply age-based premium adjustments
 * @param {InsurancePlan[]} plans
 * @param {number} age
 * @returns {InsurancePlan[]}
 */
function applyAgePremiumAdjustment(plans, age) {
    // Age affects premiums in UK private health insurance
    let multiplier = 1.0;
    
    if (age < 30) {
        multiplier = 0.8;
    } else if (age >= 30 && age < 40) {
        multiplier = 1.0;
    } else if (age >= 40 && age < 50) {
        multiplier = 1.3;
    } else if (age >= 50 && age < 60) {
        multiplier = 1.6;
    } else if (age >= 60 && age < 70) {
        multiplier = 2.0;
    } else {
        multiplier = 2.5;
    }
    
    return plans.map(plan => {
        const adjustedPlan = new InsurancePlan({
            planId: plan.planId,
            name: plan.name,
            planType: plan.planType,
            monthlyPremium: Math.round(plan.monthlyPremium * multiplier),
            deductible: plan.deductible,
            coverageLevel: plan.coverageLevel,
            description: plan.description
        });
        return adjustedPlan;
    });
}

/**
 * Determine full eligibility for a user profile
 * @param {import('../models/UserProfile')} profile
 * @returns {EligibilityResult}
 */
function determineEligibility(profile) {
    const hasRestrictions = checkPreexistingConditionRestrictions(profile);
    const recommendation = generateRecommendation(profile);
    const estimatedBudget = calculateRecommendedBudget(profile.annualIncome);
    
    let allPlans = getAvailablePlans();
    
    // Apply age-based premium adjustments
    allPlans = applyAgePremiumAdjustment(allPlans, profile.age);
    
    // Apply smoker surcharge (typically 20-30% more)
    if (profile.isSmoker) {
        allPlans = allPlans.map(plan => {
            return new InsurancePlan({
                planId: plan.planId,
                name: plan.name,
                planType: plan.planType,
                monthlyPremium: Math.round(plan.monthlyPremium * 1.25),
                deductible: plan.deductible,
                coverageLevel: plan.coverageLevel,
                description: plan.description
            });
        });
    }
    
    const eligiblePlans = filterEligiblePlans(profile, allPlans);
    
    return new EligibilityResult({
        userProfile: profile,
        eligiblePlans: eligiblePlans,
        hasPreexistingConditionRestrictions: hasRestrictions,
        recommendation: recommendation,
        estimatedMonthlyBudget: estimatedBudget
    });
}

module.exports = {
    getAvailablePlans,
    calculateRecommendedBudget,
    checkPreexistingConditionRestrictions,
    generateRecommendation,
    filterEligiblePlans,
    applyAgePremiumAdjustment,
    determineEligibility
};
