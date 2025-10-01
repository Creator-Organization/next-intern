// src/app/api/opportunities/route.ts
// Opportunities API with Privacy Controls - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');
    const isPremium = searchParams.get('isPremium') === 'true';
    const recommended = searchParams.get('recommended') === 'true';

    console.log('Opportunities API called:', { userType, isPremium, recommended });

    // Get opportunities with privacy filtering
    const opportunities = await db.opportunity.findMany({
      where: {
        isActive: true,
        // CRITICAL: Institute users cannot see freelancing at all
        ...(userType === 'INSTITUTE' && {
          type: { not: 'FREELANCING' }
        }),
        // Free users cannot see premium-only opportunities
        ...(!isPremium && {
          isPremiumOnly: false
        })
      },
      include: {
        industry: {
          select: {
            id: true,
            companyName: true,
            industry: true,
            isVerified: true,
            showCompanyName: true,
            anonymousId: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        location: {
          select: {
            id: true,
            city: true,
            state: true,
            country: true
          }
        },
        skills: {
          select: {
            skillName: true,
            isRequired: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: recommended ? 10 : 50
    });

    // Apply privacy controls to response
    const processedOpportunities = opportunities.map(opportunity => ({
      ...opportunity,
      // Privacy control: hide company name based on settings and user premium status
      industry: {
        ...opportunity.industry,
        companyName: (opportunity.industry.showCompanyName || isPremium) 
          ? opportunity.industry.companyName 
          : `Company #${opportunity.industry.anonymousId.slice(-3)}`
      }
    }));

    console.log(`Returning ${processedOpportunities.length} opportunities`);

    return NextResponse.json({ 
      data: processedOpportunities,
      count: processedOpportunities.length,
      privacy: {
        userType,
        isPremium,
        institutesCanSeeFreelancing: false
      }
    });

  } catch (error) {
    console.error('Opportunities API error:', error);
    
    // Return fallback data on error
    const fallbackOpportunities = [
      {
        id: '1',
        title: 'Frontend Developer Intern',
        description: 'Join our dynamic team to build cutting-edge web applications using React, TypeScript, and modern development practices.',
        type: 'INTERNSHIP',
        workType: 'REMOTE',
        stipend: 25000,
        currency: 'INR',
        duration: 12,
        locationId: 'loc1',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        applicationCount: 45,
        viewCount: 234,
        createdAt: new Date('2025-01-15'),
        industry: {
          id: 'ind1',
          companyName: 'Company #123',
          industry: 'Technology',
          isVerified: true,
          showCompanyName: true,
          anonymousId: 'comp_123'
        },
        category: { id: 'cat1', name: 'Software Development', slug: 'software-development', color: '#3B82F6' },
        skills: [
          { skillName: 'React', isRequired: true },
          { skillName: 'TypeScript', isRequired: true }
        ],
        isPremiumOnly: false,
        showCompanyName: true
      }
    ];

    return NextResponse.json({ 
      data: fallbackOpportunities,
      count: fallbackOpportunities.length,
      fallback: true 
    });
  }
}