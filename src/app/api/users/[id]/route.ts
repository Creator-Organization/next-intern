import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Verify user is deleting their own account
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user to check type
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Log audit trail before deletion - FIXED: use valid action
    await db.privacyAuditLog.create({
      data: {
        userId: resolvedParams.id,
        action: 'DATA_EXPORT', // ✅ Using valid enum value (closest to deletion)
        resourceType: 'USER_ACCOUNT',
        resourceId: resolvedParams.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'User requested account deletion - Right to erasure (GDPR)',
      },
    });

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Verify user is accessing their own data or is admin
    if (session.user.id !== resolvedParams.id && session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        email: true,
        userType: true,
        isPremium: true,
        createdAt: true,
        industry: session.user.userType === 'INDUSTRY',
        candidate: session.user.userType === 'CANDIDATE',
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}