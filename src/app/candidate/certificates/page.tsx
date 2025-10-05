import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  Award,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Trash2,
  Edit,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'


// Get candidate certificates
async function getCandidateCertificates(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: {
        include: {
          certificates: {
            orderBy: { issueDate: 'desc' }
          }
        }
      }
    }
  })


  if (!user?.candidate) {
    throw new Error('Candidate profile not found')
  }


  return {
    candidate: user.candidate,
    certificates: user.candidate.certificates
  }
}


export default async function CertificatesPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }


  const { candidate, certificates } = await getCandidateCertificates(session.user.id)


  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }


  const isExpired = (expiryDate: Date | null) => {
    if (!expiryDate) return false
    return new Date() > new Date(expiryDate)
  }


  const getStatusBadge = (cert: typeof certificates[0]) => {
    if (cert.isVerified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </span>
      )
    }
    if (cert.expiryDate && isExpired(cert.expiryDate)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pending
      </span>
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
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                Certificates & Certifications
              </h1>
              <p className="text-gray-600">
                Manage your professional certificates and showcase your achievements
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>


          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Certificates</p>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                      {certificates.filter(c => c.isVerified).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {certificates.filter(c => !c.isVerified && (!c.expiryDate || !isExpired(c.expiryDate))).length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-red-600">
                      {certificates.filter(c => c.expiryDate && isExpired(c.expiryDate)).length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Certificates List */}
          {certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-primary-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 font-manrope">
                              {certificate.name}
                            </h3>
                            {getStatusBadge(certificate)}
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            Issued by <span className="font-medium text-gray-900">{certificate.issuer}</span>
                          </p>


                          {certificate.description && (
                            <p className="text-sm text-gray-700 mb-3">
                              {certificate.description}
                            </p>
                          )}


                          {/* Skills */}
                          {certificate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {certificate.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}


                          {/* Dates */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Issued: {formatDate(certificate.issueDate)}</span>
                            </div>
                            {certificate.expiryDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span className={isExpired(certificate.expiryDate) ? 'text-red-600 font-medium' : ''}>
                                  Expires: {formatDate(certificate.expiryDate)}
                                </span>
                              </div>
                            )}
                          </div>


                          {/* Credential Info */}
                          {(certificate.credentialId || certificate.credentialUrl) && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex flex-wrap items-center gap-4">
                                {certificate.credentialId && (
                                  <div>
                                    <span className="text-xs text-gray-500">Credential ID: </span>
                                    <span className="text-xs font-mono text-gray-900">{certificate.credentialId}</span>
                                  </div>
                                )}
                                {certificate.credentialUrl && (
                                  <a
                                    href={certificate.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                  >
                                    Verify Certificate
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Certificates Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your professional certificates and certifications to showcase your skills and expertise to potential employers.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certificate
                </Button>
              </CardContent>
            </Card>
          )}


          {/* Help Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Tips for Adding Certificates</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include the credential ID for verification purposes</li>
                    <li>• Add relevant skills gained from the certification</li>
                    <li>• Keep expiry dates updated to maintain profile accuracy</li>
                    <li>• Link to official verification URLs when available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
