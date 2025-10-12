import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
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

    // Verify user is accessing their own billing data
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user with subscription and industry data
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        email: true,
        isPremium: true,
        premiumExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get industry data
    const industry = await db.industry.findUnique({
      where: { userId: resolvedParams.id },
      select: {
        id: true,
        companyName: true,
        currentMonthPosts: true,
        monthlyPostLimit: true,
      },
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // Get active subscription
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId: resolvedParams.id,
        status: { in: ['ACTIVE', 'CANCELLED'] },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        industry,
        subscription,
      },
    });
  } catch (error) {
    console.error('GET /api/users/[id]/billing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}