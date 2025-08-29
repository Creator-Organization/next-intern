/**
 * Authentication Type Definitions
 * NextIntern - Internship Platform
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
    } & DefaultSession['user']
  }

  interface User {
    userType?: UserType
    isVerified?: boolean
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    userType?: UserType
    isVerified?: boolean
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userId?: string
    userType?: UserType
    isVerified?: boolean
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
  // Student-specific fields
  firstName?: string
  lastName?: string
  college?: string
  // Company-specific fields
  companyName?: string
  industry?: string
  companySize?: string
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