import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get candidate
    const candidate = await db.candidate.findUnique({
      where: { userId: session.user.id }
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Get all messages for this candidate
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            userType: true,
            industry: {
              select: {
                companyName: true,
                isVerified: true
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            userType: true,
            industry: {
              select: {
                companyName: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    })

    // Group by conversation partner
    const conversationsMap = new Map()

    messages.forEach((message) => {
      const partnerId = message.senderId === session.user.id 
        ? message.receiverId 
        : message.senderId
      
      const partner = message.senderId === session.user.id 
        ? message.receiver 
        : message.sender

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          userName: partner.email,
          userType: partner.userType,
          companyName: partner.industry?.companyName,
          isVerified: partner.industry?.isVerified || false,
          lastMessage: message.content,
          lastMessageTime: message.sentAt,
          unreadCount: 0,
          messages: []
        })
      }

      const conv = conversationsMap.get(partnerId)
      conv.messages.push(message)
      
      // Count unread messages
      if (message.receiverId === session.user.id && !message.isRead) {
        conv.unreadCount++
      }
    })

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({
      success: true,
      data: conversations
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}