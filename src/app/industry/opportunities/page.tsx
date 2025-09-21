import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Plus, Eye, Edit, Calendar, Users, DollarSign, MoreVertical, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface OpportunityWithStats {
  id: string
  title: string
  type: string
  status: string
  applicationDeadline: Date | null
  createdAt: Date
  category: { name: string } | null
  applicationCount: number
  viewCount: number
  isPaid: boolean
  stipend: number | null
}

// Get industry opportunities with statistics
async function getIndustryOpportunities(userId: string) {
  // Get industry ID
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const industryId = user.industry.id

  // Get opportunities
  const opportunities = await db.opportunity.findMany({
    where: { industryId },
    include: {
      category: {
        select: { name: true }
      },
      _count: {
        select: { applications: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Process opportunities with stats
  const processedOpportunities: OpportunityWithStats[] = opportunities.map(opp => ({
    id: opp.id,
    title: opp.title,
    type: opp.type,
    status: opp.isActive ? 'Active' : 'Inactive',
    applicationDeadline: opp.applicationDeadline,
    createdAt: opp.createdAt,
    category: opp.category,
    applicationCount: opp._count.applications,
    viewCount: opp.viewCount,
    isPaid: opp.stipend !== null && opp.stipend > 0,
    stipend: opp.stipend
  }))

  return {
    opportunities: processedOpportunities,
    stats: {
      total: opportunities.length,
      active: opportunities.filter(o => o.isActive).length,
      totalApplications: opportunities.reduce((sum, o) => sum + o._count.applications, 0),
      totalViews: opportunities.reduce((sum, o) => sum + o.viewCount, 0)
    }
  }
}

export default async function OpportunitiesPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { opportunities, stats } = await getIndustryOpportunities(session.user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INTERNSHIP': return 'bg-blue-100 text-blue-800'
      case 'PROJECT': return 'bg-purple-100 text-purple-800'
      case 'FREELANCING': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'No deadline'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-manrope">Your Opportunities</h2>
          <p className="text-gray-600">Manage and track your active internships and projects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="secondary">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Link href="/industry/post">
            <Button className="bg-gradient-to-r from-teal-600 to-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Post New
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-teal-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <Card
            key={opportunity.id}
            className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{opportunity.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type.toLowerCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                      {opportunity.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{opportunity.category?.name || 'No category'}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.applicationCount} applications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{opportunity.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {formatDate(opportunity.applicationDeadline)}</span>
                    </div>
                    {opportunity.isPaid && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{opportunity.stipend?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Posted on {formatDate(opportunity.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/industry/opportunities/${opportunity.id}`}>
                    <Button variant="secondary">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/industry/opportunities/${opportunity.id}/edit`}>
                    <Button variant="secondary">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {opportunities.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Yet</h3>
            <p className="text-gray-600 mb-6">
              Start connecting with talented candidates by posting your first opportunity.
            </p>
            <Link href="/industry/post">
              <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}