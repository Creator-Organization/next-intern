import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT - Approve/Reject/Revoke verification (Admin action)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { instituteId, action, reason } = body

    if (!instituteId || !action) {
      return NextResponse.json(
        { error: 'Institute ID and action required' },
        { status: 400 }
      )
    }

    const institute = await db.institute.findUnique({
      where: { id: instituteId },
      include: { user: true }
    })

    if (!institute) {
      return NextResponse.json(
        { error: 'Institute not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve verification
      await db.institute.update({
        where: { id: instituteId },
        data: {
          isVerified: true,
          verifiedAt: new Date()
        }
      })

      // Create success notification
      await db.notification.create({
        data: {
          userId: institute.userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Institute Verified!',
          message: `Your institute "${institute.instituteName}" has been successfully verified. You now have a verified badge.`,
          actionUrl: '/institute/profile'
        }
      })

      return NextResponse.json({
        message: 'Institute approved successfully',
        institute
      })
    } 
    
    else if (action === 'reject') {
      // Reject verification
      await db.notification.create({
        data: {
          userId: institute.userId,
          type: 'SYSTEM_ALERT',
          title: 'Verification Request Rejected',
          message: `Your verification request was not approved. Reason: ${reason || 'Documents need review'}. Please update and resubmit.`,
          actionUrl: '/institute/profile'
        }
      })

      return NextResponse.json({
        message: 'Institute rejected',
        reason
      })
    } 
    
    else if (action === 'revoke') {
      // Revoke verification
      await db.institute.update({
        where: { id: instituteId },
        data: {
          isVerified: false,
          verifiedAt: null
        }
      })

      // Notify institute
      await db.notification.create({
        data: {
          userId: institute.userId,
          type: 'SYSTEM_ALERT',
          title: 'Verification Revoked',
          message: `Your institute verification has been revoked. Reason: ${reason || 'Under review'}. Please contact support if you have questions.`,
          actionUrl: '/institute/profile'
        }
      })

      return NextResponse.json({
        message: 'Verification revoked successfully',
        institute
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/admin/verify/institute error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}