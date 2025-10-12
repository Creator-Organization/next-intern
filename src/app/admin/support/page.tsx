'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface SupportTicket {
  id: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
  user: {
    email: string
  }
}

export default function AdminSupport() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [openTickets, setOpenTickets] = useState<SupportTicket[]>([])
  const [inProgressTickets, setInProgressTickets] = useState<SupportTicket[]>([])
  const [resolvedTickets, setResolvedTickets] = useState<SupportTicket[]>([])
  const [closedTickets, setClosedTickets] = useState<SupportTicket[]>([])
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
      fetchTickets()
    }
  }, [status])

  const fetchTickets = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const response = await fetch('/api/admin/support')
      if (response.ok) {
        const data = await response.json()
        setOpenTickets(data.open || [])
        setInProgressTickets(data.inProgress || [])
        setResolvedTickets(data.resolved || [])
        setClosedTickets(data.closed || [])
        if (showRefreshToast) {
          toast.success('Refreshed successfully!')
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleAction = async (ticketId: string, action: 'take_action' | 'resolve' | 'close', response?: string) => {
    setProcessingId(ticketId)
    try {
      const apiResponse = await fetch('/api/admin/support', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, action, response })
      })

      if (apiResponse.ok) {
        const data = await apiResponse.json()
        toast.success(data.message)
        await fetchTickets()
      } else {
        const error = await apiResponse.json()
        toast.error(error.error || 'Action failed')
      }
    } catch (error) {
      console.error('Action failed:', error)
      toast.error('Failed to process action')
    } finally {
      setProcessingId(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
      {/* Page Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">Support Tickets</h1>
          <p className="text-gray-600 mt-2">Manage and respond to user support requests</p>
        </div>
        <Button 
          variant="secondary"
          onClick={() => fetchTickets(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-orange-600">{openTickets.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressTickets.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolvedTickets.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{closedTickets.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Open Tickets */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
          Open Tickets ({openTickets.length})
        </h2>
        {openTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">No open support tickets</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {openTickets.map((ticket) => (
              <Card key={ticket.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {ticket.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:min-w-[140px]">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleAction(ticket.id, 'take_action')}
                      disabled={processingId === ticket.id}
                    >
                      {processingId === ticket.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Take Action
                    </Button>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* In Progress Tickets */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
          In Progress ({inProgressTickets.length})
        </h2>
        {inProgressTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No tickets in progress</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressTickets.map((ticket) => (
              <Card key={ticket.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mb-2">{ticket.user.email}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.updatedAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Respond
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => handleAction(ticket.id, 'resolve')}
                    disabled={processingId === ticket.id}
                  >
                    {processingId === ticket.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Resolve'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Tickets */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
          Recently Resolved
        </h2>
        {resolvedTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No resolved tickets</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolvedTickets.map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mb-2">{ticket.category}</p>
                    <p className="text-xs text-green-600">
                      Resolved {ticket.resolvedAt && new Date(ticket.resolvedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}