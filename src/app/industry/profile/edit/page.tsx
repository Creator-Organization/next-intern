/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Save,
  X,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface IndustryProfile {
  companyName: string;
  industry: string;
  companySize: string;
  foundedYear: number | null;
  email: string;
  phone: string;
  websiteUrl: string;
  linkedinUrl: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export default function EditIndustryProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<IndustryProfile>({
    companyName: '',
    industry: '',
    companySize: 'SMALL',
    foundedYear: null,
    email: '',
    phone: '',
    websiteUrl: '',
    linkedinUrl: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.industry?.id) return;

      try {
        const response = await fetch(`/api/industries/${session.user.industry.id}/profile`);
        const result = await response.json();

        if (result.success) {
          setFormData({
            companyName: result.data.companyName || '',
            industry: result.data.industry || '',
            companySize: result.data.companySize || 'SMALL',
            foundedYear: result.data.foundedYear || null,
            email: result.data.email || '',
            phone: result.data.phone || '',
            websiteUrl: result.data.websiteUrl || '',
            linkedinUrl: result.data.linkedinUrl || '',
            description: result.data.description || '',
            address: result.data.address || '',
            city: result.data.city || '',
            state: result.data.state || '',
            country: result.data.country || 'India',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [session, status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'foundedYear' ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.industry?.id) {
      toast.error('Industry profile not found');
      return;
    }

    // Validation
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.industry.trim()) {
      toast.error('Industry field is required');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      toast.error('City and State are required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/industries/${session.user.industry.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Profile updated successfully!');
        router.push('/industry/profile');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/industry/profile"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Profile
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                Edit Company Profile
              </h1>
              <p className="text-gray-600">Update your company information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="e.g., Technology, Finance, Healthcare"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="STARTUP">Startup (1-10)</option>
                      <option value="SMALL">Small (11-50)</option>
                      <option value="MEDIUM">Medium (51-200)</option>
                      <option value="LARGE">Large (201-1000)</option>
                      <option value="ENTERPRISE">Enterprise (1000+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Founded Year</label>
                    <Input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear || ''}
                      onChange={handleChange}
                      placeholder="e.g., 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">About Company</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell candidates about your company, culture, and what makes you unique..."
                    rows={5}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A compelling description helps attract quality candidates
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="company@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Website URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <Input
                        type="url"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-gray-400" />
                      <Input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <Input
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/industry/profile">
                <Button type="button" variant="secondary">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-teal-600 to-green-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}