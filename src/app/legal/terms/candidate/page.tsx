// src/app/legal/terms/candidate/page.tsx
// Candidate Terms & Conditions Page - Internship And Project 2.0

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Shield,
  Eye,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CandidateTermsPage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleAcceptTerms = async () => {
    setIsAccepting(true);

    try {
      const response = await fetch('/api/legal/terms/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'CANDIDATE',
          version: '1.0',
        }),
      });

      if (response.ok) {
        // Redirect to candidate dashboard
        router.push('/candidate');
      } else {
        console.error('Failed to accept terms');
        alert('Failed to accept terms. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;
    const isScrolledToBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setHasScrolledToBottom(isScrolledToBottom);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Internship And Project <span className="text-blue-600">2.0</span>
          </Link>
          <Link
            href="/candidate"
            className="flex items-center rounded-lg px-4 py-2 text-gray-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Candidate Terms & Conditions
            </CardTitle>
            <p className="mt-2 text-gray-600">
              Please review and accept our terms to continue using Internship And Project
              2.0 as a candidate.
            </p>
          </CardHeader>
        </Card>

        {/* Privacy Highlights */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Privacy Protected
              </h3>
              <p className="text-sm text-green-700">
                Your contact info is hidden by default
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Eye className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Anonymous Browsing
              </h3>
              <p className="text-sm text-blue-700">
                Companies see skills, not personal details
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <Crown className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">
                Premium Benefits
              </h3>
              <p className="text-sm text-yellow-700">
                Upgrade for full access & freelancing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Terms & Conditions for Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose h-96 max-w-none overflow-y-auto rounded-lg border bg-gray-50 p-4"
              onScroll={handleScroll}
            >
              <h3 className="mb-3 text-lg font-semibold">
                1. Candidate Responsibilities
              </h3>
              <p className="mb-4 text-gray-700">
                As a candidate on Internship And Project 2.0, you agree to:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Provide accurate and up-to-date profile information</li>
                <li>Submit genuine applications and documents</li>
                <li>Respect company privacy and confidentiality</li>
                <li>Use the platform professionally and ethically</li>
                <li>Honor commitments made to internship providers</li>
                <li>Not circumvent the platform for direct communication</li>
                <li>Report any inappropriate behavior by companies</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                2. Privacy Protection System
              </h3>
              <p className="mb-4 text-gray-700">
                Internship And Project 2.0 protects your privacy through our advanced
                anonymization system:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  Your personal contact information is hidden from companies by
                  default
                </li>
                <li>
                  Companies see your skills and qualifications without your
                  identity
                </li>
                <li>You control what information to share and when</li>
                <li>Premium membership reveals full company details to you</li>
                <li>All data access is logged for your security</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                3. Opportunity Types & Access
              </h3>
              <p className="mb-4 text-gray-700">
                Internship And Project 2.0 offers three types of opportunities:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Internships:</strong> Academic credit opportunities
                  (Free access)
                </li>
                <li>
                  <strong>Projects:</strong> Short-term work engagements (Free
                  access)
                </li>
                <li>
                  <strong>Freelancing:</strong> Independent contractor work
                  (Premium only - ₹99/month)
                </li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                4. Premium Features
              </h3>
              <p className="mb-4 text-gray-700">
                Premium candidates (₹99/month) receive:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Access to exclusive freelancing opportunities</li>
                <li>Full company names and contact details</li>
                <li>Priority application processing</li>
                <li>Advanced analytics and insights</li>
                <li>Direct messaging with verified companies</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                5. Institute Integration
              </h3>
              <p className="mb-4 text-gray-700">
                If you&#39;re affiliated with an educational institute:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Your institute may track your internship progress</li>
                <li>
                  Freelancing opportunities are hidden for academic integrity
                </li>
                <li>Your progress may be shared with academic coordinators</li>
                <li>Institute verification may be required</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                6. Data Usage & Rights
              </h3>
              <p className="mb-4 text-gray-700">
                You retain ownership of your data while granting us limited
                usage rights:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>We use your data only for platform functionality</li>
                <li>Your data is never sold to third parties</li>
                <li>You can export or delete your data at any time</li>
                <li>We maintain audit logs for legal compliance</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                7. Prohibited Activities
              </h3>
              <p className="mb-4 text-gray-700">
                The following activities are strictly prohibited:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Creating fake profiles or providing false information</li>
                <li>Attempting to bypass privacy controls</li>
                <li>Sharing platform content outside without permission</li>
                <li>Harassment or inappropriate behavior</li>
                <li>Using automated tools to scrape data</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                8. Account Termination
              </h3>
              <p className="mb-4 text-gray-700">
                We may terminate accounts that violate these terms. You may also
                delete your account at any time through your settings.
              </p>

              <h3 className="mb-3 text-lg font-semibold">
                9. Legal Compliance
              </h3>
              <p className="mb-4 text-gray-700">
                These terms are governed by Indian law. By accepting, you agree
                to resolve disputes through arbitration in Mumbai, India.
              </p>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="font-medium text-blue-800">
                  By clicking &#34;Accept Terms&#34; below, you acknowledge that you
                  have read, understood, and agree to be bound by these terms
                  and conditions.
                </p>
              </div>
            </div>

            {/* Scroll Notice */}
            {!hasScrolledToBottom && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center text-yellow-800">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span className="text-sm">
                    Please scroll to the bottom to read all terms
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleAcceptTerms}
                disabled={!hasScrolledToBottom || isAccepting}
                className="flex-1"
              >
                {isAccepting ? (
                  'Accepting...'
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Terms & Continue
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isAccepting}
              >
                Cancel
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              By accepting these terms, you also agree to our Privacy Policy and
              Platform Guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
