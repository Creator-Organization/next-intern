// src/app/api/candidates/[id]/skills/[skillId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; skillId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    await db.candidateSkill.delete({
      where: {
        id: resolvedParams.skillId,
        candidateId: resolvedParams.id
      }
    });

    return NextResponse.json({ message: 'Skill deleted' });
  } catch (error) {
    console.error('DELETE skill error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}