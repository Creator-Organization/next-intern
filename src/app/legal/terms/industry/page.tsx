// src/app/legal/terms/industry/page.tsx
// Company/Industry Terms & Conditions Page - Internship And Project 2.0

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
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IndustryTermsPage() {
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
          userType: 'INDUSTRY',
          version: '1.0',
        }),
      });

      if (response.ok) {
        // Redirect to industry dashboard
        router.push('/industry');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Internship And Project <span className="text-green-600">2.0</span>
          </Link>
          <Link
            href="/industry"
            className="flex items-center rounded-lg px-4 py-2 text-gray-600 transition-colors hover:text-green-600"
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Company Terms & Conditions
            </CardTitle>
            <p className="mt-2 text-gray-600">
              Please review and accept our terms to continue using Internship And Project
              2.0 as a company/recruiter.
            </p>
          </CardHeader>
        </Card>

        {/* Feature Highlights */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Verified Platform
              </h3>
              <p className="text-sm text-green-700">
                Access verified candidate profiles
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Eye className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Quality Candidates
              </h3>
              <p className="text-sm text-blue-700">
                Find skilled talent efficiently
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <Crown className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900">
                Premium Features
              </h3>
              <p className="text-sm text-yellow-700">
                Unlimited posts & full candidate access
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Terms & Conditions for Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose h-96 max-w-none overflow-y-auto rounded-lg border bg-gray-50 p-4"
              onScroll={handleScroll}
            >
              <h3 className="mb-3 text-lg font-semibold">
                1. Company Responsibilities
              </h3>
              <p className="mb-4 text-gray-700">
                As a company on Internship And Project 2.0, you agree to:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Provide accurate company information and job descriptions</li>
                <li>Post only genuine opportunities with fair compensation</li>
                <li>Respect candidate privacy and data protection</li>
                <li>Conduct professional and ethical recruitment processes</li>
                <li>Honor commitments made to selected candidates</li>
                <li>Not discriminate based on protected characteristics</li>
                <li>Comply with labor laws and employment regulations</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                2. Posting Limits & Premium Features
              </h3>
              <p className="mb-4 text-gray-700">
                Internship And Project 2.0 offers tiered access for companies:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>
                  <strong>Free Account:</strong> 3 opportunity posts per month (each type: Internship, Project, Freelancing)
                </li>
                <li>
                  <strong>Free Account:</strong> See candidate skills but not full contact details
                </li>
                <li>
                  <strong>Premium Account (₹999/month):</strong> Unlimited opportunity posts
                </li>
                <li>
                  <strong>Premium Account:</strong> Full candidate contact information access
                </li>
                <li>
                  <strong>Premium Account:</strong> Post freelancing opportunities
                </li>
                <li>
                  <strong>Premium Account:</strong> Priority listing and advanced analytics
                </li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                3. Candidate Privacy Protection
              </h3>
              <p className="mb-4 text-gray-700">
                We protect candidate privacy through strict controls:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Free accounts see anonymized candidate profiles</li>
                <li>Contact information requires premium membership or candidate consent</li>
                <li>All data access is logged for audit purposes</li>
                <li>Candidates control what information is visible</li>
                <li>Misuse of candidate data may result in account termination</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                4. Verification & Trust
              </h3>
              <p className="mb-4 text-gray-700">
                Company verification enhances your credibility:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Submit company registration documents for verification</li>
                <li>Verified companies receive a trust badge</li>
                <li>Verification increases candidate application rates</li>
                <li>Maintain active status by posting genuine opportunities</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                5. Fair Recruitment Practices
              </h3>
              <p className="mb-4 text-gray-700">
                Companies must adhere to ethical hiring standards:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Provide clear job descriptions and requirements</li>
                <li>Offer fair compensation and working conditions</li>
                <li>Communicate transparently about selection process</li>
                <li>Respond to applications within reasonable timeframes</li>
                <li>Provide feedback to interviewed candidates when possible</li>
                <li>Honor all commitments made during recruitment</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                6. Data Usage & Compliance
              </h3>
              <p className="mb-4 text-gray-700">
                When accessing candidate data:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Use candidate data only for recruitment purposes</li>
                <li>Do not share, sell, or distribute candidate information</li>
                <li>Comply with data protection regulations (GDPR, local laws)</li>
                <li>Delete candidate data when no longer needed</li>
                <li>Maintain confidentiality of application materials</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                7. Prohibited Activities
              </h3>
              <p className="mb-4 text-gray-700">
                The following activities are strictly prohibited:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Posting fake or misleading opportunities</li>
                <li>Requesting payment or fees from candidates</li>
                <li>Discriminatory hiring practices</li>
                <li>Harassment or inappropriate communication</li>
                <li>Attempting to bypass platform for direct contact</li>
                <li>Collecting candidate data for non-recruitment purposes</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                8. Account Suspension & Termination
              </h3>
              <p className="mb-4 text-gray-700">
                Accounts may be suspended or terminated for violations of these terms,
                fraudulent activities, or repeated candidate complaints. Companies may
                also close their accounts at any time through settings.
              </p>

              <h3 className="mb-3 text-lg font-semibold">
                9. Legal Compliance
              </h3>
              <p className="mb-4 text-gray-700">
                These terms are governed by Indian law. Companies agree to comply with
                all applicable employment laws, data protection regulations, and labor
                standards in their jurisdiction.
              </p>

              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="font-medium text-green-800">
                  By clicking &#34;Accept Terms&#34; below, you acknowledge that your company
                  has read, understood, and agrees to be bound by these terms and conditions.
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
                variant="primary"
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
              Recruitment Guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}