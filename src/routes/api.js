const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const SQLRepository = require('../repository/SQLRepository');
const { determineEligibility, getAvailablePlans } = require('../services/eligibility');
const { validateProfileData, sanitizeProfileData } = require('../validation/validator');

// Use SQL repository for persistent storage
const repository = new SQLRepository();

/**
 * Get questionnaire questions
 */
router.get('/questions', (req, res) => {
    const questions = [
        {
            id: 'age',
            type: 'number',
            question: 'What is your age?',
            min: 18,
            max: 120,
            required: true
        },
        {
            id: 'householdSize',
            type: 'number',
            question: 'How many people would be covered by this policy (including yourself)?',
            min: 1,
            max: 20,
            required: true
        },
        {
            id: 'annualIncome',
            type: 'number',
            question: 'What is your annual household income (£)?',
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
            id: 'region',
            type: 'choice',
            question: 'Which region of the UK do you live in?',
            options: ['London', 'South East', 'South West', 'East of England', 'West Midlands', 'East Midlands', 'Yorkshire and the Humber', 'North West', 'North East', 'Scotland', 'Wales', 'Northern Ireland'],
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
            question: 'Do you smoke or use tobacco products?',
            required: true
        },
        {
            id: 'wantsOutpatientCover',
            type: 'boolean',
            question: 'Do you want outpatient cover (consultations, tests, scans)?',
            required: true
        },
        {
            id: 'wantsMentalHealthCover',
            type: 'boolean',
            question: 'Do you want mental health cover included?',
            required: true
        },
        {
            id: 'wantsPrivateDental',
            type: 'boolean',
            question: 'Do you want private dental cover included?',
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
        const rawData = req.body;
        
        // Sanitize input data
        const sanitizedData = sanitizeProfileData(rawData);
        
        // Validate input data
        const validationResult = validateProfileData(sanitizedData);
        
        if (!validationResult.isValid()) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: validationResult.getErrors()
            });
        }
        
        // Create profile and save to database
        const profile = UserProfile.fromDict(sanitizedData);
        const profileId = repository.saveProfile(profile);
        
        // Determine eligibility
        const result = determineEligibility(profile);
        repository.saveResult(profileId, result);
        
        res.json({
            profileId: profileId,
            result: result.toDict()
        });
    } catch (error) {
        console.error('Error processing submission:', error);
        
        // Check for database constraint violations
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ 
                error: 'Invalid data provided',
                details: [{ field: 'unknown', message: 'Data validation failed' }]
            });
        }
        
        res.status(500).json({ error: 'An error occurred processing your request' });
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
    try {
        const profileId = parseInt(req.params.profileId);
        
        if (isNaN(profileId) || profileId < 1) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }
        
        const result = repository.getResult(profileId);
        
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }
        
        res.json(result.toDict());
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ error: 'An error occurred fetching the result' });
    }
});

/**
 * Get a saved profile by ID
 */
router.get('/profile/:profileId', (req, res) => {
    try {
        const profileId = parseInt(req.params.profileId);
        
        if (isNaN(profileId) || profileId < 1) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }
        
        const profile = repository.getProfile(profileId);
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(profile.toDict());
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'An error occurred fetching the profile' });
    }
});

/**
 * Get all profiles (admin endpoint)
 */
router.get('/profiles', (req, res) => {
    try {
        const profiles = repository.getAllProfiles();
        res.json(profiles.map(p => p.toDict()));
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'An error occurred fetching profiles' });
    }
});

module.exports = router;
