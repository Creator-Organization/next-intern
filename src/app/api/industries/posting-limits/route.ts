import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const industry = await db.industry.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    // Only allow checking own limits
    if (industry.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if premium - unlimited posting
    if (session.user.isPremium) {
      return NextResponse.json({
        success: true,
        limits: {
          INTERNSHIP: 999,
          PROJECT: 999,
          FREELANCING: 999,
        },
        isPremium: true,
      });
    }

    // For free users - check current month posts
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Count posts by type for current month
    const [internshipCount, projectCount, freelancingCount] = await Promise.all([
      db.opportunity.count({
        where: {
          industryId: params.id,
          type: 'INTERNSHIP',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      db.opportunity.count({
        where: {
          industryId: params.id,
          type: 'PROJECT',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      db.opportunity.count({
        where: {
          industryId: params.id,
          type: 'FREELANCING',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    // Free users: 3 per type per month
    const monthlyLimit = 3;

    return NextResponse.json({
      success: true,
      limits: {
        INTERNSHIP: Math.max(0, monthlyLimit - internshipCount),
        PROJECT: Math.max(0, monthlyLimit - projectCount),
        FREELANCING: 0, // Always 0 for free users
      },
      isPremium: false,
      currentMonth: {
        INTERNSHIP: internshipCount,
        PROJECT: projectCount,
        FREELANCING: freelancingCount,
      },
    });
  } catch (error) {
    console.error('GET /api/industries/[id]/posting-limits error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}