import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all messages where user is sender or receiver
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
            },
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                anonymousId: true
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
            },
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                anonymousId: true
              }
            }
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    })

    // Check if current user is premium
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true }
    })

    // Group messages by conversation partner
    const conversationsMap = new Map()

    for (const message of messages) {
      // Determine who the conversation partner is
      const isOutgoing = message.senderId === session.user.id
      const partnerId = isOutgoing ? message.receiverId : message.senderId
      const partner = isOutgoing ? message.receiver : message.sender

      // Skip if already processed this partner
      if (conversationsMap.has(partnerId)) {
        const conv = conversationsMap.get(partnerId)
        
        // Update unread count
        if (!isOutgoing && !message.isRead) {
          conv.unreadCount++
        }
        
        continue
      }

      // Determine display name based on partner type and current user's premium status
      let displayName = 'Unknown User'
      let companyName = undefined
      
      if (partner.userType === 'INDUSTRY') {
        // Show company name
        displayName = partner.industry?.companyName || 'Company'
        companyName = partner.industry?.companyName
      } else if (partner.userType === 'CANDIDATE') {
        if (currentUser?.isPremium) {
          // Premium user can see full name
          displayName = `${partner.candidate?.firstName || ''} ${partner.candidate?.lastName || ''}`.trim() || 'Candidate'
        } else {
          // Free user sees anonymous ID
          displayName = `Candidate ${partner.candidate?.anonymousId || '###'}`
        }
      }

      // Create conversation object
      conversationsMap.set(partnerId, {
        userId: partnerId,
        userName: displayName,
        userType: partner.userType,
        companyName: companyName,
        isVerified: partner.industry?.isVerified || false,
        lastMessage: message.content,
        lastMessageTime: message.sentAt,
        unreadCount: (!isOutgoing && !message.isRead) ? 1 : 0
      })
    }

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({
      success: true,
      data: conversations
    })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}