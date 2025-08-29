/**
 * User Registration API Route
 * NextIntern - Authentication System
 */

import { NextRequest, NextResponse } from 'next/server'
import { createUserWithProfile } from '@/lib/auth-utils'
import { UserType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType, firstName, lastName, companyName, industry } = body

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

    // Validate user type specific fields
    if (userType === UserType.STUDENT && (!firstName || !lastName)) {
      return NextResponse.json(
        { error: 'First name and last name are required for students' },
        { status: 400 }
      )
    }

    if (userType === UserType.COMPANY && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for companies' },
        { status: 400 }
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
      industry
    })

    if (result.success && result.user) {
      return NextResponse.json(
        { message: 'Account created successfully', userId: result.user.id },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}