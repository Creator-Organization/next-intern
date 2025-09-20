// src/app/api/auth/forgot-password/route.ts
// Updated for 28-Table Schema

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createPasswordResetToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

// Input validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    // Extract IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Parse and validate request body
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 })
    }

    const { email } = validation.data

    // Find user by email - Updated for new schema
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        candidate: { select: { firstName: true, lastName: true } },    // Updated from student
        industry: { select: { companyName: true } },                   // Updated from company
        institute: { select: { instituteName: true } }                // Added institute
      }
    })

    // Security: Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      try {
        // Generate password reset token
        const resetToken = await createPasswordResetToken(user.id)

        // Determine user name for email - Updated for new schema
        let userName = 'User'
        if (user.candidate) {
          userName = `${user.candidate.firstName} ${user.candidate.lastName}`.trim()
        } else if (user.industry) {
          userName = user.industry.companyName
        } else if (user.institute) {
          userName = user.institute.instituteName
        }

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(
          user.email,
          userName,
          resetToken
        )

        if (emailResult.success) {
          // Update last login attempt
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })
          
          console.log(`✅ Password reset email sent successfully to: ${user.email}`)
        } else {
          console.error('❌ Failed to send password reset email:', emailResult.error)
        }
      } catch (error) {
        console.error('Password reset process error:', error)
      }
    } else {
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