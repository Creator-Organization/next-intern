/**
 * Terms & Conditions Acceptance API
 * Internship And Project v2 - Fixed import
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'  // ← Changed from 'prisma' to 'db'
import { UserType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userType, version } = body
    const userId = session.user.id

    console.log('Processing terms acceptance:', {
      userId,
      userType,
      version: version || '1.0'
    })

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if already accepted
    const existingAcceptance = await db.termsAcceptance.findFirst({  // ← Changed to 'db'
      where: {
        userId: userId,
        userType: userType as UserType
      }
    })

    if (existingAcceptance) {
      console.log('Terms already accepted')
      
      // Update user flag anyway
      await db.user.update({  // ← Changed to 'db'
        where: { id: userId },
        data: { 
          currentTermsAccepted: true,
          termsAcceptedAt: new Date()
        }
      })

      return NextResponse.json({ 
        success: true,
        message: 'Terms already accepted'
      })
    }

    // Get or create terms version
    let termsVersion = await db.termsVersion.findFirst({  // ← Changed to 'db'
      where: {
        userType: userType as UserType,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Create default version if none exists
    if (!termsVersion) {
      console.log('Creating default terms version')
      termsVersion = await db.termsVersion.create({  // ← Changed to 'db'
        data: {
          userType: userType as UserType,
          version: version || '1.0',
          title: `Terms & Conditions for ${userType}`,
          content: `Default Terms & Conditions for ${userType}`,
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system',
          effectiveFrom: new Date()
        }
      })
    }

    // Record acceptance
    const acceptance = await db.termsAcceptance.create({  // ← Changed to 'db'
      data: {
        userId: userId,
        termsVersionId: termsVersion.id,
        userType: userType as UserType,
        ipAddress: clientIP,
        userAgent: userAgent,
        acceptedAt: new Date(),
        isActive: true
      }
    })

    console.log('Terms acceptance recorded:', acceptance.id)

    // Update user's flag
    await db.user.update({  // ← Changed to 'db'
      where: { id: userId },
      data: { 
        currentTermsAccepted: true,
        termsAcceptedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('User updated successfully')

    // Create audit log
    await db.privacyAuditLog.create({  // ← Changed to 'db'
      data: {
        userId: userId,
        action: 'TERMS_ACCEPTED',
        resourceId: acceptance.id,
        resourceType: 'terms_acceptance',
        ipAddress: clientIP,
        userAgent: userAgent,
        accessedAt: new Date(),
        isPremiumAccess: false
      }
    })

    console.log('Audit log created')

    return NextResponse.json({ 
      success: true,
      message: 'Terms accepted successfully',
      acceptanceId: acceptance.id
    })

  } catch (error) {
    console.error('Terms acceptance error:', error)
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message
      })
    }

    return NextResponse.json({ 
      success: false,
      error: 'Failed to record terms acceptance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}