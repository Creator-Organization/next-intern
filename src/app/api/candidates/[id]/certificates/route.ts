// src/app/api/candidates/[id]/certificates/route.ts
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
    const certificates = await db.certificate.findMany({
      where: { candidateId: resolvedParams.id },
      orderBy: { issueDate: 'desc' }
    });

    return NextResponse.json({ data: certificates });
  } catch (error) {
    console.error('GET certificates error:', error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(
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
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, description, skills } = body;

    if (!name || !issuer || !issueDate) {
      return NextResponse.json({ error: 'Name, issuer, and issue date are required' }, { status: 400 });
    }

    const certificate = await db.certificate.create({
      data: {
        candidateId: resolvedParams.id,
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId: credentialId?.trim() || null,
        credentialUrl: credentialUrl?.trim() || null,
        description: description?.trim() || null,
        skills: skills || [],
        isVerified: false
      }
    });

    return NextResponse.json({ data: certificate, message: 'Certificate added' }, { status: 201 });
  } catch (error) {
    console.error('POST certificate error:', error);
    return NextResponse.json({ error: 'Failed to add certificate' }, { status: 500 });
  }
}