import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status === 'pending' 
      ? { isActive: false } 
      : status === 'active' 
      ? { isActive: true }
      : {};

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        industry: true,
        category: true,
        location: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { opportunityId, action, reason } = body;

    if (!opportunityId || !action) {
      return NextResponse.json(
        { error: 'Opportunity ID and action required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const opportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { isActive: true }
      });

      // TODO: Send approval notification to industry

      return NextResponse.json({ 
        message: 'Opportunity approved successfully',
        opportunity 
      });
    } else if (action === 'reject') {
      const opportunity = await prisma.opportunity.update({
        where: { id: opportunityId },
        data: { isActive: false }
      });

      // TODO: Send rejection notification with reason

      return NextResponse.json({ 
        message: 'Opportunity rejected',
        opportunity,
        reason 
      });
    } else if (action === 'delete') {
      await prisma.opportunity.delete({
        where: { id: opportunityId }
      });

      return NextResponse.json({ 
        message: 'Opportunity deleted successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error moderating opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}