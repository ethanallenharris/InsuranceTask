const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const FamilyMember = require('../models/FamilyMember');
const SQLRepository = require('../repository/SQLRepository');
const { determineEligibility, getAvailablePlans } = require('../services/eligibility');
const { 
    validateUserData, 
    validateProfileData,
    validateFamilyMemberData,
    sanitizeUserData, 
    sanitizeProfileData,
    sanitizeFamilyMemberData
} = require('../validation/validator');

// Use SQL repository for persistent storage
let repository = null;

function getRepository() {
    if (!repository) {
        repository = new SQLRepository();
    }
    return repository;
}

/**
 * Check if email already exists
 */
router.post('/check-email', (req, res) => {
    try {
        const repo = getRepository();
        const { email } = req.body;
        
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const sanitizedEmail = email.toLowerCase().trim();
        const exists = repo.emailExists(sanitizedEmail);
        
        res.json({ exists });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'An error occurred checking the email' });
    }
});

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
        },
        // Family questions
        {
            id: 'hasSpouse',
            type: 'boolean',
            question: 'Do you want to include a spouse/partner on this policy?',
            required: true,
            category: 'family'
        },
        {
            id: 'numberOfChildren',
            type: 'number',
            question: 'How many children do you want to include on this policy? (Enter 0 if none)',
            min: 0,
            max: 10,
            required: true,
            placeholder: '0',
            category: 'family'
        },
        // Spouse questions (conditional - shown if hasSpouse is true)
        {
            id: 'spouseFirstName',
            type: 'text',
            question: "What is your spouse/partner's first name?",
            required: true,
            maxLength: 50,
            category: 'spouse',
            conditional: { field: 'hasSpouse', value: true }
        },
        {
            id: 'spouseLastName',
            type: 'text',
            question: "What is your spouse/partner's last name?",
            required: true,
            maxLength: 50,
            category: 'spouse',
            conditional: { field: 'hasSpouse', value: true }
        },
        {
            id: 'spouseDateOfBirth',
            type: 'date',
            question: "What is your spouse/partner's date of birth?",
            required: true,
            category: 'spouse',
            conditional: { field: 'hasSpouse', value: true }
        },
        {
            id: 'spouseHasPreexistingConditions',
            type: 'boolean',
            question: 'Does your spouse/partner have any pre-existing health conditions?',
            required: true,
            category: 'spouse',
            conditional: { field: 'hasSpouse', value: true }
        }
    ];
    
    res.json(questions);
});

/**
 * Submit questionnaire and get eligibility results
 */
router.post('/submit', (req, res) => {
    try {
        const repo = getRepository();
        const rawData = req.body;
        
        // Separate user and profile data
        const rawUserData = {
            firstName: rawData.firstName,
            lastName: rawData.lastName,
            email: rawData.email,
            postcode: rawData.postcode
        };
        
        // Calculate household size from family members
        const numberOfChildren = rawData.numberOfChildren || 0;
        const hasSpouse = rawData.hasSpouse || false;
        const householdSize = 1 + (hasSpouse ? 1 : 0) + numberOfChildren;
        
        const rawProfileData = {
            age: rawData.age,
            annualIncome: rawData.annualIncome,
            householdSize: householdSize,
            employmentStatus: rawData.employmentStatus,
            hasPreexistingConditions: rawData.hasPreexistingConditions,
            isSmoker: rawData.isSmoker,
            wantsOutpatientCover: rawData.wantsOutpatientCover,
            wantsMentalHealthCover: rawData.wantsMentalHealthCover,
            wantsPrivateDental: rawData.wantsPrivateDental,
            hasSpouse: hasSpouse,
            numberOfChildren: numberOfChildren
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
        
        // Check if email already exists BEFORE any other database operations
        if (repo.emailExists(sanitizedUserData.email)) {
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
        
        // Validate and prepare family members
        const familyMembers = [];
        
        // Validate spouse if included
        if (hasSpouse) {
            const rawSpouseData = {
                relationship: 'spouse',
                firstName: rawData.spouseFirstName,
                lastName: rawData.spouseLastName,
                dateOfBirth: rawData.spouseDateOfBirth,
                hasPreexistingConditions: rawData.spouseHasPreexistingConditions || false
            };
            
            const spouseValidation = validateFamilyMemberData(rawSpouseData, 0);
            if (!spouseValidation.isValid()) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: spouseValidation.getErrors()
                });
            }
            
            familyMembers.push(sanitizeFamilyMemberData(rawSpouseData));
        }
        
        // Validate children if included
        for (let i = 0; i < numberOfChildren; i++) {
            const rawChildData = {
                relationship: 'child',
                firstName: rawData[`child${i}FirstName`],
                lastName: rawData[`child${i}LastName`],
                dateOfBirth: rawData[`child${i}DateOfBirth`],
                hasPreexistingConditions: rawData[`child${i}HasPreexistingConditions`] || false
            };
            
            const childValidation = validateFamilyMemberData(rawChildData, i);
            if (!childValidation.isValid()) {
                return res.status(400).json({ 
                    error: 'Validation failed',
                    details: childValidation.getErrors()
                });
            }
            
            familyMembers.push(sanitizeFamilyMemberData(rawChildData));
        }
        
        // Create and save user (with encrypted fields)
        const user = User.fromDict(sanitizedUserData);
        const userId = repo.saveUser(user);
        
        // Save family members
        if (familyMembers.length > 0) {
            const familyMemberObjects = familyMembers.map(fm => FamilyMember.fromDict(fm));
            repo.saveFamilyMembers(userId, familyMemberObjects);
        }
        
        // Create profile and save to database
        const profile = UserProfile.fromDict({
            ...sanitizedProfileData,
            userId: userId
        });
        const profileId = repo.saveProfile(profile);
        
        // Determine eligibility
        const result = determineEligibility(profile);
        repo.saveResult(profileId, result);
        
        // Get saved family members for response
        const savedFamilyMembers = repo.getFamilyMembersByUserId(userId);
        
        res.json({
            profileId: profileId,
            userId: userId,
            user: user.toSafeDict(),
            familyMembers: savedFamilyMembers.map(fm => fm.toSafeDict()),
            result: result.toDict()
        });
    } catch (error) {
        console.error('Error processing submission:', error);
        
        // Check for database constraint violations
        if (error.message && (error.message.includes('UNIQUE constraint failed') || error.message.includes('email_hash'))) {
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
        const repo = getRepository();
        const profileId = parseInt(req.params.profileId);
        
        if (isNaN(profileId) || profileId < 1) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }
        
        const result = repo.getResult(profileId);
        
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
        const repo = getRepository();
        const profileId = parseInt(req.params.profileId);
        
        if (isNaN(profileId) || profileId < 1) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }
        
        const profile = repo.getProfile(profileId);
        
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
 * Get family members for a user
 */
router.get('/user/:userId/family', (req, res) => {
    try {
        const repo = getRepository();
        const userId = parseInt(req.params.userId);
        
        if (isNaN(userId) || userId < 1) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const familyMembers = repo.getFamilyMembersByUserId(userId);
        
        res.json(familyMembers.map(fm => fm.toDict()));
    } catch (error) {
        console.error('Error fetching family members:', error);
        res.status(500).json({ error: 'An error occurred fetching family members' });
    }
});

/**
 * Get all profiles (admin endpoint)
 */
router.get('/profiles', (req, res) => {
    try {
        const repo = getRepository();
        const profiles = repo.getAllProfiles();
        res.json(profiles.map(p => p.toDict()));
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'An error occurred fetching profiles' });
    }
});

module.exports = router;
