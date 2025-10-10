// src/app/api/users/[id]/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    // Fetch user data
    const user = await db.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        email: true,
        isVerified: true,
        isPremium: true,
        premiumExpiresAt: true,
        lastLoginAt: true
      }
    });

    // Fetch candidate data separately
    const candidate = await db.candidate.findFirst({
      where: { userId: resolvedParams.id },
      select: {
        phone: true,
        phoneVerified: true,
        showFullName: true,
        showContact: true,
        anonymousId: true
      }
    });

    // Fetch preferences separately
    const preferences = await db.userPreference.findFirst({
      where: { userId: resolvedParams.id },
      select: {
        theme: true,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true
      }
    });

    if (!user || !candidate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        email: user.email,
        isVerified: user.isVerified,
        phone: candidate.phone || null,
        phoneVerified: candidate.phoneVerified || false,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        lastLoginAt: user.lastLoginAt,
        showFullName: candidate.showFullName || false,
        showContactInfo: candidate.showContact || false,
        anonymousId: candidate.anonymousId || '',
        theme: preferences?.theme || 'TEAL',
        emailNotifications: preferences?.emailNotifications ?? true,
        pushNotifications: preferences?.pushNotifications ?? true,
        marketingEmails: preferences?.marketingEmails ?? false
      }
    });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    // Update candidate privacy settings
    if ('showFullName' in body || 'showContactInfo' in body) {
      await db.candidate.updateMany({
        where: { userId: resolvedParams.id },
        data: {
          ...(body.showFullName !== undefined && { showFullName: body.showFullName }),
          ...(body.showContactInfo !== undefined && { showContact: body.showContactInfo })
        }
      });
    }

    // Update preferences
    if ('theme' in body || 'emailNotifications' in body || 'pushNotifications' in body || 'marketingEmails' in body) {
      await db.userPreference.upsert({
        where: { userId: resolvedParams.id },
        create: {
          userId: resolvedParams.id,
          theme: body.theme || 'TEAL',
          emailNotifications: body.emailNotifications ?? true,
          pushNotifications: body.pushNotifications ?? true,
          marketingEmails: body.marketingEmails ?? false
        },
        update: {
          ...(body.theme && { theme: body.theme }),
          ...(body.emailNotifications !== undefined && { emailNotifications: body.emailNotifications }),
          ...(body.pushNotifications !== undefined && { pushNotifications: body.pushNotifications }),
          ...(body.marketingEmails !== undefined && { marketingEmails: body.marketingEmails })
        }
      });
    }

    return NextResponse.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}