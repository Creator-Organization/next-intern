import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [pending, verified] = await Promise.all([
      db.industry.findMany({
        where: { isVerified: false },
        include: {
          user: {
            select: {
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.industry.findMany({
        where: { isVerified: true },
        include: {
          user: {
            select: {
              email: true
            }
          },
          _count: {
            select: {
              opportunities: true
            }
          }
        },
        orderBy: { verifiedAt: 'desc' },
        take: 20
      })
    ])

    return NextResponse.json({
      success: true,
      pending,
      verified
    })
  } catch (error) {
    console.error('Error fetching industries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}