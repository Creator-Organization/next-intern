import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Video,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Get all interviews
async function getInterviews(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const isPremium = user.isPremium

  // Get all interviews
  const interviews = await db.interview.findMany({
    where: {
      industryId: user.industry.id
    },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          anonymousId: true,
          user: {
            select: {
              email: true
            }
          }
        }
      },
      application: {
        select: {
          id: true,
          opportunity: {
            select: {
              title: true,
              type: true
            }
          }
        }
      }
    },
    orderBy: {
      scheduledAt: 'asc'
    }
  })

  // Apply privacy controls
  const processedInterviews = interviews.map(interview => ({
    ...interview,
    candidate: isPremium ? {
      id: interview.candidate.id,
      displayName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
      email: interview.candidate.user.email,
      phone: interview.candidate.phone,
      isAnonymous: false
    } : {
      id: interview.candidate.id,
      displayName: `Candidate ${interview.candidate.anonymousId}`,
      email: null,
      phone: null,
      isAnonymous: true
    }
  }))

  // Group by status
  const upcoming = processedInterviews.filter(i => 
    i.status === 'SCHEDULED' && new Date(i.scheduledAt) > new Date()
  )
  const past = processedInterviews.filter(i => 
    i.status === 'COMPLETED' || new Date(i.scheduledAt) < new Date()
  )
  const cancelled = processedInterviews.filter(i => 
    i.status === 'CANCELLED'
  )

  return {
    upcoming,
    past,
    cancelled,
    isPremium
  }
}

export default async function InterviewsPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { upcoming, past, cancelled, isPremium } = await getInterviews(session.user.id)

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'PHONE': return <Phone className="h-4 w-4" />
      case 'IN_PERSON': return <Building className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        )
      case 'NO_SHOW':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No Show
          </span>
        )
      default:
        return null
    }
  }

  const InterviewCard = ({ interview }: { interview: typeof upcoming[0] }) => (
    <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {interview.candidate.displayName}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {interview.application.opportunity.title}
              </p>
            </div>
          </div>
          {getStatusBadge(interview.status)}
        </div>

        <div className="space-y-3">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDateTime(interview.scheduledAt)}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{interview.duration} minutes</span>
          </div>

          {/* Interview Type */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {getInterviewTypeIcon(interview.type)}
            <span className="capitalize">{interview.type.toLowerCase().replace('_', ' ')}</span>
          </div>

          {/* Location/Link */}
          {interview.meetingUrl && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-gray-500" />
              <a 
                href={interview.meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 truncate"
              >
                Join Meeting
              </a>
            </div>
          )}

          {interview.location && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="truncate">{interview.location}</span>
            </div>
          )}

          {/* Contact Info - Premium Only */}
          {isPremium && interview.candidate.email && (
            <div className="pt-3 border-t space-y-2">
              <p className="text-xs text-gray-500">Contact Information</p>
              <p className="text-sm text-gray-700 truncate">{interview.candidate.email}</p>
              {interview.candidate.phone && (
                <p className="text-sm text-gray-700">{interview.candidate.phone}</p>
              )}
            </div>
          )}

          {/* Description */}
          {interview.description && (
            <p className="text-sm text-gray-600 line-clamp-2 pt-2 border-t">
              {interview.description}
            </p>
          )}

          {/* Outcome for completed */}
          {interview.outcome && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">Outcome</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                {interview.outcome.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Link href={`/industry/applications/${interview.applicationId}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                View Application
              </Button>
            </Link>
            {interview.status === 'SCHEDULED' && (
              <Button size="sm" className="flex-1">
                Reschedule
              </Button>
            )}
            {interview.status === 'COMPLETED' && (
              <Button size="sm" className="flex-1">
                Add Feedback
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-manrope">
            Interview Schedule
          </h1>
          <p className="text-gray-600">
            Manage your interview schedule and feedback
          </p>
        </div>
        <Link href="/industry/shortlisted">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule New Interview
          </Button>
        </Link>
      </div>

      {/* Premium Notice */}
      {!isPremium && (upcoming.length > 0 || past.length > 0) && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Unlock Candidate Contact Details</h3>
                <p className="text-purple-700 text-sm">
                  Upgrade to Premium to access email and phone numbers for interviews
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{past.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{cancelled.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Interviews ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming.map(interview => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Interviews ({past.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {past.map(interview => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcoming.length === 0 && past.length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Interviews Scheduled
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by shortlisting candidates and scheduling interviews
                </p>
                <Link href="/industry/shortlisted">
                  <Button>
                    View Shortlisted Candidates
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}