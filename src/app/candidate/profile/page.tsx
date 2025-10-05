import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  FileText,
  Edit,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react'
import Link from 'next/link'

// Get candidate profile with completion status
async function getCandidateProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: {
        include: {
          skills: {
            orderBy: { proficiency: 'desc' }
          },
          user: {
            select: {
              email: true,
              isVerified: true,
              isPremium: true
            }
          }
        }
      }
    }
  })

  if (!user?.candidate) {
    throw new Error('Candidate profile not found')
  }

  // Calculate profile completion
  const candidate = user.candidate
  let completionScore = 0
  const totalFields = 20

  // Basic info (5 fields)
  if (candidate.firstName) completionScore++
  if (candidate.lastName) completionScore++
  if (candidate.phone) completionScore++
  if (candidate.dateOfBirth) completionScore++
  if (candidate.bio) completionScore++

  // Location (3 fields)
  if (candidate.city) completionScore++
  if (candidate.state) completionScore++
  if (candidate.country) completionScore++

  // Academic (5 fields)
  if (candidate.college) completionScore++
  if (candidate.degree) completionScore++
  if (candidate.fieldOfStudy) completionScore++
  if (candidate.graduationYear) completionScore++
  if (candidate.cgpa) completionScore++

  // Professional (4 fields)
  if (candidate.resumeUrl) completionScore++
  if (candidate.portfolioUrl) completionScore++
  if (candidate.linkedinUrl) completionScore++
  if (candidate.githubUrl) completionScore++

  // Skills (3+ skills = complete)
  if (candidate.skills.length >= 3) completionScore += 3

  const completionPercentage = Math.round((completionScore / totalFields) * 100)

  return {
    user,
    candidate,
    completionPercentage,
    isComplete: completionPercentage >= 80
  }
}

export default async function CandidateProfilePage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  const { user, candidate, completionPercentage, isComplete } = 
    await getCandidateProfile(session.user.id)

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not provided'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'EXPERT': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ADVANCED': return 'bg-green-100 text-green-700 border-green-200'
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'BEGINNER': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700'
    }
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
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your personal information and professional details
              </p>
            </div>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Completion */}
          <Card className={`border-2 ${
            isComplete 
              ? 'border-green-200 bg-green-50' 
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {isComplete ? (
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Profile Completion: {completionPercentage}%
                    </h3>
                    <p className="text-sm text-gray-700">
                      {isComplete 
                        ? 'Your profile is complete! You can now apply to all opportunities.'
                        : 'Complete your profile to unlock all features and increase your visibility.'
                      }
                    </p>
                    <div className="mt-3 w-full max-w-md">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">First Name</label>
                      <p className="text-gray-900 mt-1">{candidate.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Name</label>
                      <p className="text-gray-900 mt-1">{candidate.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-900">{candidate.user.email}</p>
                        {candidate.emailVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 mt-1">{candidate.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-900 mt-1">{formatDate(candidate.dateOfBirth)}</p>
                    </div>
                  </div>

                  {candidate.bio && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-gray-600">Bio</label>
                      <p className="text-gray-700 mt-1 whitespace-pre-line">{candidate.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidate.city || candidate.state || candidate.country ? (
                    <div className="space-y-2">
                      {candidate.city && <p className="text-gray-900">{candidate.city}</p>}
                      {candidate.state && <p className="text-gray-900">{candidate.state}</p>}
                      {candidate.country && <p className="text-gray-900">{candidate.country}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-500">Location not provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.college || candidate.degree || candidate.fieldOfStudy ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidate.college && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">College/University</label>
                          <p className="text-gray-900 mt-1">{candidate.college}</p>
                        </div>
                      )}
                      {candidate.degree && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Degree</label>
                          <p className="text-gray-900 mt-1">{candidate.degree}</p>
                        </div>
                      )}
                      {candidate.fieldOfStudy && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Field of Study</label>
                          <p className="text-gray-900 mt-1">{candidate.fieldOfStudy}</p>
                        </div>
                      )}
                      {candidate.graduationYear && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Graduation Year</label>
                          <p className="text-gray-900 mt-1">{candidate.graduationYear}</p>
                        </div>
                      )}
                      {candidate.cgpa && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">CGPA</label>
                          <p className="text-gray-900 mt-1">{candidate.cgpa}/10.0</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Academic information not provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidate.skills.length > 0 ? (
                    <div className="space-y-3">
                      {candidate.skills.map((skill) => (
                        <div 
                          key={skill.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{skill.skillName}</p>
                            {skill.yearsOfExperience && (
                              <p className="text-sm text-gray-600 mt-1">
                                {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} experience
                              </p>
                            )}
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                            getSkillLevelColor(skill.proficiency)
                          }`}>
                            {skill.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No skills added yet</p>
                      <Button variant="secondary" size="sm">
                        Add Skills
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Professional Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.resumeUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">Resume</label>
                        <a 
                          href={candidate.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 block"
                        >
                          View Resume
                        </a>
                      </div>
                    </div>
                  )}

                  {candidate.portfolioUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">Portfolio</label>
                        <a 
                          href={candidate.portfolioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 block"
                        >
                          {candidate.portfolioUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {candidate.linkedinUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Linkedin className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">LinkedIn</label>
                        <a 
                          href={candidate.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 block"
                        >
                          {candidate.linkedinUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {candidate.githubUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Github className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-900">GitHub</label>
                        <a 
                          href={candidate.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 block"
                        >
                          {candidate.githubUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {!candidate.resumeUrl && !candidate.portfolioUrl && 
                   !candidate.linkedinUrl && !candidate.githubUrl && (
                    <div className="text-center py-8">
                      <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No professional links added yet</p>
                      <Button variant="secondary" size="sm">
                        Add Links
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900">
                      {user.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email Verified</span>
                    {candidate.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">
                      {new Date(candidate.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/candidate/certificates">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <Award className="h-4 w-4 mr-2" />
                      Manage Certificates
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                  <Link href="/candidate/settings">
                    <Button variant="secondary" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Upgrade CTA */}
              {!user.isPremium && (
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-purple-900 mb-2">Upgrade to Premium</h3>
                    <p className="text-sm text-purple-700 mb-4">
                      Get access to exclusive freelancing opportunities and see full company details
                    </p>
                    <Link href="/candidate/premium">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Upgrade Now
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