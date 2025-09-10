// src/app/api/auth/verify-email/route.ts
// Email Verification API - Phase 2 Day 5

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { 
  validateEmailVerificationToken, 
  consumeEmailVerificationToken 
} from '@/lib/tokens'
import { sendWelcomeEmail } from '@/lib/email'
import { 
  logSecurityEvent, 
  SecurityEventTypes,
  getClientIP
} from '@/lib/security'

// Input validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // 1. Parse and validate request body
    const body = await request.json()
    const validation = verifyEmailSchema.safeParse(body)
    
    if (!validation.success) {
      await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
        ipAddress,
        userAgent,
        success: false,
        details: { 
          error: 'Invalid input', 
          issues: validation.error.issues 
        }
      })
      
      return NextResponse.json({
        error: 'Invalid verification token'
      }, { status: 400 })
    }

    const { token } = validation.data

    // 2. Validate verification token
    const userId = await validateEmailVerificationToken(token)
    
    if (!userId) {
      await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
        ipAddress,
        userAgent,
        success: false,
        details: { 
          error: 'Invalid or expired token',
          token: token.substring(0, 8) + '...'
        }
      })
      
      return NextResponse.json({
        error: 'Invalid or expired verification token. Please request a new verification email.'
      }, { status: 400 })
    }

    // 3. Get user details with profile information
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        student: { select: { firstName: true, lastName: true } },
        company: { select: { companyName: true } }
      }
    })

    if (!user) {
      await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
        ipAddress,
        userAgent,
        success: false,
        details: { error: 'User not found', userId }
      })
      
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // 4. Check if already verified
    if (user.isVerified) {
      await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
        userId: user.id,
        ipAddress,
        userAgent,
        success: false,
        details: { 
          error: 'Already verified',
          email: user.email 
        }
      })
      
      return NextResponse.json({
        message: 'Email is already verified. You can log in to your account.',
        alreadyVerified: true
      })
    }

    // 5. Update user verification status
    await db.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // 6. Consume the verification token (delete it)
    await consumeEmailVerificationToken(token)

    // 7. Determine user type and name for welcome email
    let userName = 'User'
    let userType: 'student' | 'company' = 'student'
    
    if (user.student) {
      userName = `${user.student.firstName} ${user.student.lastName}`.trim()
      userType = 'student'
    } else if (user.company) {
      userName = user.company.companyName
      userType = 'company'
    }

    // 8. Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(
        user.email,
        userName,
        userType
      )

      if (!emailResult.success) {
        console.error('Failed to send welcome email:', emailResult.error)
      }
    } catch (error) {
      console.error('Welcome email error:', error)
    }

    // 9. Log successful email verification
    await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
      details: { 
        email: user.email,
        userType: user.userType
      }
    })

    console.log(`Email verified for user: ${user.email} (${user.userType})`)

    return NextResponse.json({
      message: 'Email verified successfully! Welcome to NextIntern.',
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isVerified: true
      }
    })

  } catch (error) {
    console.error('Verify email API error:', error)
    
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    await logSecurityEvent(SecurityEventTypes.EMAIL_VERIFIED, {
      ipAddress,
      userAgent,
      success: false,
      details: { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    })
    
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