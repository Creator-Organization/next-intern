/**
 * Authentication Type Definitions
 * Internship And Project v2 - Internship Platform
 */

import { UserType } from '@prisma/client'
import { type DefaultSession } from 'next-auth'

// Extend NextAuth session types for v5
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      userType: UserType
      isVerified: boolean
      isPremium?: boolean
    } & DefaultSession['user']
  }

  interface User {
    userType: UserType
    isVerified: boolean
    isPremium?: boolean
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    userType: UserType
    isVerified: boolean
    isPremium?: boolean
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId: string
    userType: UserType
    isVerified: boolean
    isPremium: boolean
  }
}

// Form validation types
export interface LoginFormData {
  email: string
  password: string
  userType?: UserType
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  userType: UserType
  
  // Candidate-specific fields (updated from Student)
  firstName?: string
  lastName?: string
  college?: string
  
  // Industry-specific fields (updated from Company)
  companyName?: string
  industry?: string
  companySize?: string
  
  // Institute-specific fields (new)
  instituteName?: string
  instituteType?: string
  affiliatedUniversity?: string
}

// Auth state types
export interface AuthState {
  isLoading: boolean
  error: string | null
  success: string | null
}

// User type selection
export interface UserTypeOption {
  value: UserType
  label: string
  description: string
  icon: string
}

// Password reset types
export interface ForgotPasswordFormData {
  email: string
  userType?: UserType
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
  token: string
}

// Email verification types
export interface EmailVerificationData {
  token: string
  email?: string
}

// Profile completion types
export interface ProfileCompletionData {
  candidateProfile?: {
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth?: Date
    college?: string
    degree?: string
    fieldOfStudy?: string
    graduationYear?: number
    bio?: string
    city?: string
    state?: string
    country?: string
  }
  
  industryProfile?: {
    companyName: string
    industry: string
    companySize: string
    description?: string
    websiteUrl?: string
    city: string
    state: string
    country: string
  }
  
  instituteProfile?: {
    instituteName: string
    instituteType: string
    description?: string
    websiteUrl?: string
    establishedYear?: number
    affiliatedUniversity?: string
    city: string
    state: string
    country: string
  }
}

// Authentication response types
export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user?: {
      id: string
      email: string
      userType: UserType
      isVerified: boolean
    }
    token?: string
    redirectUrl?: string
  }
  error?: string
}