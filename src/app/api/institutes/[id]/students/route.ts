import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'INSTITUTE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify institute belongs to user
    const institute = await prisma.institute.findUnique({
      where: { id: params.id, userId: session.user.id }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    // Get all students with application data
    const students = await prisma.instituteStudent.findMany({
      where: {
        instituteId: params.id,
        isActive: true
      },
      include: {
        candidate: {
          include: {
            user: true,
            applications: {
              include: {
                opportunity: true
              }
            }
          }
        },
        program: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'INSTITUTE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify institute belongs to user
    const institute = await prisma.institute.findUnique({
      where: { id: params.id, userId: session.user.id }
    });

    if (!institute) {
      return NextResponse.json({ error: 'Institute not found' }, { status: 404 });
    }

    const body = await request.json();
    const { candidateId, studentId, programId, semester, year, cgpa } = body;

    // Validate required fields
    if (!candidateId || !studentId || !programId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if student already enrolled
    const existing = await prisma.instituteStudent.findUnique({
      where: {
        instituteId_candidateId: {
          instituteId: params.id,
          candidateId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student already enrolled' },
        { status: 400 }
      );
    }

    // Create student enrollment
    const student = await prisma.instituteStudent.create({
      data: {
        instituteId: params.id,
        candidateId,
        studentId,
        programId,
        semester,
        year,
        cgpa
      },
      include: {
        candidate: {
          include: {
            user: true
          }
        },
        program: true
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}