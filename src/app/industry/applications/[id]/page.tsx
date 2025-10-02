import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Award,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Get application with privacy controls
async function getApplicationDetails(applicationId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const isPremium = user.isPremium

  // Get application with relations
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          state: true,
          country: true,
          bio: true,
          resumeUrl: true,
          portfolioUrl: true,
          linkedinUrl: true,
          githubUrl: true,
          anonymousId: true,
          college: true,
          degree: true,
          fieldOfStudy: true,
          graduationYear: true,
          cgpa: true,
          user: {
            select: {
              email: true
            }
          }
        }
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          type: true
        }
      }
    }
  })

  if (!application) {
    notFound()
  }

  // Check if this application belongs to this industry
  if (application.industryId !== user.industry.id) {
    redirect('/industry/applications')
  }

  // Get candidate skills
  const skills = await db.candidateSkill.findMany({
    where: { candidateId: application.candidateId },
    select: {
      skillName: true,
      proficiency: true,
      yearsOfExperience: true
    }
  })

  // Apply privacy controls
  const processedApplication = {
    ...application,
    candidate: isPremium ? {
      id: application.candidate.id,
      displayName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      email: application.candidate.user.email,
      phone: application.candidate.phone,
      city: application.candidate.city,
      state: application.candidate.state,
      country: application.candidate.country,
      bio: application.candidate.bio,
      resumeUrl: application.candidate.resumeUrl,
      portfolioUrl: application.candidate.portfolioUrl,
      linkedinUrl: application.candidate.linkedinUrl,
      githubUrl: application.candidate.githubUrl,
      college: application.candidate.college,
      degree: application.candidate.degree,
      fieldOfStudy: application.candidate.fieldOfStudy,
      graduationYear: application.candidate.graduationYear,
      cgpa: application.candidate.cgpa,
      isAnonymous: false
    } : {
      id: application.candidate.id,
      displayName: `Candidate ${application.candidate.anonymousId}`,
      email: null,
      phone: null,
      city: null,
      state: null,
      country: null,
      bio: application.candidate.bio,
      resumeUrl: null,
      portfolioUrl: null,
      linkedinUrl: null,
      githubUrl: null,
      college: application.candidate.college,
      degree: application.candidate.degree,
      fieldOfStudy: application.candidate.fieldOfStudy,
      graduationYear: application.candidate.graduationYear,
      cgpa: null,
      isAnonymous: true
    }
  }

  return {
    application: processedApplication,
    skills,
    isPremium
  }
}

export default async function ApplicationDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const resolvedParams = await params
  const { application, skills, isPremium } = await getApplicationDetails(
    resolvedParams.id,
    session.user.id
  )

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED': return 'bg-blue-100 text-blue-800'
      case 'SHORTLISTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'SELECTED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/industry/applications">
        <Button variant="secondary" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-manrope">
            Application Details
          </h1>
          <p className="text-gray-600">
            {application.opportunity.title}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {application.status.replace('_', ' ')}
        </span>
      </div>

      {/* Premium Upgrade Notice */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Upgrade to See Full Details</h3>
                <p className="text-purple-700 text-sm">
                  Get candidate contact info, resume, and portfolio with Premium
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {application.candidate.displayName}
                </h3>
                {application.candidate.isAnonymous && (
                  <p className="text-sm text-gray-600 mt-1">
                    Full details available with Premium membership
                  </p>
                )}
              </div>

              {/* Contact Info - Premium Only */}
              {isPremium && application.candidate.email && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4" />
                    <span>{application.candidate.email}</span>
                  </div>
                  {application.candidate.city && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {application.candidate.city}, {application.candidate.state}, {application.candidate.country}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {application.candidate.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{application.candidate.bio}</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.skillName}
                        className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                      >
                        {skill.skillName} - {skill.proficiency}
                        {skill.yearsOfExperience && ` (${skill.yearsOfExperience}y)`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links - Premium Only */}
              {isPremium && (
                <div className="flex gap-3 pt-4 border-t">
                  {application.candidate.resumeUrl && (
                    <Link href={application.candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    </Link>
                  )}
                  {application.candidate.portfolioUrl && (
                    <Link href={application.candidate.portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Portfolio
                      </Button>
                    </Link>
                  )}
                  {application.candidate.linkedinUrl && (
                    <Link href={application.candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="sm">
                        LinkedIn
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {application.candidate.college && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700"><strong>College:</strong> {application.candidate.college}</p>
                {application.candidate.degree && (
                  <p className="text-gray-700"><strong>Degree:</strong> {application.candidate.degree}</p>
                )}
                {application.candidate.fieldOfStudy && (
                  <p className="text-gray-700"><strong>Field:</strong> {application.candidate.fieldOfStudy}</p>
                )}
                {application.candidate.graduationYear && (
                  <p className="text-gray-700"><strong>Graduation:</strong> {application.candidate.graduationYear}</p>
                )}
                {isPremium && application.candidate.cgpa && (
                  <p className="text-gray-700"><strong>CGPA:</strong> {application.candidate.cgpa}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(application.appliedAt)}
                </p>
              </div>

              {application.expectedSalary && (
                <div>
                  <p className="text-sm text-gray-600">Expected Salary</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    ₹{application.expectedSalary.toLocaleString()}
                  </p>
                </div>
              )}

              {application.canJoinFrom && (
                <div>
                  <p className="text-sm text-gray-600">Can Join From</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDate(application.canJoinFrom)}
                  </p>
                </div>
              )}

              {application.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-600">Reviewed On</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(application.reviewedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.status === 'PENDING' && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Shortlist Candidate
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Mark as Reviewed
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {application.status === 'SHORTLISTED' && (
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              )}

              <Link href={`/industry/messages?candidate=${application.candidate.id}`}>
                <Button variant="secondary" className="w-full">
                  Send Message
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Add notes about this candidate..."
                defaultValue={application.companyNotes || ''}
              />
              <Button size="sm" className="mt-2 w-full">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}