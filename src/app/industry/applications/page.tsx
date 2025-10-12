/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/header'
import { Users, Filter, Search, Eye, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProcessedCandidate {
  id: string
  displayName: string
  location: string
  bio: string | null
  skills: string[]
  isAnonymous: boolean
}

interface ProcessedApplication {
  id: string
  status: string
  createdAt: string
  candidate: ProcessedCandidate
  opportunityTitle: string
}

interface ApplicationsData {
  applications: ProcessedApplication[]
  isPremium: boolean
  stats: {
    total: number
    pending: number
    reviewed: number
    shortlisted: number
  }
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const hasFetchedData = useRef(false)

  const [data, setData] = useState<ApplicationsData | null>(null)
  const [filteredApplications, setFilteredApplications] = useState<ProcessedApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== 'authenticated' || !session?.user?.industry?.id || hasFetchedData.current) return
      hasFetchedData.current = true
      setIsLoading(true)

      try {
        const response = await fetch(`/api/industries/${session.user.industry.id}/applications`)
        
        if (response.ok) {
          const result = await response.json()
          setData(result)
          setFilteredApplications(result.applications)
        } else {
          toast.error('Failed to load applications')
          hasFetchedData.current = false
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error loading applications')
        hasFetchedData.current = false
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [status, session])

  useEffect(() => {
    if (!data) return

    let filtered = data.applications

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app => 
        app.candidate.displayName.toLowerCase().includes(query) ||
        app.opportunityTitle.toLowerCase().includes(query) ||
        app.candidate.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    setFilteredApplications(filtered)
  }, [statusFilter, searchQuery, data])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-manrope">Applications Received</h2>
              <p className="text-gray-600">Review and manage applications for your opportunities</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setShowSearchBar(!showSearchBar)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearchBar && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by candidate name, opportunity, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Menu */}
          {showFilterMenu && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Filter by Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'SELECTED'].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          statusFilter === status
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.pending}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reviewed</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.reviewed}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-gray-900">{data.stats.shortlisted}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Upgrade Notice */}
          {!data.isPremium && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">🔒 Upgrade to See Full Candidate Details</h3>
                    <p className="text-purple-700 text-sm">
                      Premium members can see candidate names, contact information, and detailed profiles
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

          {/* Results Count */}
          {(searchQuery || statusFilter !== 'ALL') && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredApplications.length} of {data.applications.length} applications
              </p>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-teal-700">
                          {application.candidate.displayName.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {application.candidate.displayName}
                          </h3>
                          {application.candidate.isAnonymous && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              🔒 Anonymous
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Applied for: <span className="font-medium">{application.opportunityTitle}</span>
                        </p>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {application.candidate.location}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {application.candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {application.candidate.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {application.candidate.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{application.candidate.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {application.candidate.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.candidate.bio}
                          </p>
                        )}

                        {application.candidate.isAnonymous && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700">
                              🔒 Full profile details available with Premium membership
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          application.status === 'SHORTLISTED' 
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'REVIEWED'
                            ? 'bg-blue-100 text-blue-800'
                            : application.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {application.status.replace('_', ' ')}
                      </span>
                      
                      <div className="flex gap-2">
                        <Link href={`/industry/applications/${application.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && data.applications.length === 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                <p className="text-gray-600 mb-6">
                  Applications will appear here once candidates start applying to your opportunities.
                </p>
                <Link href="/industry/post">
                  <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                    Post Your First Opportunity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {filteredApplications.length === 0 && data.applications.length > 0 && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('ALL')
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}