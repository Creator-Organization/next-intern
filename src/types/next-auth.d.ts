// src/types/next-auth.d.ts
import { UserType } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      userType: UserType;
      isVerified: boolean;
      isPremium: boolean;
      candidate?: {
        firstName: string;
        lastName: string;
      } | null;
      industry?: {
        companyName: string;
      } | null;
      institute?: {
        instituteName: string;
      } | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    userType: UserType;
    isVerified: boolean;
    isPremium?: boolean;
    candidate?: {
      firstName: string;
      lastName: string;
    } | null;
    industry?: {
      companyName: string;
    } | null;
    institute?: {
      instituteName: string;
    } | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId: string;
    userType: UserType;
    isVerified: boolean;
    isPremium: boolean;
  }
}