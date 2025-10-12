/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/ui/header'
import EditOpportunityForm from '@/components/industry/EditOpportunityForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Get opportunity data for editing
async function getOpportunityData(opportunityId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true }
  })

  if (!user?.industry?.id) {
    throw new Error('Industry not found')
  }

  const opportunity = await db.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      category: true,
      location: true
    }
  })

  if (!opportunity) {
    notFound()
  }

  // Check if this opportunity belongs to this industry
  if (opportunity.industryId !== user.industry.id) {
    redirect('/industry/opportunities')
  }

  return opportunity
}

// Get categories and locations for form dropdowns
async function getFormData() {
  const [categories, locations] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { sortOrder: 'asc' }
    }),
    db.location.findMany({
      where: { isActive: true },
      select: {
        id: true,
        city: true,
        state: true,
        country: true
      },
      orderBy: [
        { country: 'asc' },
        { state: 'asc' },
        { city: 'asc' }
      ]
    })
  ])

  return { categories, locations }
}

export default async function EditOpportunityPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const resolvedParams = await params
  const [opportunity, { categories, locations }] = await Promise.all([
    getOpportunityData(resolvedParams.id, session.user.id),
    getFormData()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session.user as any} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link 
                href="/industry/opportunities"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Opportunities
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                Edit Opportunity
              </h1>
              <p className="text-gray-600">
                Update the details of your opportunity
              </p>
            </div>
          </div>

          {/* Form Component */}
          <EditOpportunityForm
            opportunity={opportunity}
            categories={categories}
            locations={locations}
          />
        </div>
      </div>
    </div>
  )
}