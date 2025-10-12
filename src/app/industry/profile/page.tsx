/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  Building2,
  MapPin,
  Users,
  Calendar,
  Mail,
  Phone,
  Globe,
  Linkedin,
  CheckCircle,
  AlertCircle,
  Edit,
  Shield,
  Eye,
  EyeOff,
  Settings  // ✅ ADD THIS
} from 'lucide-react'
import Link from 'next/link'

// Get industry profile
async function getIndustryProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      industry: true,
      subscription: true
    }
  })

  if (!user?.industry) {
    throw new Error('Industry profile not found')
  }

  // Get statistics
  const [totalOpportunities, activeOpportunities, totalApplications] = await Promise.all([
    db.opportunity.count({
      where: { industryId: user.industry.id }
    }),
    db.opportunity.count({
      where: { 
        industryId: user.industry.id,
        isActive: true
      }
    }),
    db.application.count({
      where: { industryId: user.industry.id }
    })
  ])

  return {
    user,
    industry: user.industry,
    subscription: user.subscription,
    stats: {
      totalOpportunities,
      activeOpportunities,
      totalApplications
    }
  }
}

export default async function IndustryProfilePage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { user, industry, subscription, stats } = await getIndustryProfile(session.user.id)

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'STARTUP': return '1-10 employees'
      case 'SMALL': return '11-50 employees'
      case 'MEDIUM': return '51-200 employees'
      case 'LARGE': return '201-1000 employees'
      case 'ENTERPRISE': return '1000+ employees'
      default: return size
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session.user as any} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                Company Profile
              </h1>
              <p className="text-gray-600">
                Manage your company information and public profile
              </p>
            </div>
            <Link href="/industry/profile/edit">
              <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Verification Status */}
          <Card className={`border-2 ${industry.isVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {industry.isVerified ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {industry.isVerified ? 'Verified Company ✓' : 'Verification Pending'}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {industry.isVerified 
                        ? `Your company was verified on ${formatDate(industry.verifiedAt)}. This builds trust with candidates.`
                        : 'Complete your profile to get verified and build trust with candidates. Verification increases application rates by 3x.'
                      }
                    </p>
                  </div>
                </div>
                {!industry.isVerified && (
                  <Link href="/industry/profile/verification">
                    <Button variant="secondary" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Shield className="h-4 w-4 mr-2" />
                      Request Verification
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Account Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.isPremium ? '✨ Premium' : 'Free'}
                    </p>
                    {user.isPremium && (
                      <p className="text-xs text-teal-600">Full candidate access</p>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Post Limit</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {industry.currentMonthPosts} / {user.isPremium ? '∞' : industry.monthlyPostLimit}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user.isPremium ? 'Unlimited' : `${industry.monthlyPostLimit - industry.currentMonthPosts} remaining`}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.totalApplications}
                    </p>
                    <p className="text-xs text-gray-600">All time</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name</label>
                      <p className="text-gray-900 mt-1 font-semibold">{industry.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Industry</label>
                      <p className="text-gray-900 mt-1">{industry.industry}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Size</label>
                      <p className="text-gray-900 mt-1">{getCompanySizeLabel(industry.companySize)}</p>
                    </div>
                    {industry.foundedYear && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Founded</label>
                        <p className="text-gray-900 mt-1">{industry.foundedYear}</p>
                      </div>
                    )}
                  </div>

                  {industry.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">About Company</label>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  )}

                  {!industry.description && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Tip:</strong> Add a compelling company description to attract more candidates!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {industry.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{industry.email}</p>
                      </div>
                    </div>
                  )}

                  {industry.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <p className="text-gray-900">{industry.phone}</p>
                      </div>
                    </div>
                  )}

                  {industry.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">Website</label>
                        <a 
                          href={industry.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          {industry.websiteUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {industry.linkedinUrl && (
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                        <a 
                          href={industry.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          {industry.linkedinUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {industry.address && <p className="text-gray-900">{industry.address}</p>}
                    <p className="text-gray-900">
                      {industry.city}, {industry.state}
                    </p>
                    <p className="text-gray-900">{industry.country}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Opportunities</p>
                    <p className="text-2xl font-bold text-teal-600">{stats.activeOpportunities}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applications Received</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(industry.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {industry.showCompanyName ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        )}
                        <p className="text-sm font-medium text-gray-900">Company Name Visibility</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {industry.showCompanyName 
                        ? '✓ Your company name is visible to all users' 
                        : '⚠️ Your company name is hidden from free users'
                      }
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Anonymous ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                        Company #{industry.anonymousId.slice(-8)}
                      </code>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Free candidates see this ID instead of your company name
                    </p>
                  </div>

                  <Link href="/industry/settings">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Privacy
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              {subscription && (
                <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.plan.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.endDate && (
                      <div>
                        <p className="text-sm text-gray-600">Expires On</p>
                        <p className="text-sm text-gray-900">{formatDate(subscription.endDate)}</p>
                      </div>
                    )}
                    <Link href="/industry/billing">
                      <Button variant="secondary" size="sm" className="w-full mt-2">
                        Manage Subscription
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Upgrade CTA */}
              {!user.isPremium && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-purple-900 mb-2">✨ Upgrade to Premium</h3>
                    <ul className="text-sm text-purple-700 mb-4 space-y-1">
                      <li>• Unlimited opportunity posting</li>
                      <li>• View candidate contact info</li>
                      <li>• Advanced analytics & reports</li>
                      <li>• Priority support</li>
                    </ul>
                    <Link href="/industry/billing">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        View Plans →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}