import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Star,
  Plus,
  ArrowRight,
  DollarSign,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface DashboardStats {
  totalOpportunities: number
  activeOpportunities: number
  totalApplications: number
  pendingApplications: number
  totalViews: number
  messagesCount: number
  conversionRate: number
}

interface RecentActivity {
  id: string
  type: 'application' | 'view' | 'message'
  title: string
  description: string
  time: string
  candidateName?: string
}

interface TopOpportunity {
  id: string
  title: string
  type: string
  applications: number
  views: number
  conversionRate: number
}

// Get dashboard data for industry
async function getIndustryDashboardData(userId: string) {
  // Get industry ID
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const industryId = user.industry.id

  // Get opportunities with application counts
  const opportunities = await db.opportunity.findMany({
    where: { industryId },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  })

  // Get recent applications
  const recentApplications = await db.application.findMany({
    where: { industryId },
    include: {
      candidate: {
        select: {
          firstName: true,
          lastName: true,
          anonymousId: true
        }
      },
      opportunity: {
        select: {
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Calculate stats
  const totalOpportunities = opportunities.length
  const activeOpportunities = opportunities.filter(o => o.isActive).length
  const totalApplications = opportunities.reduce((sum, o) => sum + o._count.applications, 0)
  const pendingApplications = recentApplications.filter(a => a.status === 'PENDING').length
  const totalViews = opportunities.reduce((sum, o) => sum + o.viewCount, 0)
  
  const stats: DashboardStats = {
    totalOpportunities,
    activeOpportunities,
    totalApplications,
    pendingApplications,
    totalViews,
    messagesCount: 5, // Mock data - replace with real message count
    conversionRate: totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0
  }

  // Process recent activity
  const recentActivity: RecentActivity[] = recentApplications.slice(0, 5).map(app => ({
    id: app.id,
    type: 'application' as const,
    title: `New application for ${app.opportunity.title}`,
    description: `Applied ${new Date(app.createdAt).toLocaleDateString()}`,
    time: formatTimeAgo(app.createdAt),
    candidateName: user.isPremium 
      ? `${app.candidate.firstName} ${app.candidate.lastName}`
      : `Candidate ${app.candidate.anonymousId}`
  }))

  // Get top performing opportunities
  const topOpportunities: TopOpportunity[] = opportunities
    .map(opp => ({
      id: opp.id,
      title: opp.title,
      type: opp.type,
      applications: opp._count.applications,
      views: opp.viewCount,
      conversionRate: opp.viewCount > 0 ? Math.round((opp._count.applications / opp.viewCount) * 100) : 0
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 3)

  return {
    stats,
    recentActivity,
    topOpportunities,
    isPremium: user.isPremium,
    companyName: user.industry.companyName
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  return `${days} days ago`
}

export default async function IndustryDashboardPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { stats, recentActivity, topOpportunities, isPremium, companyName } = 
    await getIndustryDashboardData(session.user.id)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-manrope">
            Welcome back, {companyName}!
          </h1>
          <p className="text-gray-600">Here&#39;s what&#39;s happening with your opportunities today.</p>
        </div>
        <Link href="/industry/post">
          <Button className="bg-gradient-to-r from-teal-600 to-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Post New Opportunity
          </Button>
        </Link>
      </div>

      {/* Premium Upgrade Notice */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Unlock Premium Features</h3>
                <p className="text-purple-700 text-sm">
                  See full candidate details, unlimited posting, and advanced analytics
                </p>
              </div>
              <Link href="/industry/billing">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOpportunities}</p>
                <p className="text-xs text-gray-500">of {stats.totalOpportunities} total</p>
              </div>
              <Briefcase className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-xs text-gray-500">{stats.pendingApplications} pending review</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                <p className="text-xs text-gray-500">{stats.conversionRate}% conversion rate</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messagesCount}</p>
                <p className="text-xs text-gray-500">Unread messages</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Link href="/industry/applications">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'application' && <Users className="h-4 w-4 text-teal-600" />}
                    {activity.type === 'view' && <Eye className="h-4 w-4 text-teal-600" />}
                    {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-teal-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.candidateName}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Opportunities */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Performing Opportunities</span>
              <Link href="/industry/opportunities">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topOpportunities.length > 0 ? (
              topOpportunities.map((opportunity, index) => (
                <div key={opportunity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-teal-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{opportunity.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {opportunity.applications} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {opportunity.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {opportunity.conversionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No opportunities posted yet</p>
                <Link href="/industry/post">
                  <Button size="sm" className="mt-2">Post Your First</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/industry/post">
              <Card className="border-2 border-dashed border-teal-200 hover:border-teal-400 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Post New Opportunity</h3>
                  <p className="text-sm text-gray-600">Create internship or project</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/industry/applications">
              <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Review Applications</h3>
                  <p className="text-sm text-gray-600">Check new candidates</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/industry/messages">
              <Card className="border-2 border-dashed border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Message Candidates</h3>
                  <p className="text-sm text-gray-600">Start conversations</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}