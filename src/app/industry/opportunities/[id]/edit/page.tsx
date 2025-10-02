import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import EditOpportunityForm from '@/components/industry/EditOpportunityForm'

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">
          Edit Opportunity
        </h1>
        <p className="text-gray-600">
          Update the details of your opportunity
        </p>
      </div>

      {/* Form Component */}
      <EditOpportunityForm
        opportunity={opportunity}
        categories={categories}
        locations={locations}
      />
    </div>
  )
}