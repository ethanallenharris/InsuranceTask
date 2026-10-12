const crypto = require('crypto');

// Encryption key should be stored securely in environment variables in production
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-me!!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Ensure the encryption key is exactly 32 bytes
 * @param {string} key
 * @returns {Buffer}
 */
function getKey(key) {
    // Hash the key to ensure it's exactly 32 bytes
    return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a string value
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData (both hex encoded)
 */
function encrypt(text) {
    if (text === null || text === undefined) {
        return null;
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey(ENCRYPTION_KEY);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted data together, separated by colon
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt an encrypted string value
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedText) {
    if (encryptedText === null || encryptedText === undefined) {
        return null;
    }
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const key = getKey(ENCRYPTION_KEY);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

/**
 * Hash an email for indexing (one-way hash for lookups)
 * @param {string} email
 * @returns {string}
 */
function hashEmail(email) {
    if (!email) return null;
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

module.exports = {
    encrypt,
    decrypt,
    hashEmail
};
