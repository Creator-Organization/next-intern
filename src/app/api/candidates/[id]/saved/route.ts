// src/app/api/candidates/[id]/saved/route.ts
// Candidate Saved Opportunities API - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fix: Await params first, then access properties
    const resolvedParams = await params;
    const candidateId = resolvedParams.id;

    // Handle undefined candidate ID
    if (!candidateId || candidateId === 'undefined') {
      console.log('Candidate ID is undefined, returning empty saved list');
      return NextResponse.json({
        data: [],
        message: 'No candidate profile found',
      });
    }

    console.log('Fetching saved opportunities for candidate:', candidateId);

    // Verify candidate exists and belongs to current user
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!candidate) {
      console.log('Candidate not found in database');
      return NextResponse.json({
        data: [],
        message: 'Candidate not found',
      });
    }

    // Security check: ensure candidate belongs to current user
    if (candidate.userId !== session.user.id) {
      console.log('Unauthorized access attempt to saved opportunities');
      return NextResponse.json(
        {
          error: 'Unauthorized access',
        },
        { status: 403 }
      );
    }

    // Get saved opportunities
    const savedOpportunities = await db.savedOpportunity.findMany({
      where: { candidateId },
      select: {
        opportunityId: true,
        savedAt: true,
      },
      orderBy: { savedAt: 'desc' },
    });

    console.log(`Found ${savedOpportunities.length} saved opportunities`);

    return NextResponse.json({
      data: savedOpportunities,
      count: savedOpportunities.length,
    });
    
  } catch (error) {
    console.error('Saved opportunities API error:', error);
    
    // Return empty array on error
    return NextResponse.json({
      data: [],
      error: 'Failed to fetch saved opportunities',
    });
  }
}