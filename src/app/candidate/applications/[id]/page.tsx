import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

async function getApplicationDetails(applicationId: string, userId: string) {
  const candidate = await db.candidate.findUnique({
    where: { userId }
  })

  if (!candidate) {
    throw new Error('Candidate profile not found')
  }

  const application = await db.application.findFirst({
    where: {
      id: applicationId,
      candidateId: candidate.id
    },
    include: {
      opportunity: {
        include: {
          industry: {
            select: {
              companyName: true,
              isVerified: true,
              industry: true
            }
          },
          location: true,
          category: true
        }
      },
      interviews: {
        orderBy: { scheduledAt: 'desc' }
      }
    }
  })

  if (!application) {
    throw new Error('Application not found')
  }

  return { candidate, application }
}

export default async function ApplicationDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const resolvedParams = await params
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  const { application } = await getApplicationDetails(resolvedParams.id, session.user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SELECTED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'SHORTLISTED': return 'text-blue-600 bg-blue-100'
      case 'INTERVIEW_SCHEDULED': return 'text-purple-600 bg-purple-100'
      case 'REVIEWED': return 'text-orange-600 bg-orange-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SELECTED': return <CheckCircle className="h-6 w-6" />
      case 'REJECTED': return <XCircle className="h-6 w-6" />
      case 'SHORTLISTED': return <TrendingUp className="h-6 w-6" />
      case 'INTERVIEW_SCHEDULED': return <Eye className="h-6 w-6" />
      default: return <Clock className="h-6 w-6" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/candidate/applications" className="text-primary-600 hover:text-primary-700 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Application Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                    Application Details
                  </h1>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="font-semibold">{application.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{application.opportunity.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{application.opportunity.industry.companyName}</span>
                        {application.opportunity.industry.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{application.opportunity.location.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Applied On</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{formatDate(application.appliedAt)}</p>
                      </div>
                    </div>
                    {application.reviewedAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Reviewed On</p>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{formatDate(application.reviewedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interviews */}
            {application.interviews.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Interviews
                  </h3>
                  <div className="space-y-4">
                    {application.interviews.map((interview) => (
                      <div key={interview.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            interview.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                            interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {interview.status}
                          </span>
                          <p className="text-sm text-gray-600">{interview.type}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(interview.scheduledAt)}</span>
                        </div>
                        {interview.meetingUrl && (
                          <a 
                            href={interview.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                          >
                            Join Meeting →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Link href={`/candidate/opportunities/${application.opportunity.id}`}>
                  <Button variant="secondary" className="w-full">
                    View Opportunity
                  </Button>
                </Link>
                <Link href="/candidate/messages">
                  <Button variant="secondary" className="w-full">
                    Contact Company
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card className={
              application.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200' :
              application.status === 'SHORTLISTED' ? 'bg-blue-50 border-blue-200' :
              application.status === 'SELECTED' ? 'bg-green-50 border-green-200' :
              'bg-gray-50'
            }>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    application.status === 'PENDING' ? 'text-yellow-600' :
                    application.status === 'SHORTLISTED' ? 'text-blue-600' :
                    application.status === 'SELECTED' ? 'text-green-600' :
                    'text-gray-600'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">What&apos;s Next?</h4>
                    <p className="text-sm text-gray-700">
                      {application.status === 'PENDING' && 'Your application is under review. The company will contact you if shortlisted.'}
                      {application.status === 'SHORTLISTED' && 'Congratulations! Prepare for the interview. Check your messages regularly.'}
                      {application.status === 'SELECTED' && 'Congratulations! You have been selected. Check your messages for next steps.'}
                      {application.status === 'REJECTED' && 'Thank you for applying. Keep exploring other opportunities.'}
                      {application.status === 'REVIEWED' && 'Your application has been reviewed. The company will update you soon.'}
                      {application.status === 'INTERVIEW_SCHEDULED' && 'Interview scheduled! Prepare well and check meeting details above.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}