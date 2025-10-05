import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  User,
  Lock,
  Bell,
  Eye,
  CreditCard,
  Trash2,
  Shield,
  Mail,
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

async function getUserSettings(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: true,
      preferences: true
    }
  })

  if (!user?.candidate) {
    throw new Error('Candidate profile not found')
  }

  return {
    user,
    candidate: user.candidate,
    preferences: user.preferences
  }
}

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  const { user, candidate, preferences } = await getUserSettings(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={{
        id: session.user.id,
        email: session.user.email,
        userType: session.user.userType,
        candidate: session.user.candidate ? {
          firstName: session.user.candidate.firstName,
          lastName: session.user.candidate.lastName
        } : undefined
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-manrope">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-900">{user.email}</p>
                      {user.isVerified ? (
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          Not verified
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">Change</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-900">{candidate.phone || 'Not added'}</p>
                      {candidate.phoneVerified ? (
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </div>
                      ) : candidate.phone ? (
                        <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          Not verified
                        </div>
                      ) : null}
                    </div>
                    <Button variant="ghost" size="sm">
                      {candidate.phone ? 'Change' : 'Add'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-900">••••••••••••</p>
                      <p className="text-sm text-gray-600 mt-1">Last changed: Never</p>
                    </div>
                    <Button variant="ghost" size="sm">Change</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Show Full Name</h4>
                    <p className="text-sm text-gray-600">
                      Display your full name to companies viewing your profile
                    </p>
                  </div>
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    candidate.showFullName ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      candidate.showFullName ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Show Contact Information</h4>
                    <p className="text-sm text-gray-600">
                      Allow companies to see your email and phone number
                    </p>
                  </div>
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    candidate.showContact ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      candidate.showContact ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Anonymous ID</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        When privacy is enabled, you appear as: <span className="font-mono">Candidate #{candidate.anonymousId.slice(-8)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive updates about applications and messages
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">New Opportunity Alerts</h4>
                    <p className="text-sm text-gray-600">
                      Get notified when new matching opportunities are posted
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">
                      Receive tips, news, and promotional content
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className={`p-4 border-2 rounded-lg text-center ${
                      preferences?.theme === 'TEAL' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Teal</p>
                    </button>
                    <button className={`p-4 border-2 rounded-lg text-center ${
                      preferences?.theme === 'BLUE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Blue</p>
                    </button>
                    <button className={`p-4 border-2 rounded-lg text-center ${
                      preferences?.theme === 'PURPLE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Purple</p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Delete Account</h4>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-4">
                  {user.isPremium ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Premium Member</p>
                      <p className="text-sm text-gray-600">
                        {user.premiumExpiresAt 
                          ? `Renews ${new Date(user.premiumExpiresAt).toLocaleDateString()}`
                          : 'Active subscription'
                        }
                      </p>
                      <Button variant="secondary" size="sm" className="mt-4 w-full">
                        Manage Plan
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Free Plan</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Upgrade to access premium features
                      </p>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        Upgrade Now
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Two-Factor Auth</span>
                  <span className="text-gray-500">Not enabled</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Sessions</span>
                  <span className="text-gray-900 font-medium">1 device</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Login</span>
                  <span className="text-gray-900 font-medium">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
                <Button variant="secondary" size="sm" className="w-full mt-3">
                  View Activity
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Our support team is here to assist you with any questions or issues.
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}