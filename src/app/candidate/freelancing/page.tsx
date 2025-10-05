import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  Crown,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

async function getFreelancingData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: true
    }
  })

  if (!user?.candidate) {
    throw new Error('Candidate profile not found')
  }

  // Get freelancing opportunities (premium only)
  const opportunities = await db.opportunity.findMany({
    where: {
      type: 'FREELANCING',
      isActive: true
    },
    include: {
      industry: {
        select: {
          companyName: true,
          isVerified: true,
          showCompanyName: true,
          anonymousId: true
        }
      },
      location: true,
      category: true,
      skills: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  return {
    user,
    candidate: user.candidate,
    opportunities
  }
}

export default async function FreelancingHubPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  const { user, candidate, opportunities } = await getFreelancingData(session.user.id)

  // Check if user has premium access
  if (!user.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header user={{
          id: session.user.id,
          email: session.user.email,
          userType: session.user.userType,
          candidate: session.user.candidate ? {
            firstName: session.user.candidate.firstName,
            lastName: session.user.candidate.lastName
          } : undefined
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 text-white">
            <CardContent className="p-12 text-center">
              <Crown className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
              <h1 className="text-4xl font-bold mb-4 font-manrope">
                Premium Feature: Freelancing Hub
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Access exclusive freelancing opportunities, work on exciting projects, and earn while you learn. Upgrade to premium to unlock this feature.
              </p>
              <Link href="/candidate/premium">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Exclusive Projects</h3>
                <p className="text-gray-600 text-sm">Access high-paying freelancing opportunities from top companies</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Earnings</h3>
                <p className="text-gray-600 text-sm">Work on your schedule and earn competitive rates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Build Portfolio</h3>
                <p className="text-gray-600 text-sm">Gain real-world experience and strengthen your resume</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={{
        id: session.user.id,
        email: session.user.email,
        userType: session.user.userType,
        candidate: session.user.candidate ? {
          firstName: session.user.candidate.firstName,
          lastName: session.user.candidate.lastName
        } : undefined
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 font-manrope">Freelancing Hub</h1>
          </div>
          <p className="text-gray-600">
            Exclusive freelancing opportunities curated for premium members
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Pay Rate</p>
                  <p className="text-2xl font-bold text-green-600">₹800/hr</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">94%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Freelancers</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <Users className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 font-manrope">
                        {opportunity.title}
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Freelancing
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">{opportunity.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-green-600">
                          {opportunity.currency}{opportunity.stipend?.toLocaleString() || 'Negotiable'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{opportunity.duration ? `${opportunity.duration} weeks` : 'Flexible'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{opportunity.industry.companyName}</span>
                        {opportunity.industry.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/candidate/opportunities/${opportunity.id}`}>
                    <Button>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {opportunity.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {opportunity.skills.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Premium Perks */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Premium Member Benefits</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Direct access to clients without middlemen</li>
                  <li>• Higher pay rates than regular marketplaces</li>
                  <li>• Verified companies and secure payments</li>
                  <li>• Priority support for any issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}