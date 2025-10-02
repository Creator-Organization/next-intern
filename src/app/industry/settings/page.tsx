import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Trash2,
  LogOut
} from 'lucide-react'

// Get user settings
async function getUserSettings(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      industry: true,
      preferences: true
    }
  })

  if (!user?.industry) {
    throw new Error('Industry not found')
  }

  return {
    user,
    industry: user.industry,
    preferences: user.preferences
  }
}

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { user, industry, preferences } = await getUserSettings(session.user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account preferences and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardContent className="p-4">
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-700 font-medium">
                  <User className="h-5 w-5" />
                  Account
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Lock className="h-5 w-5" />
                  Security
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Palette className="h-5 w-5" />
                  Appearance
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700">
                  <Shield className="h-5 w-5" />
                  Privacy
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={industry.companyName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry.industry}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Change Password
                </label>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Button variant="secondary">Enable</Button>
              </div>

              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={preferences?.emailNotifications ?? true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">New Applications</p>
                  <p className="text-sm text-gray-600">Get notified of new applications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Interview Reminders</p>
                  <p className="text-sm text-gray-600">Reminders for scheduled interviews</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Marketing Emails</p>
                  <p className="text-sm text-gray-600">Tips and product updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={preferences?.marketingEmails ?? false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 border-2 border-teal-500 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50">
                    <div className="h-8 w-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded mb-2"></div>
                    <p className="text-sm font-medium">Teal-Cyan</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="h-8 w-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded mb-2"></div>
                    <p className="text-sm font-medium">Blue</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="h-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded mb-2"></div>
                    <p className="text-sm font-medium">Purple</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Show Company Name</p>
                  <p className="text-sm text-gray-600">Display your company name publicly</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={industry.showCompanyName}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Privacy ID:</strong> Company {industry.anonymousId.slice(-8)}
                </p>
                <p className="text-xs text-gray-500">
                  This ID is used when your company name is hidden from free users
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white/70 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Sign Out</p>
                  <p className="text-sm text-gray-600">Sign out from this device</p>
                </div>
                <Button variant="secondary">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="secondary" className="text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}