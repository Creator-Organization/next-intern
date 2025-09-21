import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Building2 } from 'lucide-react'

async function getIndustryData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      industry: true
    }
  })
  return user?.industry
}

export default async function IndustryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Check if user is authenticated and is an industry user
  if (!session) {
    redirect('/auth/signin?callbackUrl=/industry')
  }
  
  if (session.user.userType !== 'INDUSTRY') {
    redirect('/')
  }

  // Fetch industry data
  const industryData = await getIndustryData(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      {/* Header - Following your existing header pattern */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 font-manrope">
                  {industryData?.companyName || 'Company Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Industry Portal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}