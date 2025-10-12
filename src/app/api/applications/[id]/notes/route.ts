import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const notesSchema = z.object({
  notes: z.string(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.userType !== 'INDUSTRY') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = notesSchema.parse(body);

    // Get application
    const application = await db.application.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify application belongs to this industry
    const industry = await db.industry.findUnique({
      where: { userId: session.user.id },
    });

    if (!industry || application.industryId !== industry.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update notes
    const updatedApplication = await db.application.update({
      where: { id: resolvedParams.id },
      data: {
        companyNotes: validatedData.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: 'Notes saved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('PUT /api/applications/[id]/notes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}