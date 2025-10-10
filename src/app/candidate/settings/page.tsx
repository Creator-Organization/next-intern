// src/app/candidate/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Eye, CreditCard, Trash2, Shield, Mail, Smartphone, Globe, AlertCircle, CheckCircle, Loader2, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface Settings {
  email: string;
  isVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  lastLoginAt: Date | null;
  showFullName: boolean;
  showContactInfo: boolean;
  anonymousId: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (session?.user?.userType !== 'CANDIDATE') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (status !== 'authenticated' || !session?.user?.id || hasFetchedData.current) return;
      hasFetchedData.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Error:', error);
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [status, session?.user?.id]);

  const handleToggle = async (field: string, currentValue: boolean) => {
    if (!settings) return;
    
    const newValue = !currentValue;
    setSettings(prev => prev ? { ...prev, [field]: newValue } : null);

    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      });

      if (response.ok) {
        toast.success('Settings updated!', { duration: 3000 });
      } else {
        setSettings(prev => prev ? { ...prev, [field]: currentValue } : null);
        toast.error('Failed to update');
      }
    } catch (error) {
      setSettings(prev => prev ? { ...prev, [field]: currentValue } : null);
      toast.error('Error occurred');
    }
  };

  const handleThemeChange = async (theme: string) => {
    if (!settings) return;
    
    const oldTheme = settings.theme;
    setSettings(prev => prev ? { ...prev, theme } : null);

    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      });

      if (response.ok) {
        toast.success('🎨 Theme updated!', { duration: 3000 });
      } else {
        setSettings(prev => prev ? { ...prev, theme: oldTheme } : null);
        toast.error('Failed to update theme');
      }
    } catch (error) {
      setSettings(prev => prev ? { ...prev, theme: oldTheme } : null);
      toast.error('Error occurred');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm('⚠️ Are you absolutely sure? This will permanently delete your account and all data. This action CANNOT be undone.');
    if (confirmed) {
      toast.error('Account deletion will be implemented soon', { duration: 5000 });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !settings) return null;

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user ? { id: user.id, email: user.email || '', userType: user.userType, candidate: user.name ? { firstName: user.name.split(' ')[0] || '', lastName: user.name.split(' ')[1] || '' } : undefined } : undefined} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Account Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-900">{settings.email}</p>
                      {settings.isVerified ? (
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1"><CheckCircle className="h-4 w-4" />Verified</div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1"><AlertCircle className="h-4 w-4" />Not verified</div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast('Change email coming soon')}>Change</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-900">{settings.phone || 'Not added'}</p>
                      {settings.phoneVerified && settings.phone && (
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1"><CheckCircle className="h-4 w-4" />Verified</div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast('Edit phone in profile page')}>
                      {settings.phone ? 'Change' : 'Add'}
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
                    <Button variant="ghost" size="sm" onClick={() => toast('Password change coming soon')}>Change</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Privacy Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Show Full Name</h4>
                    <p className="text-sm text-gray-600">Display your full name to companies</p>
                  </div>
                  <button onClick={() => handleToggle('showFullName', settings.showFullName)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showFullName ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showFullName ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Show Contact Information</h4>
                    <p className="text-sm text-gray-600">Allow companies to see your contact info</p>
                  </div>
                  <button onClick={() => handleToggle('showContactInfo', settings.showContactInfo)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showContactInfo ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showContactInfo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Anonymous ID</h4>
                      <p className="text-sm text-blue-700">When privacy is enabled: <span className="font-mono">Candidate #{settings.anonymousId.slice(-8)}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Updates about applications and messages</p>
                  </div>
                  <button onClick={() => handleToggle('emailNotifications', settings.emailNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Browser notifications for new opportunities</p>
                  </div>
                  <button onClick={() => handleToggle('pushNotifications', settings.pushNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">Tips, news, and promotional content</p>
                  </div>
                  <button onClick={() => handleToggle('marketingEmails', settings.marketingEmails)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.marketingEmails ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Appearance</CardTitle></CardHeader>
              <CardContent>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleThemeChange('TEAL')} className={`p-4 border-2 rounded-lg text-center transition-all ${settings.theme === 'TEAL' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Teal</p>
                  </button>
                  <button onClick={() => handleThemeChange('BLUE')} className={`p-4 border-2 rounded-lg text-center transition-all ${settings.theme === 'BLUE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Blue</p>
                  </button>
                  <button onClick={() => handleThemeChange('PURPLE')} className={`p-4 border-2 rounded-lg text-center transition-all ${settings.theme === 'PURPLE' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">Purple</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Delete Account</h4>
                      <p className="text-sm text-red-700">Permanently delete your account and all data. Cannot be undone.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={handleDeleteAccount}>
                      <Trash2 className="h-4 w-4 mr-2" />Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-5 w-5" />Subscription</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  {settings.isPremium ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Premium Member</p>
                      <p className="text-sm text-gray-600">{settings.premiumExpiresAt ? `Renews ${new Date(settings.premiumExpiresAt).toLocaleDateString()}` : 'Active'}</p>
                      <Link href="/candidate/premium"><Button variant="secondary" size="sm" className="mt-4 w-full">Manage Plan</Button></Link>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-1">Free Plan</p>
                      <p className="text-sm text-gray-600 mb-4">Upgrade to premium features</p>
                      <Link href="/candidate/premium"><Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">Upgrade Now</Button></Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
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
                  <span className="text-gray-900 font-medium">{settings.lastLoginAt ? new Date(settings.lastLoginAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <Button variant="secondary" size="sm" className="w-full mt-3" onClick={() => toast('Activity log coming soon')}>View Activity</Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700 mb-4">Our support team is here to assist you</p>
                <Link href="/help"><Button variant="secondary" size="sm" className="w-full">Contact Support</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;