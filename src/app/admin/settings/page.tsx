/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Settings as SettingsIcon,
  DollarSign,
  Shield,
  FileText,
  Server,
  Mail,
  Globe,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface Settings {
  platform: {
    siteName: string;
    platformTagline: string;
    supportEmail: string;
    emailNotifications: boolean;
    newUserRegistration: boolean;
    maintenanceMode: boolean;
  };
  pricing: {
    candidatePremiumMonthly: number;
    industryPremiumMonthly: number;
    freeIndustryPosts: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    maxLoginAttempts: number;
    twoFactorAuth: boolean;
    googleOAuth: boolean;
  };
  compliance: {
    termsVersion: string;
    privacyPolicyVersion: string;
    dataRetentionPeriod: number;
    auditLogging: boolean;
    gdprCompliance: boolean;
  };
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('platform');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    platform: {
      siteName: 'NextIntern 2.0',
      platformTagline: 'Privacy-focused internship marketplace',
      supportEmail: 'support@nextintern.com',
      emailNotifications: true,
      newUserRegistration: true,
      maintenanceMode: false,
    },
    pricing: {
      candidatePremiumMonthly: 1999,
      industryPremiumMonthly: 4999,
      freeIndustryPosts: 3,
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      twoFactorAuth: true,
      googleOAuth: true,
    },
    compliance: {
      termsVersion: '1.0',
      privacyPolicyVersion: '1.0',
      dataRetentionPeriod: 90,
      auditLogging: true,
      gdprCompliance: true,
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeTab,
          settings: settings[activeTab as keyof Settings],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Settings saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'platform', label: 'Platform Settings', icon: Server },
    { id: 'pricing', label: 'Pricing & Limits', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: FileText },
  ];

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-manrope text-3xl font-bold text-gray-900">
          System Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Configure platform settings and policies
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Platform Settings Tab */}
      {activeTab === 'platform' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <Globe className="text-primary-600 h-5 w-5" />
              Platform Configuration
            </h2>
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.platform.siteName}
                  onChange={(e) =>
                    updateSetting('platform', 'siteName', e.target.value)
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Platform Tagline
                </label>
                <input
                  type="text"
                  value={settings.platform.platformTagline}
                  onChange={(e) =>
                    updateSetting('platform', 'platformTagline', e.target.value)
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.platform.supportEmail}
                  onChange={(e) =>
                    updateSetting('platform', 'supportEmail', e.target.value)
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <Mail className="text-primary-600 h-5 w-5" />
              Email & Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Send system emails to users
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.platform.emailNotifications}
                    onChange={(e) =>
                      updateSetting(
                        'platform',
                        'emailNotifications',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    New User Registration
                  </p>
                  <p className="text-sm text-gray-600">
                    Allow new users to sign up
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.platform.newUserRegistration}
                    onChange={(e) =>
                      updateSetting(
                        'platform',
                        'newUserRegistration',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">
                    Put platform in maintenance mode
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.platform.maintenanceMode}
                    onChange={(e) =>
                      updateSetting(
                        'platform',
                        'maintenanceMode',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pricing & Limits Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <DollarSign className="text-primary-600 h-5 w-5" />
              Premium Pricing
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Candidate Premium (Monthly)
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={settings.pricing.candidatePremiumMonthly}
                    onChange={(e) =>
                      updateSetting(
                        'pricing',
                        'candidatePremiumMonthly',
                        parseInt(e.target.value)
                      )
                    }
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 py-2 pr-4 pl-8 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Industry Premium (Monthly)
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={settings.pricing.industryPremiumMonthly}
                    onChange={(e) =>
                      updateSetting(
                        'pricing',
                        'industryPremiumMonthly',
                        parseInt(e.target.value)
                      )
                    }
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 py-2 pr-4 pl-8 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-manrope mb-6 text-xl font-bold text-gray-900">
              Posting Limits
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Free Industry Posts (per month)
                </label>
                <input
                  type="number"
                  value={settings.pricing.freeIndustryPosts}
                  onChange={(e) =>
                    updateSetting(
                      'pricing',
                      'freeIndustryPosts',
                      parseInt(e.target.value)
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Premium Industry Posts
                </label>
                <input
                  type="text"
                  value="Unlimited"
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <Lock className="text-primary-600 h-5 w-5" />
              Security Settings
            </h2>
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      'security',
                      'sessionTimeout',
                      parseInt(e.target.value)
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password Minimum Length
                </label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    updateSetting(
                      'security',
                      'passwordMinLength',
                      parseInt(e.target.value)
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    updateSetting(
                      'security',
                      'maxLoginAttempts',
                      parseInt(e.target.value)
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-manrope mb-6 text-xl font-bold text-gray-900">
              Authentication
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) =>
                      updateSetting(
                        'security',
                        'twoFactorAuth',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Google OAuth</p>
                  <p className="text-sm text-gray-600">Allow Google sign-in</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.googleOAuth}
                    onChange={(e) =>
                      updateSetting('security', 'googleOAuth', e.target.checked)
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-manrope mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <FileText className="text-primary-600 h-5 w-5" />
              Legal & Compliance
            </h2>
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Terms Version
                </label>
                <input
                  type="text"
                  value={settings.compliance.termsVersion}
                  onChange={(e) =>
                    updateSetting('compliance', 'termsVersion', e.target.value)
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Privacy Policy Version
                </label>
                <input
                  type="text"
                  value={settings.compliance.privacyPolicyVersion}
                  onChange={(e) =>
                    updateSetting(
                      'compliance',
                      'privacyPolicyVersion',
                      e.target.value
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  value={settings.compliance.dataRetentionPeriod}
                  onChange={(e) =>
                    updateSetting(
                      'compliance',
                      'dataRetentionPeriod',
                      parseInt(e.target.value)
                    )
                  }
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-manrope mb-6 text-xl font-bold text-gray-900">
              User Data
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-gray-900">Audit Logging</p>
                  <p className="text-sm text-gray-600">Log all admin actions</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.compliance.auditLogging}
                    onChange={(e) =>
                      updateSetting(
                        'compliance',
                        'auditLogging',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    GDPR Compliance Mode
                  </p>
                  <p className="text-sm text-gray-600">Enable GDPR features</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.compliance.gdprCompliance}
                    onChange={(e) =>
                      updateSetting(
                        'compliance',
                        'gdprCompliance',
                        e.target.checked
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="peer-focus:ring-primary-300 peer peer-checked:bg-primary-600 h-6 w-11 rounded-full bg-gray-200 peer-focus:ring-4 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-2xl">
          <Button variant="secondary" onClick={() => fetchSettings()} size="sm">
            Cancel
          </Button>
          <Button
            className="bg-primary-600 hover:bg-primary-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
