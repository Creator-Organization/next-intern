import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const initiateSchema = z.object({
  applicationId: z.string(),
  content: z.string().min(1),
  subject: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Only INDUSTRY can initiate conversations
    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Only companies can initiate conversations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = initiateSchema.parse(body)

    // Get application to verify it's shortlisted and belongs to this industry
    const application = await db.application.findUnique({
      where: { id: validatedData.applicationId },
      include: {
        candidate: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          }
        },
        opportunity: {
          select: {
            title: true,
            industryId: true,
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify industry owns this application
    const industry = await db.industry.findUnique({
      where: { userId: session.user.id }
    })

    if (!industry || application.opportunity.industryId !== industry.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if application is shortlisted
    if (application.status !== 'SHORTLISTED' && application.status !== 'INTERVIEW_SCHEDULED') {
      return NextResponse.json(
        { success: false, error: 'Can only message shortlisted candidates' },
        { status: 400 }
      )
    }

    const candidateUserId = application.candidate.userId

    // Check if conversation already exists
    const existingConversation = await db.message.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: candidateUserId },
          { senderId: candidateUserId, receiverId: session.user.id }
        ]
      }
    })

    // Create the initial message
    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId: candidateUserId,
        content: validatedData.content.trim(),
        subject: validatedData.subject || `Regarding: ${application.opportunity.title}`,
        isRead: false,
        sentAt: new Date()
      }
    })

    // Create notification for candidate
    await db.notification.create({
      data: {
        userId: candidateUserId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message from Company',
        message: `You have a new message regarding your application`,
        actionUrl: `/candidate/messages?conversation=${session.user.id}`,
      }
    })

    // Log audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCESS_PREMIUM_FEATURE',
        targetUserId: candidateUserId,
        targetUserType: 'CANDIDATE',
        resourceType: 'MESSAGE_INITIATE',
        resourceId: message.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'Company initiated conversation with shortlisted candidate',
      }
    })

    return NextResponse.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Initiate conversation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}