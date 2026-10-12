const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const SQLRepository = require('../repository/SQLRepository');
const { determineEligibility, getAvailablePlans } = require('../services/eligibility');
const { 
    validateUserData, 
    validateProfileData, 
    sanitizeUserData, 
    sanitizeProfileData 
} = require('../validation/validator');

// Use SQL repository for persistent storage
const repository = new SQLRepository();

/**
 * Get questionnaire questions
 */
router.get('/questions', (req, res) => {
    const questions = [
        // Registration questions
        {
            id: 'firstName',
            type: 'text',
            question: 'What is your first name?',
            required: true,
            maxLength: 50,
            category: 'registration'
        },
        {
            id: 'lastName',
            type: 'text',
            question: 'What is your last name?',
            required: true,
            maxLength: 50,
            category: 'registration'
        },
        {
            id: 'email',
            type: 'email',
            question: 'What is your email address?',
            required: true,
            maxLength: 254,
            category: 'registration'
        },
        {
            id: 'postcode',
            type: 'text',
            question: 'What is your postcode?',
            required: true,
            placeholder: 'e.g. SW1A 1AA',
            category: 'registration'
        },
        // Profile questions
        {
            id: 'age',
            type: 'number',
            question: 'What is your age?',
            min: 18,
            max: 120,
            required: true,
            category: 'profile'
        },
        {
            id: 'householdSize',
            type: 'number',
            question: 'How many people would be covered by this policy (including yourself)?',
            min: 1,
            max: 20,
            required: true,
            category: 'profile'
        },
        {
            id: 'annualIncome',
            type: 'number',
            question: 'What is your annual household income (£)?',
            min: 0,
            required: true,
            category: 'profile'
        },
        {
            id: 'employmentStatus',
            type: 'choice',
            question: 'What is your employment status?',
            options: ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student'],
            required: true,
            category: 'profile'
        },
        {
            id: 'region',
            type: 'choice',
            question: 'Which region of the UK do you live in?',
            options: ['London', 'South East', 'South West', 'East of England', 'West Midlands', 'East Midlands', 'Yorkshire and the Humber', 'North West', 'North East', 'Scotland', 'Wales', 'Northern Ireland'],
            required: true,
            category: 'profile'
        },
        {
            id: 'hasPreexistingConditions',
            type: 'boolean',
            question: 'Do you have any pre-existing health conditions?',
            required: true,
            category: 'profile'
        },
        {
            id: 'isSmoker',
            type: 'boolean',
            question: 'Do you smoke or use tobacco products?',
            required: true,
            category: 'profile'
        },
        {
            id: 'wantsOutpatientCover',
            type: 'boolean',
            question: 'Do you want outpatient cover (consultations, tests, scans)?',
            required: true,
            category: 'profile'
        },
        {
            id: 'wantsMentalHealthCover',
            type: 'boolean',
            question: 'Do you want mental health cover included?',
            required: true,
            category: 'profile'
        },
        {
            id: 'wantsPrivateDental',
            type: 'boolean',
            question: 'Do you want private dental cover included?',
            required: true,
            category: 'profile'
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
        
        // Separate user and profile data
        const rawUserData = {
            firstName: rawData.firstName,
            lastName: rawData.lastName,
            email: rawData.email,
            postcode: rawData.postcode
        };
        
        const rawProfileData = {
            age: rawData.age,
            annualIncome: rawData.annualIncome,
            householdSize: rawData.householdSize,
            employmentStatus: rawData.employmentStatus,
            region: rawData.region,
            hasPreexistingConditions: rawData.hasPreexistingConditions,
            isSmoker: rawData.isSmoker,
            wantsOutpatientCover: rawData.wantsOutpatientCover,
            wantsMentalHealthCover: rawData.wantsMentalHealthCover,
            wantsPrivateDental: rawData.wantsPrivateDental
        };
        
        // Sanitize input data
        const sanitizedUserData = sanitizeUserData(rawUserData);
        const sanitizedProfileData = sanitizeProfileData(rawProfileData);
        
        // Validate user data
        const userValidation = validateUserData(sanitizedUserData);
        if (!userValidation.isValid()) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: userValidation.getErrors()
            });
        }
        
        // Check if email already exists
        if (repository.emailExists(sanitizedUserData.email)) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: [{ field: 'email', message: 'This email address is already registered' }]
            });
        }
        
        // Validate profile data
        const profileValidation = validateProfileData(sanitizedProfileData);
        if (!profileValidation.isValid()) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: profileValidation.getErrors()
            });
        }
        
        // Create and save user (with encrypted fields)
        const user = User.fromDict(sanitizedUserData);
        const userId = repository.saveUser(user);
        
        // Create profile and save to database
        const profile = UserProfile.fromDict({
            ...sanitizedProfileData,
            userId: userId
        });
        const profileId = repository.saveProfile(profile);
        
        // Determine eligibility
        const result = determineEligibility(profile);
        repository.saveResult(profileId, result);
        
        res.json({
            profileId: profileId,
            userId: userId,
            user: user.toSafeDict(),
            result: result.toDict()
        });
    } catch (error) {
        console.error('Error processing submission:', error);
        
        // Check for database constraint violations
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ 
                error: 'This email address is already registered',
                details: [{ field: 'email', message: 'This email address is already registered' }]
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
