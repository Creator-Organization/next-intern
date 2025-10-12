/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { 
  Users, 
  Search,
  Crown,
  Shield,
  UserCheck,
  UserX,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { type?: string; search?: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.userType !== 'ADMIN') {
    redirect('/')
  }

  const userType = searchParams.type?.toUpperCase() as 'CANDIDATE' | 'INDUSTRY' | 'INSTITUTE' | 'ADMIN' | undefined
  const searchQuery = searchParams.search || ''

  // ✅ Build where clause with search
  const whereClause: any = {}
  
  if (userType) {
    whereClause.userType = userType
  }

  if (searchQuery) {
    whereClause.email = {
      contains: searchQuery,
      mode: 'insensitive'
    }
  }

  // ✅ Fetch users with filters
  const users = await db.user.findMany({
    where: whereClause,
    include: {
      candidate: true,
      industry: true,
      institute: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  const userCounts = {
    all: await db.user.count(),
    candidate: await db.user.count({ where: { userType: 'CANDIDATE' } }),
    industry: await db.user.count({ where: { userType: 'INDUSTRY' } }),
    institute: await db.user.count({ where: { userType: 'INSTITUTE' } }),
    admin: await db.user.count({ where: { userType: 'ADMIN' } })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all platform users</p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <a href="/admin/users">
            <Button 
              variant={!userType ? 'primary' : 'secondary'}
              size="sm"
            >
              All Users ({userCounts.all})
            </Button>
          </a>
          <a href="/admin/users?type=candidate">
            <Button 
              variant={userType === 'CANDIDATE' ? 'primary' : 'secondary'}
              size="sm"
            >
              Candidates ({userCounts.candidate})
            </Button>
          </a>
          <a href="/admin/users?type=industry">
            <Button 
              variant={userType === 'INDUSTRY' ? 'primary' : 'secondary'}
              size="sm"
            >
              Industries ({userCounts.industry})
            </Button>
          </a>
          <a href="/admin/users?type=institute">
            <Button 
              variant={userType === 'INSTITUTE' ? 'primary' : 'secondary'}
              size="sm"
            >
              Institutes ({userCounts.institute})
            </Button>
          </a>
          <a href="/admin/users?type=admin">
            <Button 
              variant={userType === 'ADMIN' ? 'primary' : 'secondary'}
              size="sm"
            >
              Admins ({userCounts.admin})
            </Button>
          </a>
        </div>
      </Card>

      {/* ✅ Search Form with Button */}
      <Card className="p-4">
        <form method="GET" action="/admin/users" className="flex flex-col sm:flex-row gap-4">
          {/* Hidden input to preserve type filter */}
          {userType && (
            <input type="hidden" name="type" value={userType.toLowerCase()} />
          )}
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search by email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <Button type="submit" variant="primary">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          
          {searchQuery && (
            <a href={userType ? `/admin/users?type=${userType.toLowerCase()}` : '/admin/users'}>
              <Button type="button" variant="secondary">
                Clear
              </Button>
            </a>
          )}
        </form>
      </Card>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Search results for: <strong>&#34;{searchQuery}&#34;</strong></span>
          <span>•</span>
          <span>{users.length} user(s) found</span>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No Users Found' : 'No Users Yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No users found matching "${searchQuery}"`
                : 'No users match the current filters'
              }
            </p>
            {searchQuery && (
              <a href={userType ? `/admin/users?type=${userType.toLowerCase()}` : '/admin/users'} className="mt-4 inline-block">
                <Button variant="secondary" size="sm">
                  Clear Search
                </Button>
              </a>
            )}
          </Card>
        ) : (
          users.map((user) => {
            const displayName = user.candidate 
              ? `${user.candidate.firstName} ${user.candidate.lastName}`
              : user.industry
              ? user.industry.companyName
              : user.institute
              ? user.institute.instituteName
              : user.email

            const isVerified = user.candidate 
              ? user.candidate.emailVerified
              : user.industry
              ? user.industry.isVerified
              : user.institute
              ? user.institute.isVerified
              : false

            return (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {displayName[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {displayName}
                        </h3>
                        {user.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-500">
                            <title>Premium User</title>
                          </Crown>
                        )}
                        {isVerified && (
                          <Shield className="w-4 h-4 text-green-500">
                            <title>Verified</title>
                          </Shield>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>{user.email}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {user.userType}
                        </span>
                        {user.isActive ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <UserX className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                    {user.isActive ? (
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Activate User"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}