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
  Shield,
  CheckCircle,
  Upload,
  FileText,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    taxId: '',
    documents: '',
    notes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      if (!session?.user?.industry?.id) return;

      try {
        const response = await fetch(`/api/industries/${session.user.industry.id}/profile`);
        const result = await response.json();
        
        if (result.success && result.data.isVerified) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Failed to check verification:', error);
      }
    };

    if (status === 'authenticated') {
      checkVerification();
    }
  }, [session, status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.industry?.id) {
      toast.error('Industry profile not found');
      return;
    }

    if (!formData.registrationNumber.trim()) {
      toast.error('Company registration number is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/verify/industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: session.user.industry.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Verification request submitted successfully!');
        toast.success('Our team will review within 24-48 hours');
        router.push('/industry/profile');
      } else {
        toast.error(result.error || 'Failed to submit verification request');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header user={session?.user as any} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Company is Verified!
              </h2>
              <p className="text-gray-700 mb-6">
                Your company has already been verified by our team.
              </p>
              <Link href="/industry/profile">
                <Button className="bg-green-600 hover:bg-green-700">
                  Back to Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/industry/profile"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 font-manrope">
              Request Company Verification
            </h1>
            <p className="text-gray-600">
              Get verified to build trust and attract more quality candidates
            </p>
          </div>

          {/* Benefits Card */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                Verification Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5" />
                  <span>
                    <strong>3x more applications:</strong> Verified companies receive
                    significantly more candidate interest
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5" />
                  <span>
                    <strong>Build trust:</strong> Verification badge increases credibility
                    with candidates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5" />
                  <span>
                    <strong>Priority listing:</strong> Verified companies appear higher in
                    search results
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5" />
                  <span>
                    <strong>Faster reviews:</strong> Verification typically completed within
                    24-48 hours
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Company Registration Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g., U72900KA2015PTC082000"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    CIN/Registration number from Ministry of Corporate Affairs
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tax ID / GST Number
                  </label>
                  <Input
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    GST number or PAN for verification purposes
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Supporting Documents (URLs)
                  </label>
                  <Input
                    name="documents"
                    value={formData.documents}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/... or multiple URLs separated by commas"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload documents to Google Drive/Dropbox and paste links here
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information you'd like to provide..."
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Required Documents Info */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Upload className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>Certificate of Incorporation / Registration Certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Upload className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>GST Registration Certificate (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Upload className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>PAN Card of Company</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Upload className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>Company letterhead or official email domain verification</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>
                      <strong>Note:</strong> All documents will be reviewed by our admin
                      team within 24-48 hours. You&#39;ll be notified via email once verified.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Link href="/industry/profile">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-green-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Verification
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