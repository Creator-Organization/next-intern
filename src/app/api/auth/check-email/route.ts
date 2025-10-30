/**
 * Check Email Availability API Route
 * Internship And Project v2 - Updated for 28-Table Schema
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkEmailExists } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          exists: false,
          available: false
        },
        { status: 400 }
      )
    }

    // Check if email exists in database
    const exists = await checkEmailExists(email)

    return NextResponse.json({
      exists,
      available: !exists,
      email: email.toLowerCase() // Return normalized email
    })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check email availability',
        exists: false,
        available: false
      },
      { status: 500 }
    )
  }
}