/**
 * Authentication Utility Functions
 * Internship And Project - Updated for 28-Table Schema
 */

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserType, InstituteType, AuditAction } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Get current session
export async function getCurrentSession() {
  return await auth()
}

// Get current user with profile data - Updated for new schema
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        candidate: true,
        industry: true,
        institute: true,
        preferences: true
      }
    })
    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

// Check if user is authenticated
export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }
  return session
}

// Check user type and redirect if needed
export async function requireUserType(allowedTypes: UserType[]) {
  const session = await requireAuth()
  if (!allowedTypes.includes(session.user.userType)) {
    redirect('/')
  }
  return session
}

// Get dashboard URL based on user type - Updated for new user types
export function getDashboardUrl(userType: UserType): string {
  switch (userType) {
    case UserType.CANDIDATE:
      return '/candidate'
    case UserType.INDUSTRY:
      return '/industry'
    case UserType.INSTITUTE:
      return '/institute'
    case UserType.ADMIN:
      return '/admin'
    default:
      return '/'
  }
}

// Create user with profile - Updated for new schema
export async function createUserWithProfile(data: {
  email: string
  password: string
  userType: UserType
  firstName?: string
  lastName?: string
  companyName?: string
  industry?: string
  instituteName?: string
  instituteType?: string
}) {
  const passwordHash = await hashPassword(data.password)

  try {
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          userType: data.userType,
          isVerified: false,
          isActive: true,
          isPremium: false
        }
      })

      // Create user preferences with default theme
      await tx.userPreference.create({
        data: {
          userId: user.id,
          theme: 'teal',
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          profileVisibility: 'PUBLIC',
          showContactInfo: false
        }
      })

      // Create profile based on user type
      if (data.userType === UserType.CANDIDATE && data.firstName && data.lastName) {
        await tx.candidate.create({
          data: {
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName
          }
        })
      } else if (data.userType === UserType.INDUSTRY && data.companyName) {
        await tx.industry.create({
          data: {
            userId: user.id,
            companyName: data.companyName,
            industry: data.industry || 'Technology',
            companySize: 'STARTUP',
            city: 'Not specified',
            state: 'Not specified',
            country: 'Not specified',
            isVerified: false,
            isActive: true
          }
        })
      } else if (data.userType === UserType.INSTITUTE && data.instituteName) {
        await tx.institute.create({
          data: {
            userId: user.id,
            instituteName: data.instituteName,
            instituteType: (data.instituteType as InstituteType) || InstituteType.UNIVERSITY,
            email: data.email,
            address: 'Not specified',
            city: 'Not specified',
            state: 'Not specified',
            country: 'Not specified',
            isVerified: false,
            isActive: true
          }
        })
      }

      return user
    })

    return { success: true, user: result }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!user
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

// Updated user type options for forms
export const userTypeOptions = [
  {
    value: UserType.CANDIDATE,
    label: 'Candidate',
    description: 'Looking for internships and opportunities',
    icon: 'GraduationCap'
  },
  {
    value: UserType.INDUSTRY,
    label: 'Company',
    description: 'Hiring talent and posting opportunities',
    icon: 'Building2'
  },
  {
    value: UserType.INSTITUTE,
    label: 'Institute',
    description: 'Educational institution managing students',
    icon: 'School'
  }
] as const

// Get user profile data based on type
export async function getUserProfile(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        candidate: true,
        industry: true,
        institute: true,
        preferences: true
      }
    })

    if (!user) return null

    return {
      user,
      profile: user.candidate || user.industry || user.institute,
      profileType: user.candidate ? 'candidate' : user.industry ? 'industry' : user.institute ? 'institute' : null
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Check if user has premium access
export async function checkPremiumAccess(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumExpiresAt: true
      }
    })

    if (!user) return false

    // Check if premium is active and not expired
    return user.isPremium &&
           (!user.premiumExpiresAt || user.premiumExpiresAt > new Date())
  } catch (error) {
    console.error('Error checking premium access:', error)
    return false
  }
}

// Get subscription info
export async function getUserSubscription(userId: string) {
  try {
    const subscription = await db.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

// Privacy audit logging
export async function logPrivacyAudit(data: {
  userId: string
  targetUserId?: string
  action: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await db.privacyAuditLog.create({
      data: {
        userId: data.userId,
        targetUserId: data.targetUserId || null,
        action: data.action as AuditAction,
        ipAddress: data.ipAddress || '',
        userAgent: data.userAgent || '',
        accessedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error logging privacy audit:', error)
  }
}