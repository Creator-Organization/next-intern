/**
 * NextAuth.js Configuration
 * NextIntern v2 - Updated for 28-Table Schema
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
          // Find user by email - Updated includes for new schema
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              candidate: true,
              industry: true,
              institute: true
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

          // Return user data for session - Updated for new schema
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
            userType: user.userType,
            isVerified: user.isVerified,
            isPremium: user.isPremium,
            name: displayName
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],

  // Custom pages - Updated paths for new user types
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
        token.isPremium = user.isPremium || false
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
        session.user.isPremium = (token.isPremium as boolean) || false
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
          // Don't fail login for this
        }
      }

      return true
    },

    // Redirect after sign in based on user type
    async redirect({ url, baseUrl }) {
      // If url is relative, resolve it
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default redirect based on user type would need session access
      // For now, redirect to home
      return `${baseUrl}/`
    }
  },

  // Events
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
      
      // Update last login time
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

  // Security settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development'
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)