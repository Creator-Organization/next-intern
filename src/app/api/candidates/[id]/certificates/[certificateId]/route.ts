// src/app/api/candidates/[id]/certificates/[certificateId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certificateId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl, description, skills } = body;

    const certificate = await db.certificate.update({
      where: { 
        id: resolvedParams.certificateId,
        candidateId: resolvedParams.id 
      },
      data: {
        name: name.trim(),
        issuer: issuer.trim(),
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId: credentialId?.trim() || null,
        credentialUrl: credentialUrl?.trim() || null,
        description: description?.trim() || null,
        skills: skills || []
      }
    });

    return NextResponse.json({ data: certificate, message: 'Certificate updated' });
  } catch (error) {
    console.error('PUT certificate error:', error);
    return NextResponse.json({ error: 'Failed to update certificate' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; certificateId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.userType !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await db.certificate.delete({
      where: { 
        id: resolvedParams.certificateId,
        candidateId: resolvedParams.id 
      }
    });

    return NextResponse.json({ message: 'Certificate deleted' });
  } catch (error) {
    console.error('DELETE certificate error:', error);
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 });
  }
}