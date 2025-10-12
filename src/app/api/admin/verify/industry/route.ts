import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Submit verification request (Industry submits)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { industryId, registrationNumber, taxId, documents, notes } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, error: 'Registration number is required' },
        { status: 400 }
      );
    }

    // Check if industry exists and belongs to user
    const industry = await db.industry.findUnique({
      where: { id: industryId },
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    if (industry.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if already verified
    if (industry.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Company is already verified' },
        { status: 400 }
      );
    }

    // Create support ticket for admin review
    const verificationTicket = await db.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: `Verification Request - ${industry.companyName}`,
        description: `
Registration Number: ${registrationNumber}
Tax ID: ${taxId || 'N/A'}
Documents: ${documents || 'N/A'}
Notes: ${notes || 'N/A'}

Company: ${industry.companyName}
Industry: ${industry.industry}
Location: ${industry.city}, ${industry.state}
        `.trim(),
        status: 'OPEN',
        priority: 'HIGH',
        category: 'VERIFICATION',
      },
    });

    // Create notification for admins
    const admins = await db.user.findMany({
      where: { userType: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'New Verification Request',
          message: `${industry.companyName} has requested company verification`,
          actionUrl: `/admin/industries?verify=${industry.id}`,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      ticketId: verificationTicket.id,
    });
  } catch (error) {
    console.error('POST /api/admin/verify/industry error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Approve/Reject verification (Admin action)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { industryId, action, reason } = body;

    if (!industryId || !action) {
      return NextResponse.json(
        { error: 'Industry ID and action required' },
        { status: 400 }
      );
    }

    const industry = await db.industry.findUnique({
      where: { id: industryId },
      include: { user: true },
    });

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Approve verification
      await db.industry.update({
        where: { id: industryId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      // Create success notification
      await db.notification.create({
        data: {
          userId: industry.userId,
          type: 'SYSTEM_ALERT',
          title: '✅ Company Verified!',
          message: `Your company "${industry.companyName}" has been successfully verified. You now have a verified badge.`,
          actionUrl: '/industry/profile',
        },
      });

      // Close verification ticket
      await db.supportTicket.updateMany({
        where: {
          userId: industry.userId,
          category: 'VERIFICATION',
          status: 'OPEN',
        },
        data: {
          status: 'RESOLVED',
          response: `Verification approved by ${session.user.email}. ${reason || ''}`,
          resolvedAt: new Date(),
          assignedTo: session.user.id,
        },
      });

      return NextResponse.json({
        message: 'Industry approved successfully',
        industry,
      });
    } else if (action === 'reject') {
      // Reject verification
      await db.notification.create({
        data: {
          userId: industry.userId,
          type: 'SYSTEM_ALERT',
          title: 'Verification Request Rejected',
          message: `Your verification request was not approved. Reason: ${reason || 'Documents need review'}. Please update and resubmit.`,
          actionUrl: '/industry/profile/verification',
        },
      });

      // Update ticket
      await db.supportTicket.updateMany({
        where: {
          userId: industry.userId,
          category: 'VERIFICATION',
          status: 'OPEN',
        },
        data: {
          status: 'CLOSED',
          response: `Verification rejected: ${reason || 'Please review documents and resubmit'}`,
          resolvedAt: new Date(),
          assignedTo: session.user.id,
        },
      });

      return NextResponse.json({
        message: 'Industry rejected',
        reason,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/admin/verify/industry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}