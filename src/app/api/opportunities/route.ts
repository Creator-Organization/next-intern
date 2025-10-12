// src/app/api/opportunities/route.ts
// Opportunities API with Privacy Controls + Admin Approval System - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List opportunities with privacy filtering + APPROVAL FILTER
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');
    const isPremium = searchParams.get('isPremium') === 'true';
    const recommended = searchParams.get('recommended') === 'true';
    const searchQuery = searchParams.get('search');
    const typeFilter = searchParams.get('type');
    const workTypeFilter = searchParams.get('workType');

    console.log('Opportunities API called:', { 
      userType, 
      isPremium, 
      recommended, 
      search: searchQuery,
      type: typeFilter,
      workType: workTypeFilter 
    });

    // Build where clause with all filters
    const where: any = {
      // ✅ STEP 3 CRITICAL CHANGE: Only show APPROVED opportunities to candidates
      isApproved: true,
      approvalStatus: 'APPROVED',
      isActive: true,
      
      // CRITICAL: Institute users cannot see freelancing at all
      ...(userType === 'INSTITUTE' && {
        type: { not: 'FREELANCING' }
      }),
      
      // Free users cannot see premium-only opportunities
      ...(!isPremium && {
        isPremiumOnly: false
      })
    };

    // Add search filter if provided
    if (searchQuery && searchQuery.trim()) {
      where.OR = [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          requirements: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add type filter if provided
    if (typeFilter && typeFilter !== 'all') {
      where.type = typeFilter;
    }

    // Add work type filter if provided
    if (workTypeFilter && workTypeFilter !== 'all') {
      where.workType = workTypeFilter;
    }

    // Get opportunities with privacy filtering
    const opportunities = await db.opportunity.findMany({
      where,
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

    console.log(`Returning ${processedOpportunities.length} APPROVED opportunities`);

    return NextResponse.json({
      data: processedOpportunities,
      count: processedOpportunities.length,
      privacy: {
        userType,
        isPremium,
        institutesCanSeeFreelancing: false
      },
      filters: {
        search: searchQuery || null,
        type: typeFilter || 'all',
        workType: workTypeFilter || 'all'
      }
    });

  } catch (error) {
    console.error('Opportunities API error:', error);
    
    // Return empty array on error (don't show fallback data)
    return NextResponse.json({
      data: [],
      count: 0,
      error: 'Failed to fetch opportunities'
    }, { status: 500 });
  }
}

// POST - Create new opportunity with posting limits + ADMIN APPROVAL
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
    const parsedDuration = duration ? parseInt(duration.toString()) : 1;
    const parsedExperience = experienceRequired ? parseInt(experienceRequired.toString()) : 0;

    // ✅ STEP 3 CRITICAL CHANGE: Create opportunity with PENDING approval status
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
        duration: parsedDuration,
        requirements,
        preferredSkills: preferredSkills || null,
        minQualification: minQualification || null,
        experienceRequired: parsedExperience,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        showCompanyName: showCompanyName || false,
        isPremiumOnly: type === 'FREELANCING',
        
        // ✅ STEP 3: Set approval fields - ALL new opportunities start PENDING
        isApproved: false,
        approvalStatus: 'PENDING',
        isActive: false, // Not active until approved
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null
      }
    });

    // Fetch related data
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

    // Update category opportunity count (only for approved opportunities)
    // NOTE: Don't increment counts until approved
    
    console.log('✅ Opportunity submitted for admin approval:', {
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.type,
      approvalStatus: opportunity.approvalStatus,
      industryId
    });

    return NextResponse.json({
      success: true,
      message: 'Opportunity submitted for admin approval. You will be notified once it is reviewed.',
      data: {
        id: opportunity.id,
        title: opportunity.title,
        slug: opportunity.slug,
        type: opportunity.type,
        approvalStatus: opportunity.approvalStatus,
        isApproved: opportunity.isApproved,
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