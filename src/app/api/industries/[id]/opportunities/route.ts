// src/app/api/industries/[id]/opportunities/route.ts
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const industryId = resolvedParams.id;

    const industry = await db.industry.findUnique({
      where: { id: industryId },
      select: { userId: true }
    });

    if (!industry || industry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const opportunities = await db.opportunity.findMany({
      where: { industryId },
      include: {
        category: { select: { name: true } },
        location: { select: { city: true, state: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, opportunities, count: opportunities.length });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}