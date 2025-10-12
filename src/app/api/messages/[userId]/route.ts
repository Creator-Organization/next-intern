/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const partnerId = resolvedParams.userId

    // Get all messages between current user and partner
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: session.user.id }
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
      orderBy: { sentAt: 'asc' }
    })

    // Check if current user has premium (for name visibility)
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true }
    })

    // Process messages to respect privacy
    const processedMessages = messages.map(message => {
      const isOutgoing = message.senderId === session.user.id

      // Determine display name
      let senderName = 'Unknown'
      if (message.sender.userType === 'INDUSTRY') {
        senderName = message.sender.industry?.companyName || 'Company'
      } else if (message.sender.userType === 'CANDIDATE') {
        if (currentUser?.isPremium || message.senderId === session.user.id) {
          // Show real name if premium OR if it's the current user's own message
          senderName = `${message.sender.candidate?.firstName || ''} ${message.sender.candidate?.lastName || ''}`.trim() || 'Candidate'
        } else {
          // Show anonymous ID for free users
          senderName = `Candidate ${message.sender.candidate?.anonymousId || '###'}`
        }
      }

      return {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        senderName,
        subject: message.subject,
        content: message.content,
        isRead: message.isRead,
        readAt: message.readAt,
        sentAt: message.sentAt,
        isOutgoing,
        senderType: message.sender.userType
      }
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

    // ✅ FIXED: Log audit trail with correct action and variable names
    try {
      await db.privacyAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'VIEW', // ✅ Changed from VIEW_CANDIDATE_PROFILE
          targetUserId: partnerId, // ✅ Fixed variable name
          targetUserType: session.user.userType as any,
          resourceType: 'MESSAGE_THREAD',
          resourceId: partnerId, // ✅ Fixed variable name
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          legalBasis: 'User accessed conversation thread'
        }
      })
    } catch (auditError) {
      // Don't fail the request if audit fails
      console.error('Audit log error:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: processedMessages
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}