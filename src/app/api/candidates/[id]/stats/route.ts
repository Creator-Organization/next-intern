// src/app/api/candidates/[id]/stats/route.ts
// Candidate Statistics API - Internship And Project 2.0

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
    
    // Handle undefined candidate ID from session
    if (!candidateId || candidateId === 'undefined') {
      console.log('Candidate ID is undefined, returning fallback stats');
      
      // Return fallback stats for development
      const fallbackStats = {
        totalApplications: 0,
        pendingApplications: 0,
        interviewsScheduled: 0,
        savedOpportunities: 0,
        profileViews: 0,
        premiumOpportunities: 15
      };
      
      return NextResponse.json({ 
        data: fallbackStats,
        fallback: true,
        message: 'Using fallback data - candidate profile not found'
      });
    }

    console.log('Fetching stats for candidate:', candidateId);

    // Verify candidate exists and belongs to current user
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      select: { 
        id: true, 
        userId: true,
        firstName: true,
        lastName: true
      }
    });

    if (!candidate) {
      console.log('Candidate not found in database');
      return NextResponse.json({ 
        error: 'Candidate not found' 
      }, { status: 404 });
    }

    // Security check: ensure candidate belongs to current user
    if (candidate.userId !== session.user.id) {
      console.log('Unauthorized access attempt to candidate stats');
      return NextResponse.json({ 
        error: 'Unauthorized access' 
      }, { status: 403 });
    }

    // Get candidate statistics
    const [
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      interviewsScheduled,
      savedOpportunities,
      premiumOpportunities
    ] = await Promise.all([
      // Total applications
      db.application.count({
        where: { candidateId }
      }),
      
      // Pending applications
      db.application.count({
        where: { 
          candidateId,
          status: 'PENDING'
        }
      }),
      
      // Shortlisted applications
      db.application.count({
        where: { 
          candidateId,
          status: 'SHORTLISTED'
        }
      }),
      
      // Scheduled interviews
      db.interview.count({
        where: {
          application: { candidateId },
          status: 'SCHEDULED'
        }
      }),
      
      // Saved opportunities
      db.savedOpportunity.count({
        where: { candidateId }
      }),
      
      // Premium-only opportunities available
      db.opportunity.count({
        where: {
          isActive: true,
          isPremiumOnly: true
        }
      })
    ]);

    const stats = {
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      interviewsScheduled,
      savedOpportunities,
      profileViews: 24, // Placeholder - would need OpportunityView tracking
      premiumOpportunities
    };

    console.log('Candidate stats fetched successfully:', stats);

    return NextResponse.json({ 
      data: stats,
      candidateInfo: {
        id: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`.trim()
      }
    });

  } catch (error) {
    console.error('Candidate stats API error:', error);
    
    // Return fallback data on error
    const fallbackStats = {
      totalApplications: 0,
      pendingApplications: 0,
      shortlistedApplications: 0,
      interviewsScheduled: 0,
      savedOpportunities: 0,
      profileViews: 0,
      premiumOpportunities: 15
    };
    
    return NextResponse.json({ 
      data: fallbackStats,
      error: 'Failed to fetch candidate statistics',
      fallback: true
    });
  }
}