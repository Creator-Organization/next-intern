import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'INSTITUTE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const institute = await prisma.institute.findUnique({
      where: { userId: session.user.id },
      include: {
        programs: {
          include: {
            students: {
              where: { isActive: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    return NextResponse.json(institute.programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'INSTITUTE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const institute = await prisma.institute.findUnique({
      where: { userId: session.user.id }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      programName, 
      programType, 
      department,
      internshipRequired,
      minimumDuration,
      creditHours,
      semester,
    } = body;

    if (!programName || !programType || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const program = await prisma.instituteProgram.create({
      data: {
        instituteId: institute.id,
        programName,
        programType,
        department,
        internshipRequired: internshipRequired || false,
        minimumDuration,
        creditHours,
        semester,
      }
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}