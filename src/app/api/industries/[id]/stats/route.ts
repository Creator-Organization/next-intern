// src/app/api/industries/[id]/stats/route.ts
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
      return NextResponse.json({ 
        error: 'Unauthorized - Industry users only' 
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const industryId = resolvedParams.id;

    // Verify this industry belongs to the logged-in user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { industry: true }
    });

    if (!user?.industry?.id || user.industry.id !== industryId) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Get all opportunities with application counts
    const opportunities = await db.opportunity.findMany({
      where: { industryId },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    // Get recent applications with candidate info
    const recentApplications = await db.application.findMany({
      where: { industryId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            anonymousId: true,
            showFullName: true
          }
        },
        opportunity: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get real messages count
    const messagesCount = await db.message.count({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ],
        isRead: false
      }
    });

    // Calculate stats
    const totalOpportunities = opportunities.length;
    const activeOpportunities = opportunities.filter(o => o.isActive).length;
    const totalApplications = opportunities.reduce((sum, o) => sum + o._count.applications, 0);
    const pendingApplications = recentApplications.filter(a => a.status === 'PENDING').length;
    const totalViews = opportunities.reduce((sum, o) => sum + o.viewCount, 0);
    const conversionRate = totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0;

    // Process recent activity with privacy-aware names
    const recentActivity = recentApplications.slice(0, 5).map(app => {
      const candidateName = user.isPremium && app.candidate.showFullName
        ? `${app.candidate.firstName} ${app.candidate.lastName}`
        : `Candidate #${app.candidate.anonymousId.slice(-8)}`;

      return {
        id: app.id,
        type: 'application' as const,
        title: `New application for ${app.opportunity.title}`,
        description: `Applied ${new Date(app.createdAt).toLocaleDateString()}`,
        time: formatTimeAgo(app.createdAt),
        candidateName,
        opportunityId: app.opportunity.id
      };
    });

    // Get top performing opportunities
    const topOpportunities = opportunities
      .map(opp => ({
        id: opp.id,
        title: opp.title,
        type: opp.type,
        applications: opp._count.applications,
        views: opp.viewCount,
        conversionRate: opp.viewCount > 0 ? Math.round((opp._count.applications / opp.viewCount) * 100) : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOpportunities,
          activeOpportunities,
          totalApplications,
          pendingApplications,
          totalViews,
          messagesCount,
          conversionRate
        },
        recentActivity,
        topOpportunities,
        isPremium: user.isPremium,
        companyName: user.industry.companyName,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get industry stats error:', error);
    return NextResponse.json({
      error: 'Failed to fetch dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}