// src/app/candidate/apply/[id]/page.tsx
// Step 1: Application Form - Simple & Clean

"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  Clock, 
  Wallet, 
  ArrowLeft, 
  MapPin,
  Building,
  Users,
  Crown,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface OpportunityDetails {
  id: string;
  title: string;
  description: string;
  type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  stipend?: number;
  currency: string;
  duration?: number;
  requirements: string;
  isPremiumOnly: boolean;
  showCompanyName: boolean;
  location: {
    city: string;
    state: string;
    country: string;
  };
  industry: {
    id: string;
    companyName: string;
    industry: string;
    isVerified: boolean;
    showCompanyName: boolean;
    anonymousId: string;
  };
  category: {
    name: string;
  };
  skills: Array<{
    skillName: string;
    isRequired: boolean;
  }>;
}

interface ApplicationFormData {
  coverLetter: string;
  whyInterested: string;
  portfolioUrl?: string;
}

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

const ApplyPage = ({ params }: ApplyPageProps) => {
  const resolvedParams = use(params);
  const opportunityId = resolvedParams.id;

  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    whyInterested: '',
    portfolioUrl: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/candidate/apply/${opportunityId}`);
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router, opportunityId]);

  useEffect(() => {
    const fetchOpportunity = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`);
        
        if (response.ok) {
          const data = await response.json();
          setOpportunity(data.data);
        } else {
          toast.error('Failed to load opportunity');
          router.push('/candidate/browse');
        }
      } catch (error) {
        console.error('Failed to fetch opportunity:', error);
        toast.error('Failed to load opportunity');
        router.push('/candidate/browse');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required');
      toast.error('Cover letter is required');
      return false;
    }
    if (formData.coverLetter.trim().length < 100) {
      setError('Cover letter must be at least 100 characters');
      toast.error('Cover letter must be at least 100 characters');
      return false;
    }
    if (!formData.whyInterested.trim()) {
      setError('Please explain why you\'re interested');
      toast.error('Please explain why you\'re interested');
      return false;
    }
    if (formData.whyInterested.trim().length < 50) {
      setError('Please write at least 50 characters explaining your interest');
      toast.error('Please write at least 50 characters');
      return false;
    }
    if (formData.portfolioUrl && !isValidUrl(formData.portfolioUrl)) {
      setError('Please enter a valid URL');
      toast.error('Please enter a valid URL');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleProceedToTerms = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Store form data in sessionStorage
    sessionStorage.setItem('applicationFormData', JSON.stringify({
      opportunityId,
      ...formData
    }));

    // Redirect to terms page
    router.push(`/candidate/apply/${opportunityId}/terms`);
  };

  const getCompanyDisplayName = (industry: OpportunityDetails['industry'], isPremium: boolean) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !opportunity) {
    return null;
  }

  const user = session?.user;
  const isPremium = user?.isPremium || false;
  const companyName = getCompanyDisplayName(opportunity.industry, isPremium);
  const canApply = isPremium || opportunity.type !== 'FREELANCING';

  if (!canApply) {
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

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature Required</h2>
            <p className="text-gray-600 mb-6">
              This freelancing opportunity requires a Premium subscription to apply.
            </p>
            <Link href="/candidate/premium">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

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
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/candidate/browse" className="text-primary-600 hover:text-primary-700 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                1
              </div>
              <span className="ml-2 font-semibold text-primary-600">Application Form</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                2
              </div>
              <span className="ml-2 text-gray-600">Terms & Conditions</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                3
              </div>
              <span className="ml-2 text-gray-600">Submit</span>
            </div>
          </div>
        </div>

        {/* Opportunity Summary */}
        <Card className="mb-6 border-l-4 border-primary-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-manrope">
                  {opportunity.title}
                </h2>
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-medium">{companyName}</span>
                    {opportunity.industry.isVerified && (
                      <Check className="h-4 w-4 ml-1 text-green-500" />
                    )}
                    {!opportunity.industry.showCompanyName && !isPremium && (
                      <EyeOff className="h-4 w-4 ml-2 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="capitalize">{opportunity.type.toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{opportunity.workType}</span>
                  </div>
                  {opportunity.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{opportunity.duration} weeks</span>
                    </div>
                  )}
                  {opportunity.stipend && (
                    <div className="flex items-center text-green-600 font-medium">
                      <Wallet className="h-4 w-4 mr-1" />
                      <span>{opportunity.currency}{opportunity.stipend.toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
              Application Form
            </h1>
            <p className="text-gray-600 mb-8">
              Fill out the form below to apply for this opportunity. All fields marked with * are required.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleProceedToTerms} className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 mb-2">
                  Cover Letter *
                  <span className="text-gray-500 font-normal ml-2">(Minimum 100 characters)</span>
                </label>
                <textarea
                  id="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={8}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Explain why you're the perfect candidate for this role. Highlight your relevant experience, skills, and achievements..."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Tell us about your qualifications and what makes you a great fit
                  </p>
                  <p className={`text-xs ${formData.coverLetter.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.coverLetter.length}/100 characters
                  </p>
                </div>
              </div>

              {/* Why Interested */}
              <div>
                <label htmlFor="whyInterested" className="block text-sm font-semibold text-gray-900 mb-2">
                  Why are you interested in this opportunity? *
                  <span className="text-gray-500 font-normal ml-2">(Minimum 50 characters)</span>
                </label>
                <textarea
                  id="whyInterested"
                  value={formData.whyInterested}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="What motivates you to apply for this specific role? What do you hope to learn or achieve?"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Share your motivation and career goals
                  </p>
                  <p className={`text-xs ${formData.whyInterested.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.whyInterested.length}/50 characters
                  </p>
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-semibold text-gray-900 mb-2">
                  Portfolio/LinkedIn URL (Optional)
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  value={formData.portfolioUrl || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://your-portfolio.com or https://linkedin.com/in/yourprofile"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a link to your portfolio, GitHub, or LinkedIn profile
                </p>
              </div>

              {/* Required Skills Notice */}
              {opportunity.skills.some(s => s.isRequired) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Required Skills for this role:</h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.filter(s => s.isRequired).map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Make sure to mention your experience with these skills in your cover letter
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Link href="/candidate/browse" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1">
                  Review & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplyPage;