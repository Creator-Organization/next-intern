// src/app/api/candidate/applications/route.ts
// Candidate Applications API - Internship And Project 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ 
        error: 'Unauthorized - Candidates only' 
      }, { status: 401 });
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

    // Get all applications for this candidate
    const applications = await db.application.findMany({
      where: { candidateId: candidate.id },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        coverLetter: true,
        expectedSalary: true,
        canJoinFrom: true,
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
            workType: true,
            stipend: true,
            currency: true,
            duration: true,
            industry: {
              select: {
                companyName: true,
                industry: true,
                isVerified: true,
                showCompanyName: true,
                anonymousId: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    // Apply privacy controls to industry data
    const processedApplications = applications.map(app => {
      const isPremium = session.user.isPremium || false;
      const industry = app.opportunity.industry;
      
      return {
        ...app,
        opportunity: {
          ...app.opportunity,
          industry: {
            ...industry,
            companyName: (industry.showCompanyName || isPremium) 
              ? industry.companyName 
              : `Company #${industry.anonymousId.slice(-3)}`
          }
        }
      };
    });

    return NextResponse.json({
      data: processedApplications,
      count: processedApplications.length
    });

  } catch (error) {
    console.error('Get candidate applications error:', error);
    return NextResponse.json({
      error: 'Failed to fetch applications'
    }, { status: 500 });
  }
}