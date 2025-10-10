// src/app/api/candidates/[id]/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      select: { isPremium: true, premiumExpiresAt: true }
    });

    const subscription = await db.userSubscription.findFirst({
      where: { userId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      select: {
        plan: true,        // ✅ Changed from planType
        status: true,
        endDate: true
      }
    });

    return NextResponse.json({
      isPremium: user?.isPremium || false,
      subscription: subscription || null
    });
  } catch (error) {
    console.error('GET subscription error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}