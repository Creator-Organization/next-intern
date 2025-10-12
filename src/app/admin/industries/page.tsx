'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  MapPin,
  Users as UsersIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Industry {
  id: string
  companyName: string
  industry: string
  city: string
  state: string
  websiteUrl: string | null
  description: string | null
  createdAt: Date
  verifiedAt: Date | null
  isVerified: boolean
  user: {
    email: string
  }
  _count?: {
    opportunities: number
  }
}

export default function AdminIndustries() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingIndustries, setPendingIndustries] = useState<Industry[]>([])
  const [verifiedIndustries, setVerifiedIndustries] = useState<Industry[]>([])
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
      fetchIndustries()
    }
  }, [status])

  const fetchIndustries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/industries')
      if (response.ok) {
        const data = await response.json()
        setPendingIndustries(data.pending || [])
        setVerifiedIndustries(data.verified || [])
      }
    } catch (error) {
      console.error('Failed to fetch industries:', error)
      toast.error('Failed to load industries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (industryId: string, action: 'approve' | 'reject' | 'revoke') => {
    setProcessingId(industryId)
    try {
      const response = await fetch('/api/admin/verify/industry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industryId, action })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        // Refresh the list
        await fetchIndustries()
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
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Industry Verification</h1>
        <p className="text-gray-600 mt-2">Review and verify industry accounts</p>
      </div>

      {/* Pending Verification Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Pending Verification ({pendingIndustries.length})
          </h2>
        </div>

        {pendingIndustries.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No industries pending verification</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingIndustries.map((industry) => (
              <Card key={industry.id} className="p-6 border-orange-200 bg-orange-50">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Industry Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {industry.companyName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <span>{industry.industry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{industry.city}, {industry.state}</span>
                        </div>
                        {industry.websiteUrl && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <a 
                              href={industry.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {industry.websiteUrl}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>Registered {new Date(industry.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-1">Contact Email:</p>
                        <p className="text-sm text-gray-900">{industry.user.email}</p>
                      </div>
                      {industry.description && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 font-medium mb-1">Description:</p>
                          <p className="text-sm text-gray-900">{industry.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[140px]">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(industry.id, 'approve')}
                      disabled={processingId === industry.id}
                    >
                      {processingId === industry.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleAction(industry.id, 'reject')}
                      disabled={processingId === industry.id}
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

      {/* Verified Industries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Verified Industries
          </h2>
        </div>

        {verifiedIndustries.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Industries</h3>
            <p className="text-gray-600">No industries have been verified yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedIndustries.map((industry) => (
              <Card key={industry.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {industry.companyName}
                      </h3>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{industry.industry}</p>
                      <p>{industry.city}, {industry.state}</p>
                      <p className="text-xs text-gray-500">
                        {industry._count?.opportunities || 0} opportunities posted
                      </p>
                      {industry.verifiedAt && (
                        <p className="text-xs text-green-600">
                          Verified {new Date(industry.verifiedAt).toLocaleDateString('en-IN')}
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
                    onClick={() => handleAction(industry.id, 'revoke')}
                    disabled={processingId === industry.id}
                  >
                    {processingId === industry.id ? (
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