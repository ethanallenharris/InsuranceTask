const nodemailer = require('nodemailer');

// Configure transporter - uses environment variables for configuration
// For Gmail: set EMAIL_HOST=smtp.gmail.com, EMAIL_USER, EMAIL_PASS (app password)
// For SendGrid: set SENDGRID_API_KEY
// For other SMTP: set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
// For development/testing without config, it will log to console
const createTransporter = () => {
    // SendGrid configuration
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }
    
    // Gmail configuration (use with App Password)
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    // Generic SMTP configuration
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    
    // For development - log emails to console instead of sending
    return null;
};

/**
 * Send a confirmation email to the user that their request is being processed
 * @param {import('../models/User')} user - The user to email
 * @param {import('../models/UserProfile')} profile - The user's profile with claim details
 * @returns {Promise<boolean>} - True if email was sent successfully
 */
async function sendProcessingConfirmationEmail(user, profile) {
    const transporter = createTransporter();
    
    const emailContent = buildEmailContent(user, profile);
    
    if (!transporter) {
        // Development mode - log to console
        console.log('=== EMAIL (Development Mode) ===');
        console.log('To send real emails, configure Gmail:');
        console.log('  EMAIL_HOST=smtp.gmail.com');
        console.log('  EMAIL_USER=your.email@gmail.com');
        console.log('  EMAIL_PASS=your-app-password');
        console.log(`To: ${user.email}`);
        console.log(`Subject: ${emailContent.subject}`);
        console.log('Body:');
        console.log(emailContent.text);
        console.log('================================');
        return true;
    }
    
    try {
        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        
        await transporter.sendMail({
            from: fromAddress,
            to: user.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        });
        
        console.log(`Confirmation email sent to ${user.email}`);
        return true;
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
        return false;
    }
}

/**
 * Build the email content with user and profile details
 * @param {import('../models/User')} user
 * @param {import('../models/UserProfile')} profile
 * @returns {{subject: string, text: string, html: string}}
 */
function buildEmailContent(user, profile) {
    const subject = 'Your Health Insurance Request is Being Processed';
    
    const claimDetails = formatClaimDetails(user, profile);
    
    const text = `
Dear ${user.firstName} ${user.lastName},

Thank you for submitting your health insurance request. We are pleased to confirm that your request is now being processed.

YOUR REQUEST DETAILS
====================

Personal Information:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Postcode: ${user.postcode}

Profile Information:
${claimDetails}

WHAT HAPPENS NEXT
=================

1. Our team will review your request within 2-3 business days.
2. You will receive an email notification once a decision has been made.
3. If we need any additional information, we will contact you at this email address.

Your current request status: REFERRED (Under Review)

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The Health Insurance Team

---
This is an automated message. Please do not reply directly to this email.
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details-box { background-color: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .details-box h3 { margin-top: 0; color: #0066cc; }
        .detail-row { padding: 5px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .status { display: inline-block; background-color: #ff9800; color: white; padding: 5px 15px; border-radius: 3px; font-weight: bold; }
        .next-steps { background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Health Insurance Request Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear ${user.firstName} ${user.lastName},</p>
            <p>Thank you for submitting your health insurance request. We are pleased to confirm that your request is now being processed.</p>
            
            <div class="details-box">
                <h3>Personal Information</h3>
                <div class="detail-row"><span class="label">Name:</span> ${user.firstName} ${user.lastName}</div>
                <div class="detail-row"><span class="label">Email:</span> ${user.email}</div>
                <div class="detail-row"><span class="label">Postcode:</span> ${user.postcode}</div>
            </div>
            
            <div class="details-box">
                <h3>Profile Information</h3>
                <div class="detail-row"><span class="label">Age:</span> ${profile.age}</div>
                <div class="detail-row"><span class="label">Annual Income:</span> £${profile.annualIncome.toLocaleString()}</div>
                <div class="detail-row"><span class="label">Employment Status:</span> ${profile.employmentStatus}</div>
                <div class="detail-row"><span class="label">Household Size:</span> ${profile.householdSize}</div>
                <div class="detail-row"><span class="label">Pre-existing Conditions:</span> ${profile.hasPreexistingConditions ? 'Yes' : 'No'}</div>
                <div class="detail-row"><span class="label">Smoker:</span> ${profile.isSmoker ? 'Yes' : 'No'}</div>
                <div class="detail-row"><span class="label">Has NHS Dentist:</span> ${profile.hasNhsDentist === null ? 'Not specified' : (profile.hasNhsDentist ? 'Yes' : 'No')}</div>
                <div class="detail-row"><span class="label">Wants Private Dental:</span> ${profile.wantsPrivateDental ? 'Yes' : 'No'}</div>
                <div class="detail-row"><span class="label">Wants Outpatient Cover:</span> ${profile.wantsOutpatientCover ? 'Yes' : 'No'}</div>
                <div class="detail-row"><span class="label">Wants Mental Health Cover:</span> ${profile.wantsMentalHealthCover ? 'Yes' : 'No'}</div>
            </div>
            
            <p><strong>Current Status:</strong> <span class="status">REFERRED (Under Review)</span></p>
            
            <div class="next-steps">
                <h3>What Happens Next</h3>
                <ol>
                    <li>Our team will review your request within 2-3 business days.</li>
                    <li>You will receive an email notification once a decision has been made.</li>
                    <li>If we need any additional information, we will contact you at this email address.</li>
                </ol>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Health Insurance Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
`;

    return { subject, text, html };
}

/**
 * Format claim details for plain text email
 * @param {import('../models/User')} user
 * @param {import('../models/UserProfile')} profile
 * @returns {string}
 */
function formatClaimDetails(user, profile) {
    const details = [
        `- Age: ${profile.age}`,
        `- Annual Income: £${profile.annualIncome.toLocaleString()}`,
        `- Employment Status: ${profile.employmentStatus}`,
        `- Household Size: ${profile.householdSize}`,
        `- Pre-existing Conditions: ${profile.hasPreexistingConditions ? 'Yes' : 'No'}`,
        `- Smoker: ${profile.isSmoker ? 'Yes' : 'No'}`,
        `- Has NHS Dentist: ${profile.hasNhsDentist === null ? 'Not specified' : (profile.hasNhsDentist ? 'Yes' : 'No')}`,
        `- Wants Private Dental: ${profile.wantsPrivateDental ? 'Yes' : 'No'}`,
        `- Wants Outpatient Cover: ${profile.wantsOutpatientCover ? 'Yes' : 'No'}`,
        `- Wants Mental Health Cover: ${profile.wantsMentalHealthCover ? 'Yes' : 'No'}`
    ];
    
    return details.join('\n');
}

module.exports = {
    sendProcessingConfirmationEmail
};
