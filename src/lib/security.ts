// src/lib/security.ts
// Security Logging and Rate Limiting - Phase 2 Day 5

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// Security Event Types
export const SecurityEventTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  REGISTRATION: 'REGISTRATION',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  EMAIL_VERIFICATION_SENT: 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

export type SecurityEventType = typeof SecurityEventTypes[keyof typeof SecurityEventTypes]

// Rate Limiting Configuration
const RATE_LIMITS = {
  login: { attempts: 5, windowMinutes: 15 },
  registration: { attempts: 3, windowMinutes: 60 },
  passwordReset: { attempts: 3, windowMinutes: 60 },
  emailVerification: { attempts: 5, windowMinutes: 60 }
} as const

// Extract IP address from request
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to localhost if no IP headers are found
  return '127.0.0.1'
}

// Log security event
export async function logSecurityEvent(
  eventType: SecurityEventType,
  options: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    success: boolean
    details?: Record<string, unknown>
  }
): Promise<void> {
  try {
    await db.securityLog.create({
      data: {
        eventType,
        userId: options.userId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        success: options.success,
        details: options.details ? JSON.parse(JSON.stringify(options.details)) : undefined
      }
    })
  } catch (error) {
    // Don't throw errors for logging failures
    console.error('Failed to log security event:', error)
  }
}

// Check rate limit for specific action
export async function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  identifier: string // IP address or user ID
): Promise<{ allowed: boolean; remainingAttempts: number; resetTime: Date }> {
  const config = RATE_LIMITS[action]
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes)

  // Count recent attempts for this identifier
  const recentAttempts = await db.securityLog.count({
    where: {
      eventType: {
        in: getRelevantEventTypes(action)
      },
      ipAddress: identifier,
      createdAt: {
        gte: windowStart
      }
    }
  })

  const allowed = recentAttempts < config.attempts
  const remainingAttempts = Math.max(0, config.attempts - recentAttempts)
  
  const resetTime = new Date()
  resetTime.setMinutes(resetTime.getMinutes() + config.windowMinutes)

  return {
    allowed,
    remainingAttempts,
    resetTime
  }
}

// Get relevant event types for rate limiting
function getRelevantEventTypes(action: keyof typeof RATE_LIMITS): SecurityEventType[] {
  switch (action) {
    case 'login':
      return [SecurityEventTypes.LOGIN_FAILED]
    case 'registration':
      return [SecurityEventTypes.REGISTRATION]
    case 'passwordReset':
      return [SecurityEventTypes.PASSWORD_RESET_REQUESTED]
    case 'emailVerification':
      return [SecurityEventTypes.EMAIL_VERIFICATION_SENT]
    default:
      return []
  }
}

// Check if user account should be locked
export async function checkAccountLock(userId: string): Promise<{
  isLocked: boolean
  lockUntil?: Date
  failedAttempts: number
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      loginAttempts: true,
      lockedUntil: true
    }
  })

  if (!user) {
    return { isLocked: false, failedAttempts: 0 }
  }

  const now = new Date()
  const isLocked = user.lockedUntil ? user.lockedUntil > now : false

  return {
    isLocked,
    lockUntil: user.lockedUntil || undefined,
    failedAttempts: user.loginAttempts
  }
}

// Lock user account after failed attempts
export async function lockUserAccount(userId: string, lockDurationMinutes: number = 30): Promise<void> {
  const lockUntil = new Date()
  lockUntil.setMinutes(lockUntil.getMinutes() + lockDurationMinutes)

  await db.user.update({
    where: { id: userId },
    data: {
      loginAttempts: { increment: 1 },
      lockedUntil: lockUntil
    }
  })

  // Log the account lock event
  await logSecurityEvent(SecurityEventTypes.ACCOUNT_LOCKED, {
    userId,
    success: true,
    details: {
      lockDurationMinutes,
      lockUntil: lockUntil.toISOString()
    }
  })
}

// Reset user login attempts on successful login
export async function resetLoginAttempts(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  })
}

// Increment failed login attempts
export async function incrementFailedAttempts(userId: string): Promise<void> {
  const MAX_ATTEMPTS = 5
  
  const user = await db.user.update({
    where: { id: userId },
    data: {
      loginAttempts: { increment: 1 }
    },
    select: {
      loginAttempts: true
    }
  })

  // Lock account if max attempts reached
  if (user.loginAttempts >= MAX_ATTEMPTS) {
    await lockUserAccount(userId)
  }
}

// Security middleware helper
export async function validateSecurityContext(
  request: NextRequest,
  action: keyof typeof RATE_LIMITS
): Promise<{
  allowed: boolean
  ipAddress: string
  userAgent: string
  rateLimit: Awaited<ReturnType<typeof checkRateLimit>>
}> {
  const ipAddress = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  
  const rateLimit = await checkRateLimit(action, ipAddress)

  if (!rateLimit.allowed) {
    await logSecurityEvent(SecurityEventTypes.RATE_LIMIT_EXCEEDED, {
      ipAddress,
      userAgent,
      success: false,
      details: {
        action,
        attempts: rateLimit.remainingAttempts
      }
    })
  }

  return {
    allowed: rateLimit.allowed,
    ipAddress,
    userAgent,
    rateLimit
  }
}

// Clean up old security logs (run periodically)
export async function cleanupSecurityLogs(retentionDays: number = 90): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  await db.securityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate
      }
    }
  })
}