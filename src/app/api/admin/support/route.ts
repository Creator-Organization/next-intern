import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all tickets
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [open, inProgress, resolved, closed] = await Promise.all([
      db.supportTicket.findMany({
        where: { status: 'OPEN' },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      db.supportTicket.findMany({
        where: { status: 'IN_PROGRESS' },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      db.supportTicket.findMany({
        where: { status: 'RESOLVED' },
        include: { user: { select: { email: true } } },
        orderBy: { resolvedAt: 'desc' },
        take: 20
      }),
      db.supportTicket.findMany({
        where: { status: 'CLOSED' },
        include: { user: { select: { email: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })
    ])

    return NextResponse.json({
      success: true,
      open,
      inProgress,
      resolved,
      closed
    })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

// PUT - Update ticket status
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
    const { ticketId, action, response } = body

    if (!ticketId || !action) {
      return NextResponse.json(
        { error: 'Ticket ID and action required' },
        { status: 400 }
      )
    }

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    if (action === 'take_action') {
      // Move to in progress
      await db.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'IN_PROGRESS',
          assignedTo: session.user.id
        }
      })

      // Notify user
      await db.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SYSTEM_ALERT',
          title: 'Support Ticket Update',
          message: `Your support ticket "${ticket.subject}" is being reviewed by our team.`,
          actionUrl: `/help`
        }
      })

      return NextResponse.json({
        message: 'Ticket moved to in progress'
      })
    }

    if (action === 'resolve') {
      // Resolve ticket
      await db.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          response: response || 'Issue resolved',
          assignedTo: session.user.id
        }
      })

      // Notify user
      await db.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Ticket Resolved',
          message: `Your support ticket "${ticket.subject}" has been resolved.${response ? '\n\nResponse: ' + response : ''}`,
          actionUrl: `/help`
        }
      })

      return NextResponse.json({
        message: 'Ticket resolved successfully'
      })
    }

    if (action === 'close') {
      // Close ticket
      await db.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'CLOSED'
        }
      })

      return NextResponse.json({
        message: 'Ticket closed'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PUT /api/admin/support error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}