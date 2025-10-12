import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const locations = await db.location.findMany({
      where: { isActive: true },
      orderBy: [
        { country: 'asc' },
        { state: 'asc' },
        { city: 'asc' },
      ],
      select: {
        id: true,
        city: true,
        state: true,
        country: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}