/**
 * In-memory data storage.
 * Replace with SQLRepository when ready to add database support.
 * Implements the Repository interface pattern for easy swapping.
 */
class InMemoryRepository {
    constructor() {
        this.profiles = new Map();
        this.results = new Map();
        this.nextProfileId = 1;
    }

    /**
     * Save a user profile
     * @param {import('../models/UserProfile')} profile
     * @returns {number} The assigned profile ID
     */
    saveProfile(profile) {
        const id = this.nextProfileId++;
        profile.id = id;
        this.profiles.set(id, profile);
        return id;
    }

    /**
     * Get a user profile by ID
     * @param {number} profileId
     * @returns {import('../models/UserProfile')|null}
     */
    getProfile(profileId) {
        return this.profiles.get(profileId) || null;
    }

    /**
     * Save an eligibility result
     * @param {number} profileId
     * @param {import('../models/EligibilityResult')} result
     */
    saveResult(profileId, result) {
        this.results.set(profileId, result);
    }

    /**
     * Get an eligibility result by profile ID
     * @param {number} profileId
     * @returns {import('../models/EligibilityResult')|null}
     */
    getResult(profileId) {
        return this.results.get(profileId) || null;
    }

    /**
     * Get all saved profiles
     * @returns {Array}
     */
    getAllProfiles() {
        return Array.from(this.profiles.values());
    }
}

module.exports = InMemoryRepository;
