/**
 * Database Connection Utilities
 * NextIntern - Updated for 28-Table Schema
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

// Common Database Operations - Updated for 28-Table Schema
export const dbOperations = {
  // User Operations - Updated for new schema
  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: {
        candidate: true,    // Updated from student
        industry: true,     // Updated from company
        institute: true,    // Added institute
        preferences: true
      }
    })
  },

  async getUserById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        candidate: true,    // Updated from student
        industry: true,     // Updated from company
        institute: true,    // Added institute
        preferences: true
      }
    })
  },

  // Opportunity Operations - Updated from internship
  async getActiveOpportunities(take: number = 10, skip: number = 0) {
    return db.opportunity.findMany({
      where: { isActive: true },
      include: {
        industry: {         // Updated from company
          select: {
            companyName: true,
            logoUrl: true,
            city: true,
            state: true,
            isVerified: true,
            showCompanyName: true,
            anonymousId: true
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

  // Statistics - Updated for new schema
  async getPlatformStats() {
    const [
      totalUsers,
      totalCandidates,      // Updated from totalStudents
      totalIndustries,      // Updated from totalCompanies
      totalInstitutes,      // Added
      totalOpportunities,   // Updated from totalInternships
      totalApplications,
      activeOpportunities   // Updated from activeInternships
    ] = await Promise.all([
      db.user.count(),
      db.candidate.count(),         // Updated from student
      db.industry.count(),          // Updated from company
      db.institute.count(),         // Added
      db.opportunity.count(),       // Updated from internship
      db.application.count(),
      db.opportunity.count({ where: { isActive: true } })
    ])

    return {
      totalUsers,
      totalCandidates,
      totalIndustries,
      totalInstitutes,
      totalOpportunities,
      totalApplications,
      activeOpportunities
    }
  },

  // New helper methods for 28-table schema features
  async getVerifiedIndustries() {
    return db.industry.count({ where: { isVerified: true } })
  },

  async getPremiumUsers() {
    return db.user.count({ where: { isPremium: true } })
  },

  async getCompanyPostingStats(industryId: string) {
    const industry = await db.industry.findUnique({
      where: { id: industryId },
      select: {
        monthlyPostLimit: true,
        currentMonthPosts: true,
        lastPostLimitReset: true
      }
    })

    if (!industry) return null

    const now = new Date()
    const shouldReset = industry.lastPostLimitReset.getMonth() !== now.getMonth() || 
                       industry.lastPostLimitReset.getFullYear() !== now.getFullYear()

    return {
      ...industry,
      shouldReset,
      canPost: industry.currentMonthPosts < industry.monthlyPostLimit
    }
  },

  // Privacy-aware queries
  async getCandidateProfile(candidateId: string, viewerType: 'CANDIDATE' | 'INDUSTRY' | 'INSTITUTE' | 'ADMIN') {
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      include: {
        user: {
          select: {
            email: true,
            isVerified: true,
            isPremium: true
          }
        },
        skills: true,
        certificates: true
      }
    })

    if (!candidate) return null

    // Apply privacy rules based on viewer type and candidate settings
    const canViewFullName = candidate.showFullName || viewerType === 'ADMIN'
    const canViewContact = candidate.showContact || viewerType === 'ADMIN'

    return {
      ...candidate,
      // Apply privacy filters
      firstName: canViewFullName ? candidate.firstName : 'Anonymous',
      lastName: canViewFullName ? candidate.lastName : 'Candidate',
      phone: canViewContact ? candidate.phone : null,
      user: {
        ...candidate.user,
        email: canViewContact ? candidate.user.email : null
      }
    }
  },

  async getIndustryProfile(industryId: string) {
    const industry = await db.industry.findUnique({
      where: { id: industryId },
      include: {
        user: {
          select: {
            email: true,
            isVerified: true,
            isPremium: true
          }
        },
        opportunities: {
          where: { isActive: true },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!industry) return null

    // Apply privacy rules
    return {
      ...industry,
      companyName: industry.showCompanyName 
        ? industry.companyName 
        : `Company #${industry.anonymousId.slice(-6)}`,
      // Hide sensitive fields for non-premium viewers
      email: industry.user.isPremium ? industry.email : null,
      phone: industry.user.isPremium ? industry.phone : null
    }
  }
}

// Export default instance
export default db