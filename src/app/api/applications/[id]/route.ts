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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const isPremium = session.user.isPremium;

    // Get application with relations
    const application = await db.application.findUnique({
      where: { id: resolvedParams.id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            state: true,
            country: true,
            bio: true,
            resumeUrl: true,
            portfolioUrl: true,
            linkedinUrl: true,
            githubUrl: true,
            anonymousId: true,
            college: true,
            degree: true,
            fieldOfStudy: true,
            graduationYear: true,
            cgpa: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify application belongs to this industry
    const industry = await db.industry.findUnique({
      where: { userId: session.user.id },
    });

    if (!industry || application.industryId !== industry.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get candidate skills
    const skills = await db.candidateSkill.findMany({
      where: { candidateId: application.candidateId },
      select: {
        skillName: true,
        proficiency: true,
        yearsOfExperience: true,
      },
    });

    // Apply privacy controls
    const processedApplication = {
      ...application,
      candidate: isPremium
        ? {
            id: application.candidate.id,
            displayName: `${application.candidate.firstName} ${application.candidate.lastName}`,
            email: application.candidate.user.email,
            phone: application.candidate.phone,
            city: application.candidate.city,
            state: application.candidate.state,
            country: application.candidate.country,
            bio: application.candidate.bio,
            resumeUrl: application.candidate.resumeUrl,
            portfolioUrl: application.candidate.portfolioUrl,
            linkedinUrl: application.candidate.linkedinUrl,
            githubUrl: application.candidate.githubUrl,
            college: application.candidate.college,
            degree: application.candidate.degree,
            fieldOfStudy: application.candidate.fieldOfStudy,
            graduationYear: application.candidate.graduationYear,
            cgpa: application.candidate.cgpa,
            isAnonymous: false,
          }
        : {
            id: application.candidate.id,
            displayName: `Candidate #${application.candidate.anonymousId.slice(-8)}`,
            email: null,
            phone: null,
            city: null,
            state: null,
            country: null,
            bio: application.candidate.bio,
            resumeUrl: null,
            portfolioUrl: null,
            linkedinUrl: null,
            githubUrl: null,
            college: application.candidate.college,
            degree: application.candidate.degree,
            fieldOfStudy: application.candidate.fieldOfStudy,
            graduationYear: application.candidate.graduationYear,
            cgpa: null,
            isAnonymous: true,
          },
    };

    // Log audit trail if premium user views contact
    if (isPremium && !application.contactViewed) {
      await db.application.update({
        where: { id: resolvedParams.id },
        data: { contactViewed: true },
      });

      await db.privacyAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'VIEW_CONTACT',
          targetUserId: application.candidate.user.id,
          targetUserType: 'CANDIDATE',
          resourceType: 'APPLICATION',
          resourceId: resolvedParams.id,
          isPremiumAccess: true,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          legalBasis: 'Premium subscription - legitimate interest',
        },
      });
    }

    return NextResponse.json({
      success: true,
      application: processedApplication,
      skills,
      isPremium,
    });
  } catch (error) {
    console.error('GET /api/applications/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}