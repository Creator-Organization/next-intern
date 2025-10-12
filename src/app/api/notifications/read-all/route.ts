import { NextResponse } from 'next/server'
import  getServerSession  from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT /api/notifications/read-all - Mark all notifications as read
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Mark all unread notifications as read
    const result = await db.notifications.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.count,
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    )
  }
}