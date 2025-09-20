// src/types/next-auth.d.ts
import { UserType } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      userType: UserType
      isVerified: boolean
      isPremium: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    userType: UserType
    isVerified: boolean
    isPremium?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId: string
    userType: UserType
    isVerified: boolean
    isPremium: boolean
  }
}