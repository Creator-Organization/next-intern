// src/lib/email.ts
// Updated for 28-Table Schema

import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const EMAIL_CONFIG = {
    from: 'Internship And Project <onboarding@resend.dev>',
    baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
} as const

// Email templates - Updated for new user types
const EMAIL_TEMPLATES = {
    passwordReset: {
        subject: 'Reset Your Internship And Project Password',
        getHtml: (resetUrl: string, userName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Inter, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0891b2; margin: 0; font-size: 28px; font-weight: 700;">Internship And Project</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Your Gateway to Amazing Opportunities</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border-left: 4px solid #0891b2;">
          <h2 style="color: #334155; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
          
          <p style="margin: 0 0 20px 0; color: #475569;">
            Hello ${userName},
          </p>
          
          <p style="margin: 0 0 20px 0; color: #475569;">
            We received a request to reset your password for your Internship And Project account. If you didn't request this, you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #0891b2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px;">
            This link will expire in 15 minutes for security reasons.
          </p>
          
          <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">
            If the button doesn't work, copy and paste this link: <br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent by Internship And Project. If you have any questions, contact us at support@Internship And Project.com
          </p>
        </div>
      </body>
      </html>
    `
    },

    emailVerification: {
        subject: 'Verify Your Internship And Project Email Address',
        getHtml: (verifyUrl: string, userName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Inter, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0891b2; margin: 0; font-size: 28px; font-weight: 700;">Internship And Project</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Your Gateway to Amazing Opportunities</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 30px; border-radius: 12px; border-left: 4px solid #0891b2;">
          <h2 style="color: #334155; margin: 0 0 20px 0; font-size: 24px;">Welcome to Internship And Project!</h2>
          
          <p style="margin: 0 0 20px 0; color: #475569;">
            Hello ${userName},
          </p>
          
          <p style="margin: 0 0 20px 0; color: #475569;">
            Thank you for joining Internship And Project! To complete your registration and start exploring amazing opportunities, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: #0891b2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px;">
            This link will expire in 24 hours for security reasons.
          </p>
          
          <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">
            If the button doesn't work, copy and paste this link: <br>
            <span style="word-break: break-all;">${verifyUrl}</span>
          </p>
        </div>
        
        <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eab308;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What's Next?</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li>Complete your profile</li>
            <li>Browse thousands of opportunities</li>
            <li>Connect with top companies</li>
            <li>Start your career journey</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            This email was sent by Internship And Project. If you have any questions, contact us at support@Internship And Project.com
          </p>
        </div>
      </body>
      </html>
    `
    },

    welcomeEmail: {
        subject: 'Welcome to Internship And Project - Your Journey Starts Now!',
        getHtml: (userName: string, userType: 'candidate' | 'industry' | 'institute') => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Internship And Project</title>
      </head>
      <body style="font-family: Inter, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0891b2; margin: 0; font-size: 28px; font-weight: 700;">Internship And Project</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Your Gateway to Amazing Opportunities</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 26px;">Welcome to Internship And Project!</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">
            Hello ${userName}, your email has been verified successfully!
          </p>
        </div>
        
        ${userType === 'candidate' ? `
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #334155; margin: 0 0 15px 0;">Ready to Launch Your Career?</h3>
          <p style="color: #475569; margin: 0 0 15px 0;">
            As a candidate on Internship And Project, you now have access to thousands of opportunities from top companies.
          </p>
          <ul style="color: #475569; margin: 0; padding-left: 20px;">
            <li>Browse opportunities by location, skills, and stipend</li>
            <li>Apply with one-click using your profile</li>
            <li>Track your applications in real-time</li>
            <li>Get direct messages from recruiters</li>
          </ul>
        </div>
        ` : userType === 'industry' ? `
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #334155; margin: 0 0 15px 0;">Find Your Next Great Talent</h3>
          <p style="color: #475569; margin: 0 0 15px 0;">
            As a company on Internship And Project, you can now connect with talented candidates from top universities.
          </p>
          <ul style="color: #475569; margin: 0; padding-left: 20px;">
            <li>Post opportunities in minutes</li>
            <li>Review applications with smart filtering</li>
            <li>Schedule interviews seamlessly</li>
            <li>Access a pool of pre-screened candidates</li>
          </ul>
        </div>
        ` : `
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #334155; margin: 0 0 15px 0;">Manage Your Student Community</h3>
          <p style="color: #475569; margin: 0 0 15px 0;">
            As an educational institute on Internship And Project, you can support your students' career development.
          </p>
          <ul style="color: #475569; margin: 0; padding-left: 20px;">
            <li>Track student placement progress</li>
            <li>Partner with top companies</li>
            <li>Manage student portfolios</li>
            <li>Generate placement reports</li>
          </ul>
        </div>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${EMAIL_CONFIG.baseUrl}/${userType}" 
             style="background: #0891b2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            ${userType === 'candidate' ? 'Explore Opportunities' : 
              userType === 'industry' ? 'Post Your First Opportunity' : 
              'Manage Students'}
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Need help getting started? Check out our <a href="${EMAIL_CONFIG.baseUrl}/help" style="color: #0891b2;">Help Center</a> or contact us at support@Internship And Project.com
          </p>
        </div>
      </body>
      </html>
    `
    }
}

// Send password reset email
export async function sendPasswordResetEmail(
    email: string,
    userName: string,
    resetToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const resetUrl = `${EMAIL_CONFIG.baseUrl}/auth/reset-password?token=${resetToken}`

        const { data, error } = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: email,
            subject: EMAIL_TEMPLATES.passwordReset.subject,
            html: EMAIL_TEMPLATES.passwordReset.getHtml(resetUrl, userName)
        })

        if (error) {
            console.error('Password reset email error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to send password reset email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Send email verification email
export async function sendEmailVerificationEmail(
    email: string,
    userName: string,
    verificationToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const verifyUrl = `${EMAIL_CONFIG.baseUrl}/auth/verify-email?token=${verificationToken}`

        const { data, error } = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: email,
            subject: EMAIL_TEMPLATES.emailVerification.subject,
            html: EMAIL_TEMPLATES.emailVerification.getHtml(verifyUrl, userName)
        })

        if (error) {
            console.error('Email verification error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to send verification email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Send welcome email after verification - Updated for new user types
export async function sendWelcomeEmail(
    email: string,
    userName: string,
    userType: 'candidate' | 'industry' | 'institute'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to: email,
            subject: EMAIL_TEMPLATES.welcomeEmail.subject,
            html: EMAIL_TEMPLATES.welcomeEmail.getHtml(userName, userType)
        })

        if (error) {
            console.error('Welcome email error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Validate email configuration
export function validateEmailConfig(): { isValid: boolean; missingVars: string[] } {
    const requiredVars = ['RESEND_API_KEY', 'NEXTAUTH_URL']
    const missingVars = requiredVars.filter(varName => !process.env[varName])

    return {
        isValid: missingVars.length === 0,
        missingVars
    }
}

// Email utilities
export const EmailUtils = {
    // Test email configuration
    async testEmailConfig(): Promise<boolean> {
        try {
            const { data, error } = await resend.emails.send({
                from: EMAIL_CONFIG.from,
                to: 'test@example.com',
                subject: 'Test Email Configuration',
                html: '<p>This is a test email to verify configuration.</p>'
            })

            return true
        } catch (error) {
            console.error('Email configuration test failed:', error)
            return false
        }
    },

    // Sanitize email for logging
    sanitizeEmailForLog(email: string): string {
        const [local, domain] = email.split('@')
        if (local.length <= 2) return `${local}@${domain}`
        return `${local.slice(0, 2)}***@${domain}`
    }
}