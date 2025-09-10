// src/lib/tokens.ts
// Token Generation and Validation Utilities - Phase 2 Day 5

import crypto from 'crypto'
import { db } from '@/lib/db'

// Token Configuration
const TOKEN_CONFIG = {
  passwordReset: {
    length: 32,
    expiryMinutes: 15
  },
  emailVerification: {
    length: 32,
    expiryHours: 24
  }
} as const

// Generate cryptographically secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Create password reset token
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSecureToken(TOKEN_CONFIG.passwordReset.length)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_CONFIG.passwordReset.expiryMinutes)

  // Delete any existing tokens for this user
  await db.passwordResetToken.deleteMany({
    where: { userId }
  })

  // Create new token
  await db.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })

  return token
}

// Create email verification token
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateSecureToken(TOKEN_CONFIG.emailVerification.length)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + TOKEN_CONFIG.emailVerification.expiryHours)

  // Delete any existing tokens for this user
  await db.emailVerificationToken.deleteMany({
    where: { userId }
  })

  // Create new token
  await db.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  })

  return token
}

// Validate password reset token
export async function validatePasswordResetToken(token: string): Promise<string | null> {
  const tokenRecord = await db.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!tokenRecord) {
    return null
  }

  // Check if token has expired
  if (tokenRecord.expiresAt < new Date()) {
    // Delete expired token
    await db.passwordResetToken.delete({
      where: { token }
    })
    return null
  }

  return tokenRecord.userId
}

// Validate email verification token
export async function validateEmailVerificationToken(token: string): Promise<string | null> {
  const tokenRecord = await db.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!tokenRecord) {
    return null
  }

  // Check if token has expired
  if (tokenRecord.expiresAt < new Date()) {
    // Delete expired token
    await db.emailVerificationToken.delete({
      where: { token }
    })
    return null
  }

  return tokenRecord.userId
}

// Consume password reset token (delete after use)
export async function consumePasswordResetToken(token: string): Promise<boolean> {
  try {
    await db.passwordResetToken.delete({
      where: { token }
    })
    return true
  } catch {
    return false
  }
}

// Consume email verification token (delete after use)
export async function consumeEmailVerificationToken(token: string): Promise<boolean> {
  try {
    await db.emailVerificationToken.delete({
      where: { token }
    })
    return true
  } catch {
    return false
  }
}

// Clean up expired tokens (run periodically)
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date()

  await Promise.all([
    db.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    }),
    db.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    })
  ])
}

// Token validation utilities
export const TokenUtils = {
  // Check if token format is valid
  isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token) // 32 bytes = 64 hex chars
  },

  // Generate secure URL-safe token
  generateUrlSafeToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  },

  // Hash token for storage (optional extra security)
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}