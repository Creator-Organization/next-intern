// src/app/api/legal/terms/accept/route.ts
// Terms Acceptance API - NextIntern 2.0

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { version } = body;

    console.log('Processing terms acceptance:', {
      userId: session.user.id,
      userType: session.user.userType,
      version: version || '1.0'
    });

    // Get client IP for audit trail
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update user's terms acceptance status
    await db.user.update({
      where: { id: session.user.id },
      data: {
        currentTermsAccepted: true,
        termsAcceptedAt: new Date()
      }
    });

    // Create terms acceptance record for audit trail
    const termsAcceptance = await db.termsAcceptance.create({
      data: {
        userId: session.user.id,
        version: version || '1.0',
        acceptedAt: new Date(),
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    // Log privacy audit trail
    await db.privacyAuditLog.create({
      data: {
        userId: session.user.id,
        action: 'VIEW_PROFILE', // Use existing enum value
        targetId: termsAcceptance.id,
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || 'unknown',
        accessedAt: new Date()
      }
    });

    console.log('Terms acceptance completed successfully:', {
      userId: session.user.id,
      acceptanceId: termsAcceptance.id,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Terms accepted successfully',
      acceptanceId: termsAcceptance.id,
      acceptedAt: termsAcceptance.acceptedAt
    });

  } catch (error) {
    console.error('Terms acceptance API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to accept terms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}