// src/app/api/opportunities/[id]/apply/route.ts
// Application Submission API - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ 
        error: 'Unauthorized - Candidates only' 
      }, { status: 401 });
    }

    // Fix: Await params first, then access properties
    const resolvedParams = await params;
    const opportunityId = resolvedParams.id;

    if (!opportunityId) {
      return NextResponse.json({ 
        error: 'Opportunity ID is required' 
      }, { status: 400 });
    }

    // Get candidate profile
    const candidate = await db.candidate.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!candidate) {
      return NextResponse.json({ 
        error: 'Candidate profile not found' 
      }, { status: 404 });
    }

    // Verify opportunity exists and is active
    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
      select: {
        id: true,
        title: true,
        isActive: true,
        isPremiumOnly: true,
        applicationDeadline: true,
        industryId: true,
        industry: {
          select: {
            companyName: true
          }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json({ 
        error: 'Opportunity not found' 
      }, { status: 404 });
    }

    if (!opportunity.isActive) {
      return NextResponse.json({ 
        error: 'This opportunity is no longer accepting applications' 
      }, { status: 400 });
    }

    // Check if opportunity is premium-only and user is not premium
    if (opportunity.isPremiumOnly && !session.user.isPremium) {
      return NextResponse.json({ 
        error: 'This opportunity requires a premium subscription' 
      }, { status: 403 });
    }

    // Check application deadline
    if (opportunity.applicationDeadline && new Date() > opportunity.applicationDeadline) {
      return NextResponse.json({ 
        error: 'Application deadline has passed' 
      }, { status: 400 });
    }

    // Check if already applied
    const existingApplication = await db.application.findFirst({
      where: {
        candidateId: candidate.id,
        opportunityId: opportunityId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'You have already applied to this opportunity' 
      }, { status: 400 });
    }

    // Parse application data from request body
    const body = await request.json();
    const { coverLetter, resumeUrl, expectedSalary, canJoinFrom } = body;

    // Create application (using correct field names from schema)
    const application = await db.application.create({
      data: {
        candidateId: candidate.id,
        opportunityId: opportunityId,
        industryId: opportunity.industryId, // Required field
        coverLetter: coverLetter || '',
        resumeUrl: resumeUrl || null,
        expectedSalary: expectedSalary || null,
        canJoinFrom: canJoinFrom ? new Date(canJoinFrom) : null, // Correct field name
        status: 'PENDING',
        appliedAt: new Date()
      }
    });

    // Update opportunity application count
    await db.opportunity.update({
      where: { id: opportunityId },
      data: {
        applicationCount: {
          increment: 1
        }
      }
    });

    // Create notification for the candidate (optional)
    try {
      await db.notification.create({
        data: {
          userId: session.user.id,
          title: 'Application Submitted',
          message: `Your application for ${opportunity.title} has been submitted successfully`,
          type: 'APPLICATION_UPDATE', // Correct NotificationType
          data: { applicationId: application.id }, // Store in data field as JSON
          actionUrl: `/candidate/applications/${application.id}` // Optional action URL
        }
      });
    } catch (err) {
      // Notification creation is non-critical, just log error
      console.error('Failed to create notification:', err);
    }

    return NextResponse.json({
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        opportunityTitle: opportunity.title,
        companyName: opportunity.industry.companyName,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({
      error: 'Failed to submit application'
    }, { status: 500 });
  }
}

// GET method to retrieve application status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ 
        error: 'Unauthorized - Candidates only' 
      }, { status: 401 });
    }

    // Fix: Await params first, then access properties
    const resolvedParams = await params;
    const opportunityId = resolvedParams.id;

    // Get candidate profile
    const candidate = await db.candidate.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!candidate) {
      return NextResponse.json({ 
        error: 'Candidate profile not found' 
      }, { status: 404 });
    }

    // Check if already applied (using correct field names from schema)
    const existingApplication = await db.application.findFirst({
      where: {
        candidateId: candidate.id,
        opportunityId: opportunityId
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        coverLetter: true,
        expectedSalary: true,
        canJoinFrom: true // Correct field name from schema
      }
    });

    return NextResponse.json({
      data: {
        hasApplied: !!existingApplication,
        application: existingApplication
      }
    });

  } catch (error) {
    console.error('Get application status error:', error);
    return NextResponse.json({
      error: 'Failed to get application status'
    }, { status: 500 });
  }
}