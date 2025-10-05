import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const partnerId = resolvedParams.userId

    // Get messages between current user and partner
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: session.user.id }
        ]
      },
      orderBy: { sentAt: 'asc' }
    })

    // Mark received messages as read
    await db.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: messages
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}