/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Trash2,
  LogOut,
  Loader2,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType =
  | 'account'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'privacy';

interface UserSettings {
  email: string;
  companyName: string;
  industry: string;
  showCompanyName: boolean;
  anonymousId: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  theme: string;
  language: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return;

      // ✅ Only fetch if we don't have settings yet
      if (settings) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${session.user.id}/settings`);

        if (response.ok) {
          const result = await response.json();
          setSettings(result.settings);
        } else {
          toast.error('Failed to load settings');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error loading settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [status, session?.user?.id]); // ✅ Only depend on user ID, not full session

  const handleSaveAccount = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: settings.companyName,
          industry: settings.industry,
        }),
      });

      if (response.ok) {
        toast.success('Account settings saved!');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          marketingEmails: settings.marketingEmails,
        }),
      });

      if (response.ok) {
        toast.success('Notification preferences saved!');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: settings.theme,
          language: settings.language,
        }),
      });

      if (response.ok) {
        toast.success('Appearance settings saved!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showCompanyName: settings.showCompanyName,
        }),
      });

      if (response.ok) {
        toast.success('Privacy settings saved!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');

    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await signOut({ redirect: true, callbackUrl: '/' });
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete account');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-600">Settings not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Lock },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-manrope text-2xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your account preferences and security
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition ${
                          activeTab === tab.id
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="space-y-6 lg:col-span-3">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          disabled
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed
                        </p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              companyName: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={settings.industry}
                        onChange={(e) =>
                          setSettings({ ...settings, industry: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button onClick={handleSaveAccount} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Change Password
                      </label>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="password"
                          placeholder="New password (min 8 characters)"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-600">
                          Receive email updates
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-teal-600 peer-focus:ring-4 peer-focus:ring-teal-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Marketing Emails
                        </p>
                        <p className="text-sm text-gray-600">
                          Tips and product updates
                        </p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={settings.marketingEmails}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              marketingEmails: e.target.checked,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-teal-600 peer-focus:ring-4 peer-focus:ring-teal-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button
                        onClick={handleSaveNotifications}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() =>
                            setSettings({ ...settings, theme: 'teal' })
                          }
                          className={`rounded-lg border-2 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 ${
                            settings.theme === 'teal'
                              ? 'border-teal-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="mb-2 h-8 w-full rounded bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                          <p className="text-sm font-medium">Teal-Cyan</p>
                        </button>
                        <button
                          onClick={() =>
                            setSettings({ ...settings, theme: 'blue' })
                          }
                          className={`rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 ${
                            settings.theme === 'blue'
                              ? 'border-blue-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="mb-2 h-8 w-full rounded bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                          <p className="text-sm font-medium">Blue</p>
                        </button>
                        <button
                          onClick={() =>
                            setSettings({ ...settings, theme: 'purple' })
                          }
                          className={`rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 p-4 ${
                            settings.theme === 'purple'
                              ? 'border-purple-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="mb-2 h-8 w-full rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                          <p className="text-sm font-medium">Purple</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) =>
                          setSettings({ ...settings, language: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                      <Button
                        onClick={handleSaveAppearance}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Appearance
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <>
                  <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Show Company Name
                          </p>
                          <p className="text-sm text-gray-600">
                            Display your company name to free users
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={settings.showCompanyName}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                showCompanyName: e.target.checked,
                              })
                            }
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-teal-600 peer-focus:ring-4 peer-focus:ring-teal-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>

                      <div className="border-t pt-4">
                        <p className="mb-2 text-sm text-gray-600">
                          <strong>Privacy ID:</strong> Company #
                          {settings.anonymousId.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          When company name is hidden, free users see this ID
                          instead
                        </p>
                      </div>

                      <div className="flex justify-end border-t pt-4">
                        <Button onClick={handleSavePrivacy} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Privacy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-red-200 bg-white/70 backdrop-blur-sm">
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
                          <p className="text-sm text-gray-600">
                            Sign out from this device
                          </p>
                        </div>
                        <Button variant="secondary" onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div>
                          <p className="font-medium text-red-600">
                            Delete Account
                          </p>
                          <p className="text-sm text-gray-600">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          className="text-red-600 hover:bg-red-50"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
