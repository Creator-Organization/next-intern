/**
 * NextAuth.js Configuration
 * NextIntern - Internship Platform
 */

import NextAuth, { type NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { UserType } from '@prisma/client'

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
          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              student: true,
              company: true
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

          // Return user data for session - format for NextAuth v5
          return {
            id: user.id,
            email: user.email,
            userType: user.userType,
            isVerified: user.isVerified,
            name: user.student 
              ? `${user.student.firstName} ${user.student.lastName}` 
              : user.company?.companyName || user.email.split('@')[0]
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],

  // Custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60    // 24 hours
  },

  // Callbacks for JWT and session customization
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.userType = user.userType
        token.isVerified = user.isVerified
        token.userId = user.id
      }
      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string
        session.user.userType = token.userType as UserType
        session.user.isVerified = token.isVerified as boolean
      }
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // For new Google users, we'll need to collect user type
            // This will be handled in the sign-up flow
            return true
          }

          // Update Google ID if not set
          if (!existingUser.googleId) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile?.sub }
            })
          }

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    }
  },

  // Events
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
    },
    async signOut() {
      console.log('User signed out')
    }
  },

  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development'
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)