/**
 * Check Email Availability API Route
 * NextIntern - Authentication System
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

    const exists = await checkEmailExists(email)
    
    return NextResponse.json({
      exists,
      available: !exists
    })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    )
  }
}