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

    const [pending, active] = await Promise.all([
      db.opportunity.findMany({
        where: { isActive: false },
        include: {
          industry: {
            select: {
              companyName: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          location: {
            select: {
              city: true,
              state: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      db.opportunity.findMany({
        where: { isActive: true },
        include: {
          industry: {
            select: {
              companyName: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          location: {
            select: {
              city: true,
              state: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ])

    return NextResponse.json({
      success: true,
      pending,
      active
    })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}