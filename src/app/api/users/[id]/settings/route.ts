/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const settingsSchema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  showCompanyName: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  theme: z.enum(['teal', 'blue', 'purple']).optional(),
  language: z.enum(['en', 'hi', 'es']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Verify user is accessing their own settings
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user with relations based on user type
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        preferences: true,
        industry: session.user.userType === 'INDUSTRY',
        candidate: session.user.userType === 'CANDIDATE',
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build settings object based on user type
    let settings: any = {
      email: user.email,
      emailNotifications: user.preferences?.emailNotifications ?? true,
      marketingEmails: user.preferences?.marketingEmails ?? false,
      theme: user.preferences?.theme || 'teal',
      language: user.preferences?.language || 'en',
    };

    if (session.user.userType === 'INDUSTRY' && user.industry) {
      settings = {
        ...settings,
        companyName: user.industry.companyName,
        industry: user.industry.industry,
        showCompanyName: user.industry.showCompanyName,
        anonymousId: user.industry.anonymousId,
      };
    }

    if (session.user.userType === 'CANDIDATE' && user.candidate) {
      settings = {
        ...settings,
        firstName: user.candidate.firstName,
        lastName: user.candidate.lastName,
        anonymousId: user.candidate.anonymousId,
      };
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('GET /api/users/[id]/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Verify user is accessing their own settings
    if (session.user.id !== resolvedParams.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    // Update user preferences
    if (validatedData.emailNotifications !== undefined || 
        validatedData.marketingEmails !== undefined ||
        validatedData.theme !== undefined ||
        validatedData.language !== undefined) {
      
      await db.userPreference.upsert({
        where: { userId: resolvedParams.id },
        create: {
          userId: resolvedParams.id,
          emailNotifications: validatedData.emailNotifications ?? true,
          marketingEmails: validatedData.marketingEmails ?? false,
          theme: validatedData.theme || 'teal',
          language: validatedData.language || 'en',
        },
        update: {
          emailNotifications: validatedData.emailNotifications,
          marketingEmails: validatedData.marketingEmails,
          theme: validatedData.theme,
          language: validatedData.language,
        },
      });
    }

    // Update industry-specific settings
    if (session.user.userType === 'INDUSTRY') {
      const industryUpdates: any = {};

      if (validatedData.companyName !== undefined) {
        industryUpdates.companyName = validatedData.companyName;
      }
      if (validatedData.industry !== undefined) {
        industryUpdates.industry = validatedData.industry;
      }
      if (validatedData.showCompanyName !== undefined) {
        industryUpdates.showCompanyName = validatedData.showCompanyName;
      }

      if (Object.keys(industryUpdates).length > 0) {
        await db.industry.update({
          where: { userId: resolvedParams.id },
          data: industryUpdates,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('PUT /api/users/[id]/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}