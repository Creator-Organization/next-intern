import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { 
  Users, 
  TrendingUp, 
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function AdminAnalytics() {
  const session = await auth()

  if (!session?.user || session.user.userType !== 'ADMIN') {
    redirect('/')
  }

  // ✅ User Analytics
  const totalUsers = await db.user.count()
  const usersByType = {
    candidate: await db.user.count({ where: { userType: 'CANDIDATE' } }),
    industry: await db.user.count({ where: { userType: 'INDUSTRY' } }),
    institute: await db.user.count({ where: { userType: 'INSTITUTE' } }),
    admin: await db.user.count({ where: { userType: 'ADMIN' } })
  }

  const premiumUsers = await db.user.count({ where: { isPremium: true } })
  const activeUsers = await db.user.count({ where: { isActive: true } })
  const premiumConversion = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0'

  // ✅ Opportunity Analytics
  const totalOpportunities = await db.opportunity.count()
  const opportunitiesByType = {
    internship: await db.opportunity.count({ where: { type: 'INTERNSHIP' } }),
    project: await db.opportunity.count({ where: { type: 'PROJECT' } }),
    freelancing: await db.opportunity.count({ where: { type: 'FREELANCING' } })
  }

  const activeOpportunities = await db.opportunity.count({ where: { isActive: true } })

  // ✅ Application Analytics
  const totalApplications = await db.application.count()
  const applicationsByStatus = {
    pending: await db.application.count({ where: { status: 'PENDING' } }),
    reviewed: await db.application.count({ where: { status: 'REVIEWED' } }),
    shortlisted: await db.application.count({ where: { status: 'SHORTLISTED' } }),
    selected: await db.application.count({ where: { status: 'SELECTED' } }),
    rejected: await db.application.count({ where: { status: 'REJECTED' } })
  }

  const successRate = totalApplications > 0 
    ? ((applicationsByStatus.selected / totalApplications) * 100).toFixed(1) 
    : '0.0'

  // ✅ Growth metrics (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newUsersLast30Days = await db.user.count({
    where: { createdAt: { gte: thirtyDaysAgo } }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Platform Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive platform metrics and insights</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">+{newUsersLast30Days} last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Opportunities</p>
              <p className="text-3xl font-bold text-gray-900">{totalOpportunities}</p>
              <p className="text-xs text-gray-500 mt-1">{activeOpportunities} active</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              <p className="text-xs text-green-600 mt-1">{successRate}% success rate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Premium Rate</p>
              <p className="text-3xl font-bold text-gray-900">{premiumConversion}%</p>
              <p className="text-xs text-gray-500 mt-1">{premiumUsers} premium users</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* User Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          User Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{usersByType.candidate}</p>
            <p className="text-sm text-gray-600 mt-1">Candidates</p>
            <p className="text-xs text-gray-500">
              {totalUsers > 0 ? ((usersByType.candidate / totalUsers) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{usersByType.industry}</p>
            <p className="text-sm text-gray-600 mt-1">Industries</p>
            <p className="text-xs text-gray-500">
              {totalUsers > 0 ? ((usersByType.industry / totalUsers) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{usersByType.institute}</p>
            <p className="text-sm text-gray-600 mt-1">Institutes</p>
            <p className="text-xs text-gray-500">
              {totalUsers > 0 ? ((usersByType.institute / totalUsers) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{usersByType.admin}</p>
            <p className="text-sm text-gray-600 mt-1">Admins</p>
            <p className="text-xs text-gray-500">
              {totalUsers > 0 ? ((usersByType.admin / totalUsers) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </Card>

      {/* Opportunity Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          Opportunity Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{opportunitiesByType.internship}</p>
            <p className="text-sm text-gray-600 mt-1">Internships</p>
            <p className="text-xs text-gray-500">
              {totalOpportunities > 0 ? ((opportunitiesByType.internship / totalOpportunities) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{opportunitiesByType.project}</p>
            <p className="text-sm text-gray-600 mt-1">Projects</p>
            <p className="text-xs text-gray-500">
              {totalOpportunities > 0 ? ((opportunitiesByType.project / totalOpportunities) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{opportunitiesByType.freelancing}</p>
            <p className="text-sm text-gray-600 mt-1">Freelancing</p>
            <p className="text-xs text-gray-500">
              {totalOpportunities > 0 ? ((opportunitiesByType.freelancing / totalOpportunities) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      </Card>

      {/* Application Status Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Application Status Distribution
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{applicationsByStatus.pending}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (applicationsByStatus.pending / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Reviewed</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{applicationsByStatus.reviewed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (applicationsByStatus.reviewed / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Shortlisted</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{applicationsByStatus.shortlisted}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (applicationsByStatus.shortlisted / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Selected</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{applicationsByStatus.selected}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (applicationsByStatus.selected / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Rejected</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{applicationsByStatus.rejected}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (applicationsByStatus.rejected / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Health */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Active vs Inactive Users</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-600">{totalUsers - activeUsers}</p>
                <p className="text-xs text-gray-500">Inactive</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Premium Conversion</p>
            <p className="text-2xl font-bold text-yellow-600">{premiumConversion}%</p>
            <p className="text-xs text-gray-500">{premiumUsers} of {totalUsers} users</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Avg Applications per Opportunity</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalOpportunities > 0 ? (totalApplications / totalOpportunities).toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-gray-500">per posting</p>
          </div>
        </div>
      </Card>
    </div>
  )
}