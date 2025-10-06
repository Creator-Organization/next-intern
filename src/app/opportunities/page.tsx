// src/app/opportunities/page.tsx
// Public Browse Opportunities Page - NextIntern 2.0

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Wallet,
  Building,
  Eye,
  Crown,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Opportunity {
  id: string
  title: string
  description: string
  type: string
  workType: string
  stipend?: number
  currency: string
  duration?: number
  applicationCount: number
  location: {
    city: string
    state: string
  }
  industry: {
    companyName: string
    industry: string
    isVerified: boolean
  }
  category: {
    name: string
    color?: string
  }
  skills: Array<{
    skillName: string
    isRequired: boolean
  }>
}

function OpportunitiesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const params = new URLSearchParams({
          userType: 'PUBLIC',
          isPremium: session?.user?.isPremium ? 'true' : 'false'
        })

        if (searchQuery) params.append('search', searchQuery)

        const response = await fetch(`/api/opportunities?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setOpportunities(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch opportunities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, [session, searchQuery])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600 font-manrope">
              NextIntern
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/candidate">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="secondary">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-manrope mb-4 text-3xl font-bold text-gray-900">
            Browse Opportunities
          </h1>
          <p className="text-gray-600">
            Discover internships and projects from top companies
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {opportunities.length > 0 ? (
          <div className="grid gap-6">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-manrope text-xl font-bold text-gray-900 mb-2">
                        {opp.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <Building className="mr-2 h-4 w-4" />
                        <span>{opp.industry.companyName}</span>
                        <span className="mx-2">•</span>
                        <span>{opp.industry.industry}</span>
                      </div>
                    </div>
                    <Link href={`/auth/signin`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">{opp.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {opp.location.city}
                    </div>
                    {opp.duration && (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {opp.duration} weeks
                      </div>
                    )}
                    {opp.stipend && (
                      <div className="flex items-center text-green-600 font-medium">
                        <Wallet className="mr-2 h-4 w-4" />
                        {opp.currency}{opp.stipend.toLocaleString()}/mo
                      </div>
                    )}
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      {opp.applicationCount} applications
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No opportunities found
              </h3>
              <p className="text-gray-600">Try adjusting your search</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OpportunitiesContent />
    </Suspense>
  )
}