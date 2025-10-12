import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise type
) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ✅ Await params
    const resolvedParams = await params;

    // Verify industry belongs to user
    const industry = await db.industry.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!industry) {
      return NextResponse.json(
        { success: false, error: 'Industry not found' },
        { status: 404 }
      );
    }

    if (industry.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const isPremium = session.user.isPremium;

    // Get applications for this industry
    const applications = await db.application.findMany({
      where: {
        industryId: resolvedParams.id,  // ✅ Use resolvedParams
      },
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            state: true,
            bio: true,
            anonymousId: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Get candidate skills separately
    const candidateIds = [...new Set(applications.map(app => app.candidate.id))];
    const candidateSkills = await db.candidateSkill.findMany({
      where: {
        candidateId: { in: candidateIds },
      },
      select: {
        candidateId: true,
        skillName: true,
      },
    });

    // Group skills by candidate
    const skillsByCandidate = candidateSkills.reduce((acc: Record<string, string[]>, skill) => {
      if (!acc[skill.candidateId]) acc[skill.candidateId] = [];
      acc[skill.candidateId].push(skill.skillName);
      return acc;
    }, {});

    // Process applications with privacy controls
    const processedApplications = applications.map(application => {
      const candidate = application.candidate;

      return {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
        opportunityTitle: application.opportunity.title,
        candidate: {
          id: candidate.id,
          displayName: isPremium
            ? `${candidate.firstName} ${candidate.lastName}`
            : `Candidate #${candidate.anonymousId.slice(-8)}`,
          location: isPremium && candidate.city && candidate.state
            ? `${candidate.city}, ${candidate.state}`
            : 'Location Hidden',
          bio: isPremium ? candidate.bio : null,
          skills: skillsByCandidate[candidate.id] || [],
          isAnonymous: !isPremium,
        },
      };
    });

    // Calculate stats
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewed: applications.filter(a => a.status === 'REVIEWED').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    };

    return NextResponse.json({
      success: true,
      applications: processedApplications,
      isPremium,
      stats,
    });
  } catch (error) {
    console.error('GET /api/industries/[id]/applications error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}