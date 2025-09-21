import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Users, Filter, Search, Eye, MessageSquare, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

// Define types for processed data
interface ProcessedCandidate {
  id: string
  displayName: string
  location: string
  bio: string | null
  skills: string[]
  isAnonymous: boolean
}

interface ProcessedApplication {
  id: string
  status: string
  createdAt: Date
  candidate: ProcessedCandidate
  opportunityTitle: string
}

// Get industry applications with privacy controls
async function getIndustryApplications(userId: string) {
  // First get the industry ID
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const industryId = user.industry.id
  const isPremium = user.isPremium

  // Get applications for this industry
  const applications = await db.application.findMany({
    where: {
      industryId
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get opportunities separately to get titles
  const opportunityIds = [...new Set(applications.map(app => app.opportunityId))]
  const opportunities = await db.opportunity.findMany({
    where: {
      id: { in: opportunityIds }
    },
    select: {
      id: true,
      title: true
    }
  })
  const opportunityMap = new Map(opportunities.map(opp => [opp.id, opp.title]))

  // Get candidates separately
  const candidateIds = [...new Set(applications.map(app => app.candidateId))]
  const candidates = await db.candidate.findMany({
    where: {
      id: { in: candidateIds }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      city: true,
      state: true,
      bio: true,
      anonymousId: true
    }
  })
  const candidateMap = new Map(candidates.map(c => [c.id, c]))

  // Get candidate skills separately
  const candidateSkills = await db.candidateSkill.findMany({
    where: {
      candidateId: { in: candidateIds }
    }
  })

  // Group skills by candidate
  const skillsByCandidate = candidateSkills.reduce((acc: Record<string, string[]>, skill) => {
    if (!acc[skill.candidateId]) acc[skill.candidateId] = []
    acc[skill.candidateId].push(skill.skillName)
    return acc
  }, {})

  // Process applications
  const processedApplications: ProcessedApplication[] = applications.map(application => {
    const candidate = candidateMap.get(application.candidateId)
    const opportunityTitle = opportunityMap.get(application.opportunityId) || 'Unknown Opportunity'
    
    if (!candidate) {
      throw new Error(`Candidate not found: ${application.candidateId}`)
    }
    
    return {
      id: application.id,
      status: application.status,
      createdAt: application.createdAt,
      opportunityTitle,
      candidate: {
        id: candidate.id,
        displayName: isPremium 
          ? `${candidate.firstName} ${candidate.lastName}` 
          : `Candidate ${candidate.anonymousId}`,
        location: isPremium && candidate.city && candidate.state
          ? `${candidate.city}, ${candidate.state}` 
          : 'Location Hidden',
        bio: isPremium ? candidate.bio : null,
        skills: skillsByCandidate[candidate.id] || [],
        isAnonymous: !isPremium
      }
    }
  })

  return {
    applications: processedApplications,
    isPremium,
    stats: {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      reviewed: applications.filter(a => a.status === 'REVIEWED').length,
      shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length
    }
  }
}

export default async function ApplicationsPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { applications, isPremium, stats } = await getIndustryApplications(session.user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-manrope">Student Applications</h2>
          <p className="text-gray-600">Review and manage applications for your opportunities</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Upgrade Notice */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Upgrade to See Full Candidate Details</h3>
                <p className="text-purple-700 text-sm">
                  Premium members can see candidate names, contact information, and detailed profiles
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

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <Card
            key={application.id}
            className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-teal-700">
                      {application.candidate.displayName.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {application.candidate.displayName}
                      </h3>
                      {application.candidate.isAnonymous && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Anonymous
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Applied for: {application.opportunityTitle}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">4.8</span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.candidate.location}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {application.candidate.skills.slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {application.candidate.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{application.candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Bio (Premium only) */}
                    {application.candidate.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.candidate.bio}
                      </p>
                    )}

                    {/* Premium prompt */}
                    {application.candidate.isAnonymous && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">
                          🔒 Full profile details available with Premium membership
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === 'SHORTLISTED' 
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'REVIEWED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {application.status.replace('_', ' ')}
                  </span>
                  
                  <Link href={`/industry/messages?candidate=${application.candidate.id}`}>
                    <Button variant="secondary">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </Link>
                  
                  <Link href={`/industry/applications/${application.id}`}>
                    <Button variant="secondary">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {applications.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">
              Applications will appear here once candidates start applying to your opportunities.
            </p>
            <Link href="/industry/post">
              <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                Post Your First Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}