import { NextRequest, NextResponse } from 'next/server'
import getServerSession  from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build where clause
    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    // Fetch notifications
    const notifications = await db.notifications.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    })

    // Get unread count
    const unreadCount = await db.notifications.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      )
    }

    // Verify notification belongs to user
    const notification = await db.notifications.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Delete notification
    await db.notifications.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}