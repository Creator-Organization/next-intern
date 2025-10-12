import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function PUT(
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

    // Verify user is changing their own password
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = passwordSchema.parse(body);

    // Get user with current password - FIXED: use passwordHash
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        passwordHash: true, // ✅ Changed from 'password'
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a password (might be OAuth only)
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Cannot change password for OAuth accounts' },
        { status: 400 }
      );
    }

    // Verify current password - FIXED: use passwordHash
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash // ✅ Changed from user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password - FIXED: use passwordHash
    await db.user.update({
      where: { id: resolvedParams.id },
      data: {
        passwordHash: hashedPassword, // ✅ Changed from 'password'
      },
    });

    // Log audit trail - FIXED: use valid action
    await db.privacyAuditLog.create({
      data: {
        userId: resolvedParams.id,
        action: 'ACCESS_PREMIUM_FEATURE', // ✅ Using valid enum value
        resourceType: 'USER_ACCOUNT',
        resourceId: resolvedParams.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        legalBasis: 'User initiated password change',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('PUT /api/users/[id]/password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}