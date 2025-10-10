// src/app/api/candidates/[id]/skills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Convert level (0-10) to proficiency
function getLevelProficiency(level: number): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' {
  if (level >= 9) return 'EXPERT';
  if (level >= 7) return 'ADVANCED';
  if (level >= 4) return 'INTERMEDIATE';
  return 'BEGINNER';
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
    const { skills } = body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    // Create all skills with level-based proficiency
    const createdSkills = await Promise.all(
      skills.map(skill =>
        db.candidateSkill.create({
          data: {
            candidateId: resolvedParams.id,
            skillName: skill.name.trim(),
            proficiency: getLevelProficiency(skill.level),
            yearsOfExperience: skill.level, // Store level as years for display
            isEndorsed: false
          }
        })
      )
    );

    // Get all skills for this candidate
    const allSkills = await db.candidateSkill.findMany({
      where: { candidateId: resolvedParams.id },
      orderBy: { proficiency: 'desc' }
    });

    return NextResponse.json({ data: allSkills, message: 'Skills added' }, { status: 201 });
  } catch (error) {
    console.error('POST skills error:', error);
    return NextResponse.json({ error: 'Failed to add skills' }, { status: 500 });
  }
}