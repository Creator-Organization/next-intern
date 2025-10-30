/**
 * Test Login API Route for Debugging
 * Internship And Project - Authentication System
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Testing login for:', email)

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        student: true,
        company: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      userType: user.userType,
      hasPassword: !!user.passwordHash
    })

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'No password set for user' }, { status: 400 })
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isValid)

    return NextResponse.json({
      userFound: true,
      passwordValid: isValid,
      userType: user.userType,
      userId: user.id
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}