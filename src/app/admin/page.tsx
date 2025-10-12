import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { 
  Users, 
  Building2, 
  GraduationCap, 
  Briefcase,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function AdminDashboard() {
  // ✅ FIX: Use auth() instead of getServerSession
  const session = await auth()

  if (!session?.user || session.user.userType !== 'ADMIN') {
    redirect('/')
  }

  // Fetch platform-wide metrics
  const [
    totalUsers,
    candidateCount,
    industryCount,
    instituteCount,
    opportunityCount,
    applicationCount,
    pendingIndustries,
    pendingInstitutes,
    openTickets
  ] = await Promise.all([
    db.user.count(),
    db.candidate.count(),
    db.industry.count(),
    db.institute.count(),
    db.opportunity.count(),
    db.application.count(),
    db.industry.count({ where: { isVerified: false } }),
    db.institute.count({ where: { isVerified: false } }),
    db.supportTicket.count({ where: { status: 'OPEN' } })
  ])

  const premiumUsers = await db.user.count({ where: { isPremium: true } })
  const activeOpportunities = await db.opportunity.count({ where: { isActive: true } })

  // Get recent users (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const newUsersThisWeek = await db.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Platform overview and management controls
        </p>
      </div>

      {/* Alert Section - Pending Actions */}
      {(pendingIndustries > 0 || pendingInstitutes > 0 || openTickets > 0) && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Action Required</h3>
              <div className="space-y-1 text-sm text-orange-800">
                {pendingIndustries > 0 && (
                  <p>• {pendingIndustries} industries pending verification</p>
                )}
                {pendingInstitutes > 0 && (
                  <p>• {pendingInstitutes} institutes pending verification</p>
                )}
                {openTickets > 0 && (
                  <p>• {openTickets} open support tickets</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">+{newUsersThisWeek} this week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Opportunities</p>
              <p className="text-3xl font-bold text-gray-900">{opportunityCount}</p>
              <p className="text-xs text-gray-500 mt-1">{activeOpportunities} active</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{applicationCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Premium Users</p>
              <p className="text-3xl font-bold text-gray-900">{premiumUsers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0}% conversion
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* User Breakdown */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">User Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{candidateCount}</p>
              </div>
            </div>
            <Link href="/admin/users?type=candidate">
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Industries</p>
                <p className="text-2xl font-bold text-gray-900">{industryCount}</p>
              </div>
            </div>
            <Link href="/admin/users?type=industry">
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Institutes</p>
                <p className="text-2xl font-bold text-gray-900">{instituteCount}</p>
              </div>
            </div>
            <Link href="/admin/users?type=institute">
              <Button variant="ghost" size="sm">View</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/industries">
            <Button 
              variant="secondary" 
              className="w-full justify-start relative"
            >
              <Shield className="w-5 h-5 mr-3" />
              Verify Industries
              {pendingIndustries > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingIndustries}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/admin/institutes">
            <Button 
              variant="secondary" 
              className="w-full justify-start relative"
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              Verify Institutes
              {pendingInstitutes > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingInstitutes}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/admin/opportunities">
            <Button variant="secondary" className="w-full justify-start">
              <Briefcase className="w-5 h-5 mr-3" />
              Moderate Content
            </Button>
          </Link>

          <Link href="/admin/support">
            <Button 
              variant="secondary" 
              className="w-full justify-start relative"
            >
              <Clock className="w-5 h-5 mr-3" />
              Support Tickets
              {openTickets > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {openTickets}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}