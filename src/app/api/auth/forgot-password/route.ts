// src/app/api/auth/forgot-password/route.ts
// Forgot Password API - Phase 2 Day 5 (TEMPORARY: Rate limiting disabled for testing)

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { 
  getClientIP,
  logSecurityEvent, 
  SecurityEventTypes 
} from '@/lib/security'

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Rate limiting disabled for testing
    // const security = await validateSecurityContext(request, 'passwordReset')
    // 
    // if (!security.allowed) {
    //   return NextResponse.json({
    //     error: 'Too many password reset attempts. Please try again later.',
    //     retryAfter: security.rateLimit.resetTime
    //   }, { status: 429 })
    // }

    // Extract IP and user agent for logging
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // 2. Parse and validate request body
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_REQUESTED, {
        ipAddress,
        userAgent,
        success: false,
        details: { error: 'Invalid input', issues: validation.error.issues }
      })
      
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 })
    }

    const { email } = validation.data

    // 3. Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        student: { select: { firstName: true, lastName: true } },
        company: { select: { companyName: true } }
      }
    })

    // Security: Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      try {
        // 4. Generate password reset token
        const resetToken = await createPasswordResetToken(user.id)

        // 5. Determine user name for email
        let userName = 'User'
        if (user.student) {
          userName = `${user.student.firstName} ${user.student.lastName}`.trim()
        } else if (user.company) {
          userName = user.company.companyName
        }

        // 6. Send password reset email
        const emailResult = await sendPasswordResetEmail(
          user.email,
          userName,
          resetToken
        )

        if (emailResult.success) {
          // Log successful password reset request
          await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_REQUESTED, {
            userId: user.id,
            ipAddress,
            userAgent,
            success: true,
            details: { email: user.email }
          })
          
          console.log(`✅ Password reset email sent successfully to: ${user.email}`)
        } else {
          // Log email sending failure
          await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_REQUESTED, {
            userId: user.id,
            ipAddress,
            userAgent,
            success: false,
            details: { 
              email: user.email, 
              emailError: emailResult.error 
            }
          })

          console.error('❌ Failed to send password reset email:', emailResult.error)
        }
      } catch (error) {
        console.error('Password reset process error:', error)
        
        await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_REQUESTED, {
          userId: user.id,
          ipAddress,
          userAgent,
          success: false,
          details: { 
            email: user.email, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        })
      }
    } else {
      // Log attempt for non-existent email
      await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_REQUESTED, {
        ipAddress,
        userAgent,
        success: false,
        details: { 
          email: email,
          reason: 'User not found'
        }
      })
      
      console.log(`⚠️ Password reset attempted for non-existent email: ${email}`)
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
      success: true
    })

  } catch (error) {
    console.error('Forgot password API error:', error)
    
    return NextResponse.json({
      error: 'Internal server error. Please try again later.'
    }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}