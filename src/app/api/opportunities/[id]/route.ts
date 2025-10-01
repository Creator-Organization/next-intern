// src/app/api/opportunities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const opportunityId = resolvedParams.id;

    const opportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        workType: true,
        stipend: true,
        currency: true,
        duration: true,
        requirements: true,
        preferredSkills: true,
        applicationDeadline: true,
        startDate: true,
        isPremiumOnly: true,
        showCompanyName: true,
        industry: {
          select: {
            companyName: true,
            industry: true,
            isVerified: true,
            showCompanyName: true,
            anonymousId: true
          }
        },
        location: {
          select: {
            city: true,
            state: true,
            country: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        skills: {
          select: {
            skillName: true,
            isRequired: true
          }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ data: opportunity });
  } catch (error) {
    console.error('Get opportunity error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}