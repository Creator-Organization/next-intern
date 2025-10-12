import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'WITHDRAWN']),
  rejectionReason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = statusSchema.parse(body);

    // Get application
    const application = await db.application.findUnique({
      where: { id: resolvedParams.id },
      include: {
        candidate: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify application belongs to this industry
    const industry = await db.industry.findUnique({
      where: { userId: session.user.id },
    });

    if (!industry || application.industryId !== industry.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate rejection reason if rejecting
    if (validatedData.status === 'REJECTED' && !validatedData.rejectionReason?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await db.application.update({
      where: { id: resolvedParams.id },
      data: {
        status: validatedData.status,
        reviewedAt: validatedData.status !== 'PENDING' ? new Date() : application.reviewedAt,
        rejectionReason: validatedData.status === 'REJECTED' ? validatedData.rejectionReason : null,
      },
    });

    // Create notification for candidate
    const notificationMessages = {
      REVIEWED: `Your application for "${application.opportunity.title}" has been reviewed`,
      SHORTLISTED: `🎉 Great news! You've been shortlisted for "${application.opportunity.title}"`,
      REJECTED: `Your application for "${application.opportunity.title}" was not selected`,
      INTERVIEW_SCHEDULED: `Interview scheduled for "${application.opportunity.title}"`,
      SELECTED: `🎉 Congratulations! You've been selected for "${application.opportunity.title}"`,
    };

    const notificationTitle = {
      REVIEWED: 'Application Reviewed',
      SHORTLISTED: 'Shortlisted!',
      REJECTED: 'Application Update',
      INTERVIEW_SCHEDULED: 'Interview Scheduled',
      SELECTED: 'Selected!',
    };

    if (notificationMessages[validatedData.status as keyof typeof notificationMessages]) {
      await db.notification.create({
        data: {
          userId: application.candidate.user.id,
          type: 'APPLICATION_UPDATE',
          title: notificationTitle[validatedData.status as keyof typeof notificationTitle],
          message: notificationMessages[validatedData.status as keyof typeof notificationMessages],
          actionUrl: `/candidate/applications/${resolvedParams.id}`,
        },
      });
    }

    // Log audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'ACCESS_PREMIUM_FEATURE',
        targetUserId: application.candidate.user.id,
        targetUserType: 'CANDIDATE',
        resourceType: 'APPLICATION_STATUS_UPDATE',
        resourceId: resolvedParams.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: `Status changed to ${validatedData.status}`,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: 'Status updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('PUT /api/applications/[id]/status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}