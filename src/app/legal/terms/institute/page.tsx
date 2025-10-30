// src/app/legal/terms/institute/page.tsx
// Institute Terms & Conditions Page - Internship And Project 2.0

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
  GraduationCap,
  Users,
  School,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InstituteTermsPage() {
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
          userType: 'INSTITUTE',
          version: '1.0',
        }),
      });

      if (response.ok) {
        // Redirect to institute dashboard
        router.push('/institute');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Internship And Project <span className="text-purple-600">2.0</span>
          </Link>
          <Link
            href="/institute"
            className="flex items-center rounded-lg px-4 py-2 text-gray-600 transition-colors hover:text-purple-600"
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <School className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Institute Terms & Conditions
            </CardTitle>
            <p className="mt-2 text-gray-600">
              Please review and accept our terms to continue using Internship And Project
              2.0 as an educational institution.
            </p>
          </CardHeader>
        </Card>

        {/* Feature Highlights */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <h3 className="font-semibold text-purple-900">
                Student Management
              </h3>
              <p className="text-sm text-purple-700">
                Track your students&#39; progress
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <GraduationCap className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Academic Integration
              </h3>
              <p className="text-sm text-blue-700">
                Manage internship requirements
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Student Privacy
              </h3>
              <p className="text-sm text-green-700">
                Protected academic records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Terms & Conditions for Educational Institutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose h-96 max-w-none overflow-y-auto rounded-lg border bg-gray-50 p-4"
              onScroll={handleScroll}
            >
              <h3 className="mb-3 text-lg font-semibold">
                1. Institute Responsibilities
              </h3>
              <p className="mb-4 text-gray-700">
                As an educational institute on Internship And Project 2.0, you agree to:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Provide accurate institutional information and accreditation</li>
                <li>Verify student enrollment before granting platform access</li>
                <li>Monitor student internship activities for academic compliance</li>
                <li>Respect student privacy while tracking academic progress</li>
                <li>Use the platform to facilitate genuine academic requirements</li>
                <li>Report any issues or concerns regarding student safety</li>
                <li>Maintain up-to-date program and curriculum information</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                2. Student Management & Verification
              </h3>
              <p className="mb-4 text-gray-700">
                Institute account capabilities include:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Verify students using institutional email domains</li>
                <li>Track student applications and internship placements</li>
                <li>Monitor academic credit fulfillment through internships</li>
                <li>Generate reports for placement and accreditation purposes</li>
                <li>Manage multiple academic programs and departments</li>
                <li>Set internship requirements per program/semester</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                3. Student Privacy & Data Protection
              </h3>
              <p className="mb-4 text-gray-700">
                Protecting student data is our top priority:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Students control their own profile visibility settings</li>
                <li>Institute can track academic progress but not private communications</li>
                <li>Student data used only for academic and placement purposes</li>
                <li>Freelancing opportunities are hidden from institute-verified students</li>
                <li>Student consent required for sharing data with third parties</li>
                <li>Comply with FERPA and other student privacy regulations</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                4. Domain Verification
              </h3>
              <p className="mb-4 text-gray-700">
                To ensure authenticity:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Verify your institutional email domain (e.g., @university.edu)</li>
                <li>Students with verified email domains are automatically linked</li>
                <li>Domain verification enhances trust and credibility</li>
                <li>Multiple domains can be added for campus branches</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                5. Academic Integrity
              </h3>
              <p className="mb-4 text-gray-700">
                Institutes must ensure:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Internship opportunities align with academic curriculum</li>
                <li>Students receive proper academic credit for internships</li>
                <li>Internship requirements are clearly communicated</li>
                <li>Quality standards for internships are maintained</li>
                <li>Student work is properly evaluated and documented</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                6. Platform Integration
              </h3>
              <p className="mb-4 text-gray-700">
                How institutes use Internship And Project 2.0:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Dashboard for tracking all student placements</li>
                <li>Analytics on application success rates and trends</li>
                <li>Direct communication with verified companies</li>
                <li>Export reports for accreditation and compliance</li>
                <li>Integration with existing student management systems (future)</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                7. Prohibited Activities
              </h3>
              <p className="mb-4 text-gray-700">
                The following activities are prohibited:
              </p>
              <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">
                <li>Verifying non-enrolled students</li>
                <li>Selling or sharing student data with external parties</li>
                <li>Forcing students to accept specific opportunities</li>
                <li>Using platform for non-academic recruitment purposes</li>
                <li>Accessing student private messages or communications</li>
              </ul>

              <h3 className="mb-3 text-lg font-semibold">
                8. Account Management
              </h3>
              <p className="mb-4 text-gray-700">
                Institute accounts may be suspended for policy violations, providing
                false information, or student privacy breaches. Institutes may close
                accounts at any time, with student data being retained as per regulations.
              </p>

              <h3 className="mb-3 text-lg font-semibold">
                9. Legal Compliance
              </h3>
              <p className="mb-4 text-gray-700">
                These terms are governed by Indian law and educational regulations.
                Institutes agree to comply with FERPA, data protection laws, and
                accreditation requirements in their jurisdiction.
              </p>

              <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="font-medium text-purple-800">
                  By clicking &#34;Accept Terms&#34; below, you acknowledge that your institution
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
              Student Data Protection Guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}