/**
 * Authentication Utility Functions
 * NextIntern - Internship Platform
 */

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserType } from '@prisma/client'
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

// Get current user with profile data
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        company: true,
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

// Get dashboard URL based on user type
export function getDashboardUrl(userType: UserType): string {
  switch (userType) {
    case UserType.STUDENT:
      return '/student'
    case UserType.COMPANY:
      return '/company'
    case UserType.ADMIN:
      return '/admin'
    default:
      return '/'
  }
}

// Create user with profile
export async function createUserWithProfile(data: {
  email: string
  password: string
  userType: UserType
  firstName?: string
  lastName?: string
  companyName?: string
  industry?: string
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
          isActive: true
        }
      })

      // Create user preferences with default theme
      await tx.userPreference.create({
        data: {
          userId: user.id,
          theme: 'teal-cyan',
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false
        }
      })

      // Create profile based on user type
      if (data.userType === UserType.STUDENT && data.firstName && data.lastName) {
        await tx.student.create({
          data: {
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            isAvailable: true
          }
        })
      } else if (data.userType === UserType.COMPANY && data.companyName) {
        await tx.company.create({
          data: {
            userId: user.id,
            companyName: data.companyName,
            industry: data.industry || 'Technology',
            companySize: 'STARTUP',
            isVerified: false,
            city: 'Not specified',
            state: 'Not specified',
            country: 'Not specified'
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
      where: { email }
    })
    return !!user
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

// User type options for forms
export const userTypeOptions = [
  {
    value: UserType.STUDENT,
    label: 'Student',
    description: 'Looking for internship opportunities',
    icon: 'GraduationCap'
  },
  {
    value: UserType.COMPANY,
    label: 'Company',
    description: 'Hiring interns and talent',
    icon: 'Building2'
  }
] as const