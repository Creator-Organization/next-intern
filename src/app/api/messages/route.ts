import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, content, subject } = body

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Receiver and content required' }, { status: 400 })
    }

    // Create message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
        subject: subject || null,
        isRead: false,
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: message
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}