const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const InMemoryRepository = require('../repository/InMemoryRepository');
const { determineEligibility, getAvailablePlans } = require('../services/eligibility');

// Single repository instance (could be replaced with dependency injection)
const repository = new InMemoryRepository();

/**
 * Get questionnaire questions
 */
router.get('/questions', (req, res) => {
    const questions = [
        {
            id: 'age',
            type: 'number',
            question: 'What is your age?',
            min: 0,
            max: 120,
            required: true
        },
        {
            id: 'householdSize',
            type: 'number',
            question: 'How many people are in your household (including yourself)?',
            min: 1,
            max: 20,
            required: true
        },
        {
            id: 'annualIncome',
            type: 'number',
            question: 'What is your annual household income ($)?',
            min: 0,
            required: true
        },
        {
            id: 'employmentStatus',
            type: 'choice',
            question: 'What is your employment status?',
            options: ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'],
            required: true
        },
        {
            id: 'state',
            type: 'text',
            question: 'What state do you live in? (e.g., CA, NY, TX)',
            maxLength: 2,
            required: true
        },
        {
            id: 'currentlyInsured',
            type: 'boolean',
            question: 'Do you currently have health insurance?',
            required: true
        },
        {
            id: 'hasPreexistingConditions',
            type: 'boolean',
            question: 'Do you have any pre-existing health conditions?',
            required: true
        },
        {
            id: 'isSmoker',
            type: 'boolean',
            question: 'Do you use tobacco products?',
            required: true
        }
    ];
    
    res.json(questions);
});

/**
 * Submit questionnaire and get eligibility results
 */
router.post('/submit', (req, res) => {
    try {
        const profileData = req.body;
        
        // Basic validation
        if (!profileData.age || !profileData.annualIncome || !profileData.householdSize) {
            return res.status(400).json({ 
                error: 'Missing required fields: age, annualIncome, and householdSize are required' 
            });
        }
        
        const profile = UserProfile.fromDict(profileData);
        const profileId = repository.saveProfile(profile);
        
        const result = determineEligibility(profile);
        repository.saveResult(profileId, result);
        
        res.json({
            profileId: profileId,
            result: result.toDict()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all available plans
 */
router.get('/plans', (req, res) => {
    const plans = getAvailablePlans();
    res.json(plans.map(plan => plan.toDict()));
});

/**
 * Get a saved result by profile ID
 */
router.get('/result/:profileId', (req, res) => {
    const profileId = parseInt(req.params.profileId);
    const result = repository.getResult(profileId);
    
    if (!result) {
        return res.status(404).json({ error: 'Result not found' });
    }
    
    res.json(result.toDict());
});

module.exports = router;
