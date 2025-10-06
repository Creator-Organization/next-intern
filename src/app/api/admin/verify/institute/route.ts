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
    const { instituteId, action, reason } = body;

    if (!instituteId || !action) {
      return NextResponse.json(
        { error: 'Institute ID and action required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const institute = await prisma.institute.update({
        where: { id: instituteId },
        data: {
          isVerified: true,
          verifiedAt: new Date()
        }
      });

      // TODO: Send approval email

      return NextResponse.json({ 
        message: 'Institute approved successfully',
        institute 
      });
    } else if (action === 'reject') {
      // Keep institute but don't verify
      // TODO: Send rejection email with reason

      return NextResponse.json({ 
        message: 'Institute rejected',
        reason 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying institute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}