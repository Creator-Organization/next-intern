// src/app/api/opportunities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET method (you already have this)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

// PUT - Update opportunity
export async function PUT(
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
    const opportunityId = resolvedParams.id;

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

    // Check if opportunity exists and belongs to this industry
    const existingOpportunity = await db.opportunity.findUnique({
      where: { id: opportunityId }
    });

    if (!existingOpportunity) {
      return NextResponse.json({ 
        error: 'Opportunity not found' 
      }, { status: 404 });
    }

    if (existingOpportunity.industryId !== user.industry.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to edit this opportunity' 
      }, { status: 403 });
    }

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
      isActive
    } = body;

    // Validation
    if (title && (title.length < 10 || title.length > 100)) {
      return NextResponse.json({ 
        error: 'Title must be between 10 and 100 characters' 
      }, { status: 400 });
    }

    if (description && (description.length < 50 || description.length > 2000)) {
      return NextResponse.json({ 
        error: 'Description must be between 50 and 2000 characters' 
      }, { status: 400 });
    }

    // Update opportunity
    const updatedOpportunity = await db.opportunity.update({
      where: { id: opportunityId },
      data: {
        title,
        description,
        type,
        workType,
        categoryId,
        locationId,
        stipend: stipend ? parseInt(stipend.toString()) : null,
        currency: currency || 'INR',
        duration: duration ? parseInt(duration.toString()) : 1,
        requirements,
        preferredSkills: preferredSkills || null,
        minQualification: minQualification || null,
        experienceRequired: experienceRequired ? parseInt(experienceRequired.toString()) : 0,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    console.log('Opportunity updated successfully:', {
      id: updatedOpportunity.id,
      title: updatedOpportunity.title
    });

    return NextResponse.json({
      success: true,
      message: 'Opportunity updated successfully',
      data: {
        id: updatedOpportunity.id,
        title: updatedOpportunity.title,
        isActive: updatedOpportunity.isActive
      }
    });

  } catch (error) {
    console.error('Update opportunity error:', error);
    return NextResponse.json({
      error: 'Failed to update opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete/deactivate opportunity
export async function DELETE(
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
    const opportunityId = resolvedParams.id;

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

    // Check if opportunity exists and belongs to this industry
    const existingOpportunity = await db.opportunity.findUnique({
      where: { id: opportunityId },
      select: {
        id: true,
        industryId: true,
        categoryId: true,
        locationId: true
      }
    });

    if (!existingOpportunity) {
      return NextResponse.json({ 
        error: 'Opportunity not found' 
      }, { status: 404 });
    }

    if (existingOpportunity.industryId !== user.industry.id) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this opportunity' 
      }, { status: 403 });
    }

    // Soft delete - just deactivate instead of hard delete
    // This preserves application history
    await db.opportunity.update({
      where: { id: opportunityId },
      data: {
        isActive: false
      }
    });

    // Update category and location counts
    await Promise.all([
      db.category.update({
        where: { id: existingOpportunity.categoryId },
        data: {
          opportunityCount: { decrement: 1 }
        }
      }),
      db.location.update({
        where: { id: existingOpportunity.locationId },
        data: {
          opportunityCount: { decrement: 1 }
        }
      })
    ]);

    console.log('Opportunity deactivated successfully:', {
      id: opportunityId
    });

    return NextResponse.json({
      success: true,
      message: 'Opportunity deactivated successfully'
    });

  } catch (error) {
    console.error('Delete opportunity error:', error);
    return NextResponse.json({
      error: 'Failed to delete opportunity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}