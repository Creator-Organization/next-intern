import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'INSTITUTE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify institute belongs to user
    const institute = await prisma.institute.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        instituteStudents: {
          where: { isActive: true },
          include: {
            candidate: {
              include: {
                applications: {
                  include: {
                    opportunity: {
                      include: {
                        category: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    // Aggregate applications
    const allApplications = institute.instituteStudents.flatMap(
      student => student.candidate.applications
    );

    // Status distribution
    const statusDistribution = {
      PENDING: allApplications.filter(app => app.status === 'PENDING').length,
      REVIEWED: allApplications.filter(app => app.status === 'REVIEWED').length,
      SHORTLISTED: allApplications.filter(app => app.status === 'SHORTLISTED').length,
      SELECTED: allApplications.filter(app => app.status === 'SELECTED').length,
      REJECTED: allApplications.filter(app => app.status === 'REJECTED').length
    };

    // Type distribution
    const typeDistribution = {
      INTERNSHIP: allApplications.filter(app => app.opportunity.type === 'INTERNSHIP').length,
      PROJECT: allApplications.filter(app => app.opportunity.type === 'PROJECT').length,
      FREELANCING: allApplications.filter(app => app.opportunity.type === 'FREELANCING').length
    };

    // Category distribution
    const categoryMap = new Map<string, number>();
    allApplications.forEach(app => {
      const category = app.opportunity.category.name;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const categoryDistribution = Object.fromEntries(categoryMap);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const applicationsInMonth = allApplications.filter(app => {
        const appDate = new Date(app.appliedAt);
        return appDate.getMonth() === date.getMonth() && 
               appDate.getFullYear() === date.getFullYear();
      });

      monthlyTrends.push({
        month: `${month} ${year}`,
        applications: applicationsInMonth.length,
        placements: applicationsInMonth.filter(app => app.status === 'SELECTED').length
      });
    }

    const analytics = {
      totalStudents: institute.instituteStudents.length,
      totalApplications: allApplications.length,
      successfulPlacements: statusDistribution.SELECTED,
      statusDistribution,
      typeDistribution,
      categoryDistribution,
      monthlyTrends
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}