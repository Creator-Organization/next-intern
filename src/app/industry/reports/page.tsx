import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Get analytics data
async function getAnalyticsData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  // Get opportunity stats
  const [
    totalOpportunities,
    activeOpportunities,
    totalViews,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    rejectedApplications,
    selectedApplications
  ] = await Promise.all([
    db.opportunity.count({
      where: { industryId: user.industry.id }
    }),
    db.opportunity.count({
      where: { 
        industryId: user.industry.id,
        isActive: true
      }
    }),
    db.opportunityView.count({
      where: {
        opportunity: {
          industryId: user.industry.id
        }
      }
    }),
    db.application.count({
      where: { industryId: user.industry.id }
    }),
    db.application.count({
      where: { 
        industryId: user.industry.id,
        status: 'PENDING'
      }
    }),
    db.application.count({
      where: { 
        industryId: user.industry.id,
        status: 'SHORTLISTED'
      }
    }),
    db.application.count({
      where: { 
        industryId: user.industry.id,
        status: 'REJECTED'
      }
    }),
    db.application.count({
      where: { 
        industryId: user.industry.id,
        status: 'SELECTED'
      }
    })
  ])

  // Get recent opportunities with their application counts
  const recentOpportunities = await db.opportunity.findMany({
    where: { industryId: user.industry.id },
    select: {
      id: true,
      title: true,
      type: true,
      viewCount: true,
      applicationCount: true,
      createdAt: true,
      isActive: true,
      _count: {
        select: {
          applications: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  // Calculate conversion rate
  const conversionRate = totalViews > 0 
    ? ((totalApplications / totalViews) * 100).toFixed(1)
    : '0'

  // Calculate success rate
  const successRate = totalApplications > 0
    ? ((selectedApplications / totalApplications) * 100).toFixed(1)
    : '0'

  return {
    isPremium: user.isPremium,
    stats: {
      totalOpportunities,
      activeOpportunities,
      totalViews,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      rejectedApplications,
      selectedApplications,
      conversionRate,
      successRate
    },
    recentOpportunities
  }
}

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { isPremium, stats, recentOpportunities } = await getAnalyticsData(session.user.id)

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Track your hiring performance and insights
        </p>
      </div>

      {/* Premium Notice */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Unlock Advanced Analytics</h3>
                <p className="text-purple-700 text-sm">
                  Get detailed insights, trends, and export reports with Premium
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalOpportunities}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeOpportunities} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalViews}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {stats.totalOpportunities > 0 ? Math.round(stats.totalViews / stats.totalOpportunities) : 0} per post
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalApplications}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.conversionRate}% conversion
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.successRate}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.selectedApplications} hired
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Pipeline */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle>Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Pending Review</p>
                  <p className="text-sm text-gray-600">Awaiting your response</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.pendingApplications}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Shortlisted</p>
                  <p className="text-sm text-gray-600">Ready for interviews</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.shortlistedApplications}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Selected</p>
                  <p className="text-sm text-gray-600">Successfully hired</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats.selectedApplications}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Rejected</p>
                  <p className="text-sm text-gray-600">Not a good fit</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats.rejectedApplications}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-semibold text-gray-900">{stats.conversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(stats.conversionRate), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Views to applications ratio
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-semibold text-gray-900">{stats.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(stats.successRate), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Applications to hires ratio
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    You have {stats.pendingApplications} applications waiting for review
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    Your opportunities average {stats.totalOpportunities > 0 ? Math.round(stats.totalViews / stats.totalOpportunities) : 0} views each
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    {stats.activeOpportunities} opportunities are currently accepting applications
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Opportunities Performance */}
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
        <CardHeader>
          <CardTitle>Recent Opportunities Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Opportunity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Applications</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Posted</th>
                </tr>
              </thead>
              <tbody>
                {recentOpportunities.map((opp) => (
                  <tr key={opp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{opp.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">
                        {opp.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700">
                      {opp.viewCount}
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-700">
                      {opp._count.applications}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 ${getStatusColor(opp.isActive)}`}>
                        {opp.isActive ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(opp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}