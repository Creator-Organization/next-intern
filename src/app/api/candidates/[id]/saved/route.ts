// src/app/api/candidates/[id]/saved/route.ts
// Candidate Saved Opportunities API - Internship And Project 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch saved opportunities with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params first, then access properties
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
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // ✅ FIX: Get saved opportunities WITH full opportunity details
    const savedOpportunities = await db.savedOpportunity.findMany({
      where: { candidateId },
      include: {
        opportunity: {
          include: {
            industry: {
              select: {
                id: true,
                companyName: true,
                industry: true,
                isVerified: true,
                showCompanyName: true,
                anonymousId: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
            location: {
              select: {
                id: true,
                city: true,
                state: true,
                country: true,
              },
            },
            skills: {
              select: {
                id: true,
                skillName: true,
                isRequired: true,
                minLevel: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    console.log(`Found ${savedOpportunities.length} saved opportunities`);

    return NextResponse.json({
      success: true,
      data: savedOpportunities,
      count: savedOpportunities.length,
    });
    
  } catch (error) {
    console.error('Saved opportunities API error:', error);
    
    // Return empty array on error
    return NextResponse.json({
      data: [],
      error: 'Failed to fetch saved opportunities',
    }, { status: 500 });
  }
}

// POST - Save a new opportunity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const candidateId = resolvedParams.id;

    // Verify candidate exists and belongs to user
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, userId: true },
    });

    if (!candidate || candidate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { opportunityId } = await request.json();

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await db.savedOpportunity.findFirst({
      where: {
        candidateId,
        opportunityId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Opportunity already saved' },
        { status: 400 }
      );
    }

    // Save opportunity
    const saved = await db.savedOpportunity.create({
      data: {
        candidateId,
        opportunityId,
      },
    });

    console.log('✅ Opportunity saved successfully');

    return NextResponse.json({
      success: true,
      data: saved,
      message: 'Opportunity saved successfully',
    });

  } catch (error) {
    console.error('Save opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to save opportunity' },
      { status: 500 }
    );
  }
}

// DELETE - Unsave/remove saved opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const candidateId = resolvedParams.id;

    // Verify candidate belongs to user
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: { userId: true },
    });

    if (!candidate || candidate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }

    // Delete saved opportunity
    await db.savedOpportunity.deleteMany({
      where: {
        candidateId,
        opportunityId,
      },
    });

    console.log('✅ Opportunity unsaved successfully');

    return NextResponse.json({
      success: true,
      message: 'Opportunity removed from saved list',
    });

  } catch (error) {
    console.error('Unsave error:', error);
    return NextResponse.json(
      { error: 'Failed to unsave opportunity' },
      { status: 500 }
    );
  }
}