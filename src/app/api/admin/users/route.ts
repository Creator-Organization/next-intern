import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { UserType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('type')?.toUpperCase() as UserType | undefined;
    const status = searchParams.get('status');
    const premium = searchParams.get('premium');

    const where: {
      userType?: UserType;
      isActive?: boolean;
      isPremium?: boolean;
    } = {};

    if (userType) {
      where.userType = userType;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (premium === 'true') {
      where.isPremium = true;
    } else if (premium === 'false') {
      where.isPremium = false;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        candidate: true,
        industry: true,
        institute: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, isActive, isPremium } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateData: {
      isActive?: boolean;
      isPremium?: boolean;
      premiumExpiresAt?: Date | null;
    } = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (typeof isPremium === 'boolean') {
      updateData.isPremium = isPremium;
      updateData.premiumExpiresAt = isPremium ? new Date('2025-12-31') : null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Create audit log
    await prisma.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'VIEW_PROFILE',
        targetUserId: userId,
        accessReason: 'Admin user update',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Create audit log before deletion
    await prisma.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'VIEW_PROFILE',
        targetUserId: userId,
        accessReason: 'Admin user deletion',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}