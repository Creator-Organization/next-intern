/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/candidate/apply/[id]/terms/page.tsx
// Strict Terms & Conditions with Read Enforcement

"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Check,
  Loader2,
  AlertTriangle,
  Shield,
  CheckCircle,
  Lock,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface TermsPageProps {
  params: Promise<{ id: string }>;
}

const TermsPage = ({ params }: TermsPageProps) => {
  const resolvedParams = use(params);
  const opportunityId = resolvedParams.id;

  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readingTime, setReadingTime] = useState(30); // 30 seconds forced reading

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin`);
      return;
    }

    if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
      return;
    }

    const storedData = sessionStorage.getItem('applicationFormData');
    if (!storedData) {
      toast.error('No application data found');
      router.push(`/candidate/apply/${opportunityId}`);
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      if (parsed.opportunityId !== opportunityId) {
        router.push(`/candidate/apply/${opportunityId}`);
        return;
      }
      setFormData(parsed);
    } catch {
      router.push(`/candidate/apply/${opportunityId}`);
    }
  }, [status, session, router, opportunityId]);

  // ✅ Force reading timer
  useEffect(() => {
    if (readingTime > 0) {
      const timer = setTimeout(() => setReadingTime(readingTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [readingTime]);

  // ✅ Track scrolling to bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      toast.success('Terms read completely');
    }
  };

  const handleSubmit = async () => {
    if (!hasScrolledToBottom) {
      toast.error('Please read the complete terms and conditions');
      return;
    }

    if (readingTime > 0) {
      toast.error(`Please wait ${readingTime} seconds to ensure you've read the terms`);
      return;
    }

    if (!isAccepted) {
      toast.error('You must accept the terms to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: formData.coverLetter,
          whyInterested: formData.whyInterested,
          portfolioUrl: formData.portfolioUrl,
          termsAccepted: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('applicationFormData');
        toast.success('Application submitted successfully!');
        setTimeout(() => router.push('/candidate/applications'), 1000);
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch {
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  const user = session?.user;
  const canSubmit = hasScrolledToBottom && readingTime === 0 && isAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user ? {
        id: user.id,
        email: user.email || '',
        userType: user.userType,
        candidate: user.name ? {
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ')[1] || ''
        } : undefined
      } : undefined} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href={`/candidate/apply/${opportunityId}`} 
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Check className="h-5 w-5" />
            </div>
            <span className="ml-2 text-green-600 font-semibold text-sm">Form Completed</span>
          </div>
          <div className="w-12 h-0.5 bg-primary-600"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              2
            </div>
            <span className="ml-2 font-semibold text-primary-600 text-sm">Terms & Conditions</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              3
            </div>
            <span className="ml-2 text-gray-600 text-sm">Submit</span>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6 border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-gray-900 font-medium">
                Application saved. Please read and accept terms to submit.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* STRICT WARNING */}
        <Card className="mb-6 bg-red-50 border-2 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ⚠️ MANDATORY - READ COMPLETELY
                </h3>
                <p className="text-sm text-red-800 font-semibold mb-2">
                  These Terms & Conditions are LEGALLY BINDING and STRICTLY ENFORCED.
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Violation may result in <strong>IMMEDIATE ACCOUNT SUSPENSION</strong></li>
                  <li>• False information will lead to <strong>PERMANENT BAN</strong></li>
                  <li>• Legal action may be taken for serious violations</li>
                  <li>• You MUST read the complete document before proceeding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Progress Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={hasScrolledToBottom ? 'border-green-500' : 'border-gray-300'}>
            <CardContent className="p-4 flex items-center">
              {hasScrolledToBottom ? (
                <>
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Terms Read ✓</span>
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Scroll to Bottom Required</span>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className={readingTime === 0 ? 'border-green-500' : 'border-orange-500'}>
            <CardContent className="p-4 flex items-center">
              {readingTime === 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Time Verified ✓</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm font-medium text-orange-700">
                    Wait {readingTime}s
                  </span>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900 font-manrope">
                Terms & Conditions
              </h1>
            </div>

            {/* Scrollable Terms */}
            <div 
              onScroll={handleScroll}
              className="bg-gray-50 rounded-lg p-6 max-h-[500px] overflow-y-auto border-2 border-gray-300 mb-6"
            >
              <div className="space-y-6 text-sm text-gray-800">
                
                <section className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h4 className="font-bold text-red-900 mb-2 text-base">⚠️ CRITICAL - LEGAL BINDING AGREEMENT</h4>
                  <p className="text-red-800 font-semibold">
                    By proceeding, you enter into a legally binding agreement. All terms are STRICTLY ENFORCED. 
                    Violations will result in immediate consequences including account termination and potential legal action.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">1. Information Accuracy (STRICTLY ENFORCED)</h4>
                  <p className="mb-2">
                    <strong className="text-red-700">You MUST provide 100% accurate information.</strong> Any false, 
                    misleading, or fabricated data will result in:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 text-red-700 font-medium">
                    <li>Immediate rejection of application</li>
                    <li>Permanent ban from the platform</li>
                    <li>Blacklisting from future opportunities</li>
                    <li>Legal action if fraud is detected</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">2. Data Sharing & Privacy</h4>
                  <p className="mb-2">By applying, you EXPLICITLY consent that:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Your application will be shared with the employer</li>
                    <li>Contact information becomes visible if shortlisted</li>
                    <li>Application history is retained for 12 months</li>
                    <li>Platform may use anonymized data for analytics</li>
                  </ul>
                  <p className="mt-2 font-semibold text-red-700">
                    Withdrawing consent after submission is NOT possible. Think carefully before proceeding.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">3. Professional Conduct (MANDATORY)</h4>
                  <p>You MUST maintain professional behavior:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Respond to employer communications within 48 hours</li>
                    <li>Attend scheduled interviews or inform 24 hours in advance</li>
                    <li>No spam applications or mass applying</li>
                    <li>Respectful communication at all times</li>
                  </ul>
                  <p className="mt-2 text-red-700 font-semibold">
                    Violation = Account suspension for 30-90 days or permanent ban
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">4. Application Commitment</h4>
                  <p>By applying, you confirm:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Genuine interest in this specific opportunity</li>
                    <li>Available for the stated duration/timeline</li>
                    <li>Will honor interview invitations</li>
                    <li>Understand rejection does not guarantee feedback</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">5. Platform Liability</h4>
                  <p>
                    Internship And Project is a PLATFORM ONLY. We do NOT guarantee employment, payment terms, or work conditions. 
                    All agreements are between you and the employer. We are NOT responsible for:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Employer decisions or rejections</li>
                    <li>Salary negotiations or payment disputes</li>
                    <li>Work environment or management issues</li>
                    <li>Contract violations by either party</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">6. Intellectual Property Rights</h4>
                  <p>
                    Your submitted work samples remain your property. However, employers may review them for evaluation. 
                    Do NOT submit copyrighted material you don&#39;t own or confidential information from previous employers.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">7. Account Suspension & Termination</h4>
                  <p>Your account may be suspended or terminated for:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2 text-red-700 font-medium">
                    <li>False information or fraudulent applications</li>
                    <li>Harassment or unprofessional behavior</li>
                    <li>Multiple no-shows for interviews</li>
                    <li>Spam or misuse of platform features</li>
                    <li>Attempting to bypass platform for direct hiring</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">8. No Refunds Policy</h4>
                  <p>
                    For premium members: Application submissions do NOT guarantee interviews or selection. 
                    Subscription fees are non-refundable. Premium benefits are clearly stated at purchase.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">9. Communication & Notifications</h4>
                  <p>You consent to receive:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Application status updates via email and notifications</li>
                    <li>Interview invitations and reminders</li>
                    <li>Platform updates and policy changes</li>
                    <li>Marketing communications (opt-out available)</li>
                  </ul>
                </section>

                <section className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h4 className="font-bold text-gray-900 mb-2">10. Final Declaration</h4>
                  <p className="font-semibold">
                    I declare that I have READ, UNDERSTOOD, and AGREE to all terms stated above. I understand that 
                    this is a legally binding agreement and violations may result in account termination, legal action, 
                    and other consequences. I confirm all information provided is accurate and truthful.
                  </p>
                </section>

                <div className="text-center py-4 text-xs text-gray-500">
                  Last Updated: January 2025 | Version 2.0
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="border-t pt-6">
              <div className={`border-2 rounded-lg p-6 mb-6 ${isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={(e) => setIsAccepted(e.target.checked)}
                    disabled={isSubmitting || !hasScrolledToBottom || readingTime > 0}
                    className="mt-1 h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm">
                    <span className="font-bold text-gray-900">
                      I HAVE READ THE COMPLETE TERMS & CONDITIONS
                    </span>
                    <br />
                    <span className="text-gray-700 font-semibold">
                      I understand these are legally binding and strictly enforced. I accept all terms and 
                      consequences for violations. All information provided is accurate.
                    </span>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link href={`/candidate/apply/${opportunityId}`} className="flex-1">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <Button 
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : !hasScrolledToBottom ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Read Complete Terms
                    </>
                  ) : readingTime > 0 ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Wait {readingTime}s
                    </>
                  ) : !isAccepted ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Accept Terms
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsPage;