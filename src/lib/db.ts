/**
 * Database Connection Utilities
 * NextIntern - Internship Platform
 */

import { PrismaClient } from '@prisma/client'

// Global Prisma Client Instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client Singleton
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Database Connection Test
export async function testDatabaseConnection() {
  try {
    await db.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful Shutdown
export async function disconnectDatabase() {
  try {
    await db.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

// Database Health Check
export async function getDatabaseHealth() {
  try {
    const startTime = Date.now()
    await db.$queryRaw`SELECT 1`
    const endTime = Date.now()
    
    return {
      status: 'healthy',
      responseTime: endTime - startTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Common Database Operations
export const dbOperations = {
  // User Operations
  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: {
        student: true,
        company: true,
        preferences: true
      }
    })
  },

  async getUserById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        student: true,
        company: true,
        preferences: true
      }
    })
  },

  // Internship Operations
  async getActiveInternships(take: number = 10, skip: number = 0) {
    return db.internship.findMany({
      where: { isActive: true },
      include: {
        company: {
          select: {
            companyName: true,
            logoUrl: true,
            city: true,
            state: true,
            isVerified: true
          }
        },
        category: true,
        location: true,
        skills: true,
        _count: {
          select: {
            applications: true,
            views: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    })
  },

  // Statistics
  async getPlatformStats() {
    const [
      totalUsers,
      totalStudents,
      totalCompanies,
      totalInternships,
      totalApplications,
      activeInternships
    ] = await Promise.all([
      db.user.count(),
      db.student.count(),
      db.company.count(),
      db.internship.count(),
      db.application.count(),
      db.internship.count({ where: { isActive: true } })
    ])

    return {
      totalUsers,
      totalStudents,
      totalCompanies,
      totalInternships,
      totalApplications,
      activeInternships
    }
  }
}

// Export default instance
export default db