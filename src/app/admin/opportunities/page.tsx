'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Opportunity {
  id: string
  title: string
  type: string
  workType: string
  description: string
  requirements: string
  stipend: number | null
  duration: number | null
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  industry: {
    companyName: string
  }
  category: {
    name: string
  }
  location: {
    city: string
    state: string
  }
  _count?: {
    applications: number
  }
}

export default function AdminOpportunities() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pendingOpportunities, setPendingOpportunities] = useState<Opportunity[]>([])
  const [activeOpportunities, setActiveOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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
      fetchOpportunities()
    }
  }, [status])

  const fetchOpportunities = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const response = await fetch('/api/admin/opportunities')
      if (response.ok) {
        const data = await response.json()
        setPendingOpportunities(data.pending || [])
        setActiveOpportunities(data.active || [])
        if (showRefreshToast) {
          toast.success('Refreshed successfully!')
        }
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
      toast.error('Failed to load opportunities')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleAction = async (opportunityId: string, action: 'approve' | 'reject' | 'deactivate') => {
    setProcessingId(opportunityId)
    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, action })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        // Refresh the list
        await fetchOpportunities()
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
      {/* Page Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">Opportunity Moderation</h1>
          <p className="text-gray-600 mt-2">Review and moderate opportunity postings</p>
        </div>
        <Button 
          variant="secondary"
          onClick={() => fetchOpportunities(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pending Review Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Pending Review ({pendingOpportunities.length})
          </h2>
        </div>

        {pendingOpportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No opportunities pending moderation</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-6 border-orange-200 bg-orange-50">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Opportunity Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {opportunity.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                          {opportunity.type}
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                          {opportunity.category.name}
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                          {opportunity.workType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{opportunity.industry.companyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{opportunity.location.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>₹{opportunity.stipend?.toLocaleString('en-IN') || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{opportunity.duration} months</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-1">Description:</p>
                        <p className="text-sm text-gray-900 line-clamp-3">{opportunity.description}</p>
                      </div>

                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 font-medium mb-1">Requirements:</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{opportunity.requirements}</p>
                      </div>

                      <p className="text-xs text-gray-500 mt-3">
                        Posted {new Date(opportunity.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[140px]">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(opportunity.id, 'approve')}
                      disabled={processingId === opportunity.id}
                    >
                      {processingId === opportunity.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleAction(opportunity.id, 'reject')}
                      disabled={processingId === opportunity.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Opportunities Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">
            Active Opportunities ({activeOpportunities.length})
          </h2>
        </div>

        {activeOpportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Opportunities</h3>
            <p className="text-gray-600">No approved opportunities at the moment</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {opportunity.title}
                      </h3>
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{opportunity.industry.companyName}</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opportunity.location.city}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span>{opportunity.type}</span>
                        <span>{opportunity._count?.applications || 0} applications</span>
                      </div>
                      <p className="text-xs text-green-600">
                        Approved {new Date(opportunity.updatedAt).toLocaleDateString('en-IN')}
                      </p>
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
                    onClick={() => handleAction(opportunity.id, 'deactivate')}
                    disabled={processingId === opportunity.id}
                  >
                    {processingId === opportunity.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Deactivate'
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