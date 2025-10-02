import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import PostOpportunityForm from '@/components/industry/PostOpportunityForm'

// Get categories and locations for form dropdowns
async function getFormData() {
  const [categories, locations] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { sortOrder: 'asc' }
    }),
    db.location.findMany({
      where: { isActive: true },
      select: {
        id: true,
        city: true,
        state: true,
        country: true
      },
      orderBy: [
        { country: 'asc' },
        { state: 'asc' },
        { city: 'asc' }
      ]
    })
  ])

  return { categories, locations }
}

// Get posting limits for free users
async function getPostingLimits(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      industry: {
        select: { id: true }
      }
    }
  })

  if (!user?.industry?.id || user.isPremium) {
    return { canPost: true, limits: null }
  }

  // Get current month's post counts
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const postCounts = await db.opportunity.groupBy({
    by: ['type'],
    where: {
      industryId: user.industry.id,
      createdAt: { gte: startOfMonth }
    },
    _count: true
  })

  const limits = {
    INTERNSHIP: 3 - (postCounts.find(p => p.type === 'INTERNSHIP')?._count || 0),
    PROJECT: 3 - (postCounts.find(p => p.type === 'PROJECT')?._count || 0),
    FREELANCING: 0 // Free users cannot post freelancing
  }

  return {
    canPost: Object.values(limits).some(l => l > 0),
    limits
  }
}

export default async function PostOpportunityPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const [{ categories, locations }, postingLimits] = await Promise.all([
    getFormData(),
    getPostingLimits(session.user.id)
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">
          Post New Opportunity
        </h1>
        <p className="text-gray-600">
          Create an internship, project, or freelancing opportunity for candidates
        </p>
      </div>

      {/* Premium Upgrade Notice for Free Users */}
      {!session.user.isPremium && postingLimits.limits && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">
                Free Account Posting Limits
              </h3>
              <div className="space-y-1 text-sm text-purple-700">
                <p>✅ Internships: {postingLimits.limits.INTERNSHIP} remaining this month</p>
                <p>✅ Projects: {postingLimits.limits.PROJECT} remaining this month</p>
                <p>🔒 Freelancing: Premium only</p>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Limits reset on the 1st of each month
              </p>
            </div>
            <a href="/industry/billing">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Upgrade to Premium
              </button>
            </a>
          </div>
        </div>
      )}

      {/* Form Component */}
      <PostOpportunityForm
        categories={categories}
        locations={locations}
        isPremium={session.user.isPremium}
        postingLimits={postingLimits.limits}
      />
    </div>
  )
}