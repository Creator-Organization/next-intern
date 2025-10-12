import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ✅ FIX: Use const instead of let
const settingsStore = {
  platform: {
    siteName: 'NextIntern 2.0',
    platformTagline: 'Privacy-focused internship marketplace',
    supportEmail: 'support@nextintern.com',
    emailNotifications: true,
    newUserRegistration: true,
    maintenanceMode: false
  },
  pricing: {
    candidatePremiumMonthly: 1999,
    industryPremiumMonthly: 4999,
    freeIndustryPosts: 3
  },
  security: {
    sessionTimeout: 60,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    twoFactorAuth: true,
    googleOAuth: true
  },
  compliance: {
    termsVersion: '1.0',
    privacyPolicyVersion: '1.0',
    dataRetentionPeriod: 90,
    auditLogging: true,
    gdprCompliance: true
  }
}

// GET - Fetch current settings
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: settingsStore
    })
  } catch (error) {
    console.error('GET /api/admin/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json(
        { error: 'Category and settings required' },
        { status: 400 }
      )
    }

    // Update settings
    if (settingsStore[category as keyof typeof settingsStore]) {
      Object.assign(
        settingsStore[category as keyof typeof settingsStore],
        settings
      )
    }

    // ✅ FIX: Create audit log with valid action type
    try {
      await db.privacyAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE', // ✅ Valid AuditAction
          resourceType: 'SETTINGS',
          resourceId: category,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: `Updated ${category} settings`
        }
      })
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.error('Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: settingsStore[category as keyof typeof settingsStore]
    })
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}