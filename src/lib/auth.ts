/**
 * NextAuth.js Configuration
 * NextIntern v2 - Final Corrected Version
 */

import NextAuth, { type NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserType } from '@prisma/client'

// Type definitions for profile data
type CandidateProfile = {
  id: string
  firstName: string
  lastName: string
  showFullName: boolean
}

type IndustryProfile = {
  id: string
  companyName: string
  industry: string
}

type InstituteProfile = {
  id: string
  instituteName: string
  instituteType: string
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    userType: UserType
    isVerified?: boolean
    isPremium?: boolean
    candidate?: CandidateProfile | null
    industry?: IndustryProfile | null
    institute?: InstituteProfile | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      userType: UserType
      isVerified: boolean
      isPremium: boolean
      candidate?: CandidateProfile | null
      industry?: IndustryProfile | null
      institute?: InstituteProfile | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    userType: UserType
    isVerified: boolean
    isPremium: boolean
    candidate?: CandidateProfile | null
    industry?: IndustryProfile | null
    institute?: InstituteProfile | null
  }
}

// Auth configuration
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email with profile data
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  showFullName: true
                }
              },
              industry: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true
                }
              },
              institute: {
                select: {
                  id: true,
                  instituteName: true,
                  instituteType: true
                }
              }
            }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )

          if (!isValid) {
            return null
          }

          // Return user data for session
          let displayName = user.email.split('@')[0] // fallback

          if (user.candidate) {
            displayName = `${user.candidate.firstName} ${user.candidate.lastName}`
          } else if (user.industry) {
            displayName = user.industry.companyName
          } else if (user.institute) {
            displayName = user.institute.instituteName
          }

          return {
            id: user.id,
            email: user.email,
            name: displayName,
            userType: user.userType,
            isVerified: user.isVerified,
            isPremium: user.isPremium,
            candidate: user.candidate,
            industry: user.industry,
            institute: user.institute
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // ✅ 30 days
    updateAge: 24 * 60 * 60, // ✅ Update every 24 hours
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // ✅ Secure in production
      },
    },
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userId = user.id
        token.userType = user.userType
        token.isVerified = user.isVerified ?? false
        token.isPremium = user.isPremium ?? false
        token.candidate = user.candidate as CandidateProfile | null
        token.industry = user.industry as IndustryProfile | null
        token.institute = user.institute as InstituteProfile | null
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId
        session.user.userType = token.userType
        session.user.isVerified = token.isVerified
        session.user.isPremium = token.isPremium
        session.user.candidate = token.candidate
        session.user.industry = token.industry
        session.user.institute = token.institute
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email ?? '' },
            include: {
              candidate: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  showFullName: true
                }
              },
              industry: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true
                }
              },
              institute: {
                select: {
                  id: true,
                  instituteName: true,
                  instituteType: true
                }
              }
            }
          })

          if (!existingUser) {
            // For new Google users, redirect to complete registration
            return true
          }

          // Add profile data to user object for session
          user.userType = existingUser.userType
          user.isVerified = existingUser.isVerified
          user.isPremium = existingUser.isPremium
          user.candidate = existingUser.candidate
          user.industry = existingUser.industry
          user.institute = existingUser.institute

          // Update Google ID if not set
          if (!existingUser.googleId && profile?.sub) {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: profile.sub,
                lastLoginAt: new Date()
              }
            })
          } else {
            // Update last login time
            await db.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() }
            })
          }

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }

      // For credentials login, update last login time
      if (account?.provider === 'credentials' && user?.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })
        } catch (error) {
          console.error('Failed to update last login:', error)
        }
      }

      return true
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/`
    }
  },

  events: {
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)

      if (user.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })
        } catch (error) {
          console.error('Failed to update last login time:', error)
        }
      }
    },

    async signOut() {
      console.log('User signed out')
    }
  },

  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development'
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
export const authOptions = authConfig