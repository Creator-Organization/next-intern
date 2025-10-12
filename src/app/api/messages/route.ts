import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
  subject: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sendMessageSchema.parse(body)

    const { receiverId, content, subject } = validatedData

    // IMPORTANT: If user is CANDIDATE, verify conversation exists
    if (session.user.userType === 'CANDIDATE') {
      const existingConversation = await db.message.findFirst({
        where: {
          OR: [
            { senderId: session.user.id, receiverId },
            { senderId: receiverId, receiverId: session.user.id }
          ]
        }
      })

      if (!existingConversation) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'You can only reply to existing conversations. Companies must initiate contact first.' 
          },
          { status: 403 }
        )
      }
    }

    // Get existing conversation
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

    // Get sender name for notification
    let senderName = 'Someone'
    if (session.user.userType === 'INDUSTRY') {
      const industry = await db.industry.findUnique({
        where: { userId: session.user.id },
        select: { companyName: true }
      })
      senderName = industry?.companyName || 'A Company'
    } else if (session.user.userType === 'CANDIDATE') {
      const candidate = await db.candidate.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, lastName: true }
      })
      senderName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'A Candidate'
    }

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'MESSAGE_RECEIVED',
        title: `New Message from ${senderName}`,
        message: content.length > 100 ? content.substring(0, 100) + '...' : content,
        actionUrl: `/messages?conversation=${session.user.id}`,
      }
    })

    // Log audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCESS_PREMIUM_FEATURE',
        targetUserId: receiverId,
        targetUserType: session.user.userType === 'INDUSTRY' ? 'CANDIDATE' : 'INDUSTRY',
        resourceType: 'MESSAGE_REPLY',
        resourceId: message.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'User sent message in existing conversation',
      }
    })

    return NextResponse.json({
      success: true,
      data: message
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Send message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}