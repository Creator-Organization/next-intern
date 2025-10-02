// src/app/api/opportunities/route.ts
// Opportunities API with Privacy Controls - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List opportunities with privacy filtering
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

// POST - Create new opportunity with posting limits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json({ 
        error: 'Unauthorized - Industry users only' 
      }, { status: 401 });
    }

    // Get industry profile
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { industry: true }
    });

    if (!user?.industry?.id) {
      return NextResponse.json({ 
        error: 'Industry profile not found' 
      }, { status: 404 });
    }

    const industryId = user.industry.id;
    const isPremium = user.isPremium;

    const body = await request.json();
    const {
      title,
      description,
      type,
      workType,
      categoryId,
      locationId,
      stipend,
      currency,
      duration,
      requirements,
      preferredSkills,
      minQualification,
      experienceRequired,
      applicationDeadline,
      startDate,
      showCompanyName
    } = body;

    // Validation
    if (!title || title.length < 10 || title.length > 100) {
      return NextResponse.json({ 
        error: 'Title must be between 10 and 100 characters' 
      }, { status: 400 });
    }

    if (!description || description.length < 50 || description.length > 2000) {
      return NextResponse.json({ 
        error: 'Description must be between 50 and 2000 characters' 
      }, { status: 400 });
    }

    if (!['INTERNSHIP', 'PROJECT', 'FREELANCING'].includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid opportunity type' 
      }, { status: 400 });
    }

    // CRITICAL: Check posting limits for free users
    if (!isPremium) {
      // Freelancing is premium-only
      if (type === 'FREELANCING') {
        return NextResponse.json({ 
          error: 'Freelancing opportunities require a premium subscription',
          upgradeTo: 'premium'
        }, { status: 403 });
      }

      // Check monthly posting limits (3 per type)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const postCount = await db.opportunity.count({
        where: {
          industryId,
          type,
          createdAt: { gte: startOfMonth }
        }
      });

      if (postCount >= 3) {
        return NextResponse.json({ 
          error: `You have reached the monthly limit of 3 ${type} opportunities. Upgrade to premium for unlimited posting.`,
          upgradeTo: 'premium',
          currentCount: postCount,
          limit: 3
        }, { status: 403 });
      }
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await db.opportunity.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Parse and validate numeric fields
    const parsedStipend = stipend ? parseInt(stipend.toString()) : null;
    const parsedDuration = duration ? parseInt(duration.toString()) : 1; // Default to 1 if not provided
    const parsedExperience = experienceRequired ? parseInt(experienceRequired.toString()) : 0;

    // Create opportunity
    const opportunity = await db.opportunity.create({
      data: {
        industryId,
        categoryId,
        locationId,
        title,
        slug,
        description,
        type,
        workType,
        stipend: parsedStipend,
        currency: currency || 'INR',
        duration: parsedDuration, // Fixed: Now always a number, never null
        requirements,
        preferredSkills: preferredSkills || null,
        minQualification: minQualification || null,
        experienceRequired: parsedExperience,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        showCompanyName: showCompanyName || false,
        isPremiumOnly: type === 'FREELANCING', // Freelancing is always premium-only
        isActive: true
      }
    });

    // Fetch related data separately since we didn't include them in create
    const [industry, category, location] = await Promise.all([
      db.industry.findUnique({
        where: { id: industryId },
        select: { companyName: true, anonymousId: true }
      }),
      db.category.findUnique({
        where: { id: categoryId },
        select: { name: true }
      }),
      db.location.findUnique({
        where: { id: locationId },
        select: { city: true, state: true }
      })
    ]);

    // Update category opportunity count
    await db.category.update({
      where: { id: categoryId },
      data: {
        opportunityCount: { increment: 1 }
      }
    });

    // Update location opportunity count
    await db.location.update({
      where: { id: locationId },
      data: {
        opportunityCount: { increment: 1 }
      }
    });

    console.log('Opportunity created successfully:', {
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.type,
      industryId
    });

    return NextResponse.json({
      success: true,
      message: 'Opportunity posted successfully',
      data: {
        id: opportunity.id,
        title: opportunity.title,
        slug: opportunity.slug,
        type: opportunity.type,
        companyName: industry?.companyName || 'Unknown',
        category: category?.name || 'Unknown',
        location: location ? `${location.city}, ${location.state}` : 'Unknown'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create opportunity error:', error);
    return NextResponse.json({
      error: 'Failed to create opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}