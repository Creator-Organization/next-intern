/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/candidates/[id]/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const profile = await db.candidate.findUnique({
      where: { id: resolvedParams.id },
      include: {
        skills: {
          orderBy: { proficiency: 'desc' }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('GET profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const {
      firstName, lastName, phone, dateOfBirth, bio,
      city, state, country,
      college, degree, fieldOfStudy, graduationYear, cgpa,
      portfolioUrl, linkedinUrl, githubUrl
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
    }

    // Check if premium for phone changes
    const existingProfile = await db.candidate.findUnique({
      where: { id: resolvedParams.id },
      include: { user: { select: { isPremium: true } } }
    });

    const isPremium = existingProfile?.user.isPremium || false;

    // Prepare update data
    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      bio: bio?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      country: country?.trim() || null,
      college: college?.trim() || null,
      degree: degree?.trim() || null,
      fieldOfStudy: fieldOfStudy?.trim() || null,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      portfolioUrl: portfolioUrl?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      githubUrl: githubUrl?.trim() || null
    };

    // Only allow phone change for premium users
    if (isPremium) {
      updateData.phone = phone?.trim() || null;
    }

    const profile = await db.candidate.update({
      where: { id: resolvedParams.id },
      data: updateData,
      include: {
        skills: {
          orderBy: { proficiency: 'desc' }
        }
      }
    });

    return NextResponse.json({ data: profile, message: 'Profile updated' });
  } catch (error) {
    console.error('PUT profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}