// src/app/industry/post/terms/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
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
  Eye,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

export default function IndustryTermsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [readingTime, setReadingTime] = useState(30);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
      return;
    }

    const storedData = sessionStorage.getItem('opportunityFormData');
    if (!storedData) {
      toast.error('No opportunity data found');
      router.push('/industry/post');
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setFormData(parsed);
    } catch {
      router.push('/industry/post');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (readingTime > 0) {
      const timer = setTimeout(() => setReadingTime(readingTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [readingTime]);

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
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          termsAccepted: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('opportunityFormData');
        toast.success('✅ Opportunity submitted for admin approval!', { duration: 5000 });
        setTimeout(() => router.push('/industry/opportunities'), 1000);
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

  const canSubmit = hasScrolledToBottom && readingTime === 0 && isAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        user={
          session?.user
            ? {
                ...session.user,
                candidate: session.user.candidate ?? undefined,
                industry: session.user.industry ?? undefined,
                institute: session.user.institute ?? undefined,
              }
            : undefined
        }
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/industry/post" 
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
            <span className="ml-2 text-gray-600 text-sm">Admin Approval</span>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6 border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-blue-500 mr-3" />
              <p className="text-sm text-gray-900 font-medium">
                Opportunity saved. Accept terms to submit for admin approval.
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
                  <li>• All opportunities must be GENUINE and LEGAL</li>
                  <li>• You MUST read the complete document before proceeding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Progress */}
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
                Industry Terms & Conditions
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
                    By posting opportunities, you enter into a legally binding agreement. All terms are STRICTLY ENFORCED. 
                    Violations will result in account termination, legal action, and blacklisting.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">1. Genuine Opportunities Only (STRICTLY ENFORCED)</h4>
                  <p className="mb-2">
                    <strong className="text-red-700">All posted opportunities MUST be 100% legitimate and legal.</strong> Posting fake, fraudulent, or misleading opportunities will result in:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 text-red-700 font-medium">
                    <li>Immediate account suspension</li>
                    <li>Permanent ban from the platform</li>
                    <li>Legal action for fraud</li>
                    <li>Reporting to authorities if illegal activities detected</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">2. Admin Approval Required</h4>
                  <p className="mb-2">All opportunities go through admin review before going live:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Approval typically takes 24-48 hours</li>
                    <li>Incomplete or suspicious posts will be rejected</li>
                    <li>You will be notified of approval/rejection</li>
                    <li>Rejection does not guarantee feedback</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">3. Fair Compensation (MANDATORY)</h4>
                  <p>You MUST offer fair and legal compensation:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Unpaid internships must comply with local labor laws</li>
                    <li>Stipends must be paid on time as promised</li>
                    <li>No deceptive &#34;commission-only&#34; schemes</li>
                    <li>Clear payment terms in job description</li>
                  </ul>
                  <p className="mt-2 text-red-700 font-semibold">
                    Failure to pay candidates = Legal action + permanent ban
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">4. Professional Conduct with Candidates</h4>
                  <p>You MUST maintain professional behavior:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Respond to applications within 7 days</li>
                    <li>Provide interview feedback if requested</li>
                    <li>No harassment or discrimination</li>
                    <li>Respect candidate privacy</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">5. Data Privacy & GDPR Compliance</h4>
                  <p>You agree to:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>Use candidate data ONLY for hiring purposes</li>
                    <li>Delete data after hiring process completes</li>
                    <li>Never sell or share candidate information</li>
                    <li>Comply with all data protection laws</li>
                  </ul>
                  <p className="mt-2 text-red-700 font-semibold">
                    Data breach = ₹10 lakh fine + criminal charges
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">6. Platform Fees & Charges</h4>
                  <p>
                    Free accounts: 3 posts per category per month<br/>
                    Premium accounts: Unlimited posting + full candidate access<br/>
                    All fees are non-refundable
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">7. Prohibited Activities</h4>
                  <p>The following are STRICTLY FORBIDDEN:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2 text-red-700 font-medium">
                    <li>Multi-level marketing (MLM) schemes</li>
                    <li>Work-from-home scams</li>
                    <li>Commission-only jobs disguised as internships</li>
                    <li>Requiring candidates to pay any fees</li>
                    <li>Adult content or illegal services</li>
                    <li>Bypassing platform for direct hiring</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-gray-900 mb-2">8. Account Suspension & Termination</h4>
                  <p>Your account will be terminated for:</p>
                  <ul className="list-disc ml-5 space-y-1 mt-2 text-red-700 font-medium">
                    <li>Posting fake opportunities</li>
                    <li>Not paying promised stipends</li>
                    <li>Harassing candidates</li>
                    <li>Violating data privacy laws</li>
                    <li>Multiple rejected posts</li>
                  </ul>
                </section>

                <section className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h4 className="font-bold text-gray-900 mb-2">9. Final Declaration</h4>
                  <p className="font-semibold">
                    I declare that I have READ, UNDERSTOOD, and AGREE to all terms stated above. I confirm that:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 mt-2">
                    <li>The opportunity I&#39;m posting is genuine and legal</li>
                    <li>I will treat candidates professionally and fairly</li>
                    <li>I will pay any promised compensation on time</li>
                    <li>I will comply with all data protection laws</li>
                    <li>I understand violations lead to account termination</li>
                  </ul>
                </section>

                <div className="text-center py-4 text-xs text-gray-500">
                  Last Updated: January 2025 | Version 2.0 - Industry
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
                      I confirm this opportunity is genuine, legal, and all information is accurate. 
                      I will treat candidates fairly and comply with all terms.
                    </span>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link href="/industry/post" className="flex-1">
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
                  className="flex-1 bg-gradient-to-r from-teal-600 to-green-600"
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
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit for Approval
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}