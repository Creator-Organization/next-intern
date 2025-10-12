import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

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
    const { opportunityId, action, reason } = body

    if (!opportunityId || !action) {
      return NextResponse.json(
        { error: 'Opportunity ID and action required' },
        { status: 400 }
      )
    }

    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
      include: { 
        industry: {
          include: {
            user: true
          }
        }
      }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve opportunity
      await db.opportunity.update({
        where: { id: opportunityId },
        data: {
          isActive: true
        }
      })

      // Notify industry
      await db.notification.create({
        data: {
          userId: opportunity.industry.userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Opportunity Approved',
          message: `Your opportunity "${opportunity.title}" has been approved and is now live.`,
          actionUrl: `/industry/opportunities/${opportunityId}`
        }
      })

      return NextResponse.json({
        message: 'Opportunity approved successfully'
      })
    } 
    
    else if (action === 'reject') {
      // Reject opportunity
      await db.opportunity.update({
        where: { id: opportunityId },
        data: {
          isActive: false
        }
      })

      // Notify industry
      await db.notification.create({
        data: {
          userId: opportunity.industry.userId,
          type: 'SYSTEM_ALERT',
          title: 'Opportunity Rejected',
          message: `Your opportunity "${opportunity.title}" was not approved. Reason: ${reason || 'Does not meet guidelines'}. Please review and resubmit.`,
          actionUrl: `/industry/opportunities/${opportunityId}/edit`
        }
      })

      return NextResponse.json({
        message: 'Opportunity rejected'
      })
    } 
    
    else if (action === 'deactivate') {
      // Deactivate opportunity
      await db.opportunity.update({
        where: { id: opportunityId },
        data: {
          isActive: false
        }
      })

      // Notify industry
      await db.notification.create({
        data: {
          userId: opportunity.industry.userId,
          type: 'SYSTEM_ALERT',
          title: 'Opportunity Deactivated',
          message: `Your opportunity "${opportunity.title}" has been deactivated. Reason: ${reason || 'Under review'}. Contact support for details.`,
          actionUrl: `/industry/opportunities/${opportunityId}`
        }
      })

      return NextResponse.json({
        message: 'Opportunity deactivated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/admin/moderate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}