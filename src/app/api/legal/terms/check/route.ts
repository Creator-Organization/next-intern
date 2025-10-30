// src/app/api/legal/terms/check/route.ts
// Terms & Conditions Check API - Internship And Project 2.0

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('No session found for terms check');
      return NextResponse.json({ 
        hasAccepted: false,
        requiresAcceptance: true 
      });
    }

    console.log('Checking terms acceptance for user:', session.user.id);

    // Check if user has accepted current terms
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        currentTermsAccepted: true,
        termsAcceptedAt: true,
        userType: true
      }
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ 
        hasAccepted: false,
        error: 'User not found' 
      });
    }

    const hasAccepted = user.currentTermsAccepted || false;
    
    console.log('Terms check result:', {
      userId: session.user.id,
      userType: user.userType,
      hasAccepted,
      acceptedAt: user.termsAcceptedAt
    });

    return NextResponse.json({
      hasAccepted,
      userType: user.userType,
      acceptedAt: user.termsAcceptedAt,
      requiresAcceptance: !hasAccepted
    });

  } catch (error) {
    console.error('Terms check API error:', error);
    
    // Return safe default - require terms acceptance
    return NextResponse.json({
      hasAccepted: false,
      requiresAcceptance: true,
      error: 'Failed to check terms acceptance'
    });
  }
}