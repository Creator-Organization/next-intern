/**
 * User Registration API Route
 * Internship And Project v2 - Updated with T&C Tracking
 */
import { NextRequest, NextResponse } from 'next/server'
import { createUserWithProfile } from '@/lib/auth-utils'
import { UserType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      userType,
      firstName,
      lastName,
      companyName,
      industry,
      instituteName,
      instituteType,
      affiliatedUniversity
    } = body

    // Basic validation
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate user type specific fields
    if (userType === UserType.CANDIDATE && (!firstName || !lastName)) {
      return NextResponse.json(
        { error: 'First name and last name are required for candidates' },
        { status: 400 }
      )
    }

    if (userType === UserType.INDUSTRY && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for companies' },
        { status: 400 }
      )
    }

    if (userType === UserType.INSTITUTE && !instituteName) {
      return NextResponse.json(
        { error: 'Institute name is required for institutes' },
        { status: 400 }
      )
    }

    // Admin registration should be restricted
    if (userType === UserType.ADMIN) {
      return NextResponse.json(
        { error: 'Admin registration is not allowed through this endpoint' },
        { status: 403 }
      )
    }

    // Create user with profile
    const result = await createUserWithProfile({
      email,
      password,
      userType,
      firstName,
      lastName,
      companyName,
      industry,
      instituteName,
      instituteType
    })

    if (result.success && result.user) {
      // IMPORTANT: Return hasAcceptedTerms flag
      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully',
          userId: result.user.id,
          userType: result.user.userType,
          hasAcceptedTerms: result.user.hasAcceptedTerms || false, // NEW: Include T&C status
          email: result.user.email
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to create account' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email address is already registered' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}