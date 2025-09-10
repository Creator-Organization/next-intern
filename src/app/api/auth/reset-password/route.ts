// src/app/api/auth/reset-password/route.ts
// Reset Password API - Phase 2 Day 5

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { 
  validatePasswordResetToken, 
  consumePasswordResetToken 
} from '@/lib/tokens'
import { 
  logSecurityEvent, 
  SecurityEventTypes,
  getClientIP
} from '@/lib/security'

// Input validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
)

export async function POST(request: NextRequest) {
  try {
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // 1. Parse and validate request body
    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_COMPLETED, {
        ipAddress,
        userAgent,
        success: false,
        details: { 
          error: 'Invalid input', 
          issues: validation.error.issues 
        }
      })
      
      return NextResponse.json({
        error: 'Invalid input',
        details: validation.error.issues
      }, { status: 400 })
    }

    const { token, password } = validation.data

    // 2. Validate reset token
    const userId = await validatePasswordResetToken(token)
    
    if (!userId) {
      await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_COMPLETED, {
        ipAddress,
        userAgent,
        success: false,
        details: { 
          error: 'Invalid or expired token',
          token: token.substring(0, 8) + '...' // Log partial token for debugging
        }
      })
      
      return NextResponse.json({
        error: 'Invalid or expired reset token. Please request a new password reset.'
      }, { status: 400 })
    }

    // 3. Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!user) {
      await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_COMPLETED, {
        ipAddress,
        userAgent,
        success: false,
        details: { error: 'User not found', userId }
      })
      
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // 4. Hash the new password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 5. Update user password and reset security fields
    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        loginAttempts: 0,  // Reset failed login attempts
        lockedUntil: null, // Unlock account if it was locked
        updatedAt: new Date()
      }
    })

    // 6. Consume the reset token (delete it)
    await consumePasswordResetToken(token)

    // 7. Log successful password reset
    await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_COMPLETED, {
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
      details: { email: user.email }
    })

    console.log(`Password reset completed for user: ${user.email}`)

    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.',
      success: true
    })

  } catch (error) {
    console.error('Reset password API error:', error)
    
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    
    await logSecurityEvent(SecurityEventTypes.PASSWORD_RESET_COMPLETED, {
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