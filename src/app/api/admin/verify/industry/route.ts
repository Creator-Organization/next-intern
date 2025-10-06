import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { industryId, action, reason } = body;

    if (!industryId || !action) {
      return NextResponse.json(
        { error: 'Industry ID and action required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const industry = await prisma.industry.update({
        where: { id: industryId },
        data: {
          isVerified: true,
          verifiedAt: new Date()
        }
      });

      // TODO: Send approval email

      return NextResponse.json({ 
        message: 'Industry approved successfully',
        industry 
      });
    } else if (action === 'reject') {
      // Keep industry but don't verify
      // TODO: Send rejection email with reason

      return NextResponse.json({ 
        message: 'Industry rejected',
        reason 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying industry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}