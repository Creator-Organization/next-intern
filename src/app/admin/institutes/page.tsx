/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  MapPin,
  AlertTriangle,
  Shield,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Institute {
  id: string
  instituteName: string
  instituteType: string
  city: string
  state: string
  websiteUrl: string | null
  description: string | null
  ugcApproved: boolean
  aicteApproved: boolean
  accreditationNumber: string | null
  createdAt: Date
  verifiedAt: Date | null
  isVerified: boolean
  user: {
    email: string
  }
  programs: any[]
  instituteStudents: any[]
}

export default function AdminInstitutes() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingInstitutes, setPendingInstitutes] = useState<Institute[]>([])
  const [verifiedInstitutes, setVerifiedInstitutes] = useState<Institute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.userType !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInstitutes()
    }
  }, [status])

  const fetchInstitutes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/institutes')
      if (response.ok) {
        const data = await response.json()
        setPendingInstitutes(data.pending || [])
        setVerifiedInstitutes(data.verified || [])
      }
    } catch (error) {
      console.error('Failed to fetch institutes:', error)
      toast.error('Failed to load institutes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (instituteId: string, action: 'approve' | 'reject' | 'revoke') => {
    setProcessingId(instituteId)
    try {
      const response = await fetch('/api/admin/verify/institute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instituteId, action })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        // Refresh the list
        await fetchInstitutes()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Action failed')
      }
    } catch (error) {
      console.error('Action failed:', error)
      toast.error('Failed to process action')
    } finally {
      setProcessingId(null)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Institute Verification</h1>
        <p className="text-gray-600 mt-2">Review and verify institute accounts</p>
      </div>

      {/* Pending Verification Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Pending Verification ({pendingInstitutes.length})
          </h2>
        </div>

        {pendingInstitutes.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No institutes pending verification</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingInstitutes.map((institute) => (
              <Card key={institute.id} className="p-6 border-orange-200 bg-orange-50">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Institute Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {institute.instituteName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>{institute.instituteType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{institute.city}, {institute.state}</span>
                        </div>
                        {institute.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a 
                              href={institute.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {institute.websiteUrl}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Registered {new Date(institute.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Accreditation Info */}
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-2">Accreditation:</p>
                        <div className="flex flex-wrap gap-2">
                          {institute.ugcApproved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              UGC Approved
                            </span>
                          )}
                          {institute.aicteApproved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              AICTE Approved
                            </span>
                          )}
                          {institute.accreditationNumber && (
                            <span className="text-xs text-gray-600">
                              Accreditation #: {institute.accreditationNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-1">Contact Email:</p>
                        <p className="text-sm text-gray-900">{institute.user.email}</p>
                      </div>

                      {institute.description && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 font-medium mb-1">Description:</p>
                          <p className="text-sm text-gray-900">{institute.description}</p>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-1">Programs:</p>
                        <p className="text-sm text-gray-900">
                          {institute.programs.length} programs registered
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[140px]">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(institute.id, 'approve')}
                      disabled={processingId === institute.id}
                    >
                      {processingId === institute.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleAction(institute.id, 'reject')}
                      disabled={processingId === institute.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button variant="secondary" size="sm">
                      Request Info
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Verified Institutes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Verified Institutes
          </h2>
        </div>

        {verifiedInstitutes.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Institutes</h3>
            <p className="text-gray-600">No institutes have been verified yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedInstitutes.map((institute) => (
              <Card key={institute.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {institute.instituteName}
                      </h3>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{institute.instituteType.replace(/_/g, ' ')}</p>
                      <p>{institute.city}, {institute.state}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span>{institute.programs.length} programs</span>
                        <span>{institute.instituteStudents.length} students</span>
                      </div>
                      {institute.verifiedAt && (
                        <p className="text-xs text-green-600">
                          Verified {new Date(institute.verifiedAt).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleAction(institute.id, 'revoke')}
                    disabled={processingId === institute.id}
                  >
                    {processingId === institute.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Revoke'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}