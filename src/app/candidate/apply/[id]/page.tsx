// src/app/candidate/apply/[id]/page.tsx
// Apply Page - NextIntern v2 - Fixed for 28-table schema

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Clock, 
  Wallet, 
  Check, 
  ArrowLeft, 
  X, 
  MapPin,
  Building,
  Calendar,
  Users,
  Crown,
  EyeOff
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
  minQualification?: string;
  preferredSkills?: string;
  applicationDeadline?: Date;
  startDate?: Date;
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
    id: string;
    name: string;
    slug: string;
  };
  skills: Array<{
    skillName: string;
    isRequired: boolean;
  }>;
}

interface ApplicationFormData {
  coverLetter: string;
  portfolioUrl?: string;
  availableFrom?: string;
  expectedStipend?: number;
  whyInterested: string;
  relevantExperience: string;
  additionalInfo?: string;
}

interface ApplyPageProps {
  params: { id: string };
}

const ApplyPage = ({ params }: ApplyPageProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: '',
    portfolioUrl: '',
    whyInterested: '',
    relevantExperience: '',
    additionalInfo: ''
  });

  const getFallbackOpportunity = (): OpportunityDetails => ({
    id: params.id,
    title: 'Frontend Developer Intern',
    description: 'Join our dynamic team to build cutting-edge web applications using React, TypeScript, and modern development practices. You will work closely with experienced developers and contribute to real-world projects.',
    type: 'INTERNSHIP',
    workType: 'REMOTE',
    stipend: 25000,
    currency: 'INR',
    duration: 12,
    requirements: 'Bachelor\'s degree in Computer Science or related field. Basic knowledge of React and JavaScript. Strong problem-solving skills.',
    preferredSkills: 'React, TypeScript, Node.js, Git, REST APIs',
    applicationDeadline: new Date('2025-02-15'),
    startDate: new Date('2025-03-01'),
    isPremiumOnly: false,
    showCompanyName: true,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra', 
      country: 'India'
    },
    industry: {
      id: 'ind1',
      companyName: 'TechCorp Solutions',
      industry: 'Technology',
      isVerified: true,
      showCompanyName: true,
      anonymousId: 'comp_123'
    },
    category: {
      id: 'cat1',
      name: 'Software Development',
      slug: 'software-development'
    },
    skills: [
      { skillName: 'React', isRequired: true },
      { skillName: 'TypeScript', isRequired: true },
      { skillName: 'Node.js', isRequired: false }
    ]
  });

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`/api/opportunities/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOpportunity(data.data || getFallbackOpportunity());
        } else {
          setOpportunity(getFallbackOpportunity());
        }
      } catch (error) {
        console.error('Failed to fetch opportunity:', error);
        setOpportunity(getFallbackOpportunity());
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOpportunity();
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/candidate/apply/${params.id}`);
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router, params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/opportunities/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setShowForm(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading opportunity details...</p>
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

  return (
    <>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/candidate/browse" className="text-primary-600 hover:text-primary-700 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Opportunities
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Opportunity Details */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 font-manrope">
                      {opportunity.title}
                    </h1>
                    {opportunity.isPremiumOnly && (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  
                  {/* Company Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Building className="h-5 w-5 mr-2" />
                      <span className="font-medium">{companyName}</span>
                      {opportunity.industry.isVerified && (
                        <Check className="h-4 w-4 ml-1 text-green-500" />
                      )}
                      {!opportunity.industry.showCompanyName && !isPremium && (
                        <EyeOff className="h-4 w-4 ml-2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span>{opportunity.category.name}</span>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{opportunity.duration ? `${opportunity.duration} weeks` : 'Flexible'}</span>
                    </div>
                    {opportunity.stipend && (
                      <div className="flex items-center text-gray-600">
                        <Wallet className="h-4 w-4 mr-2" />
                        <span>{opportunity.currency}{opportunity.stipend.toLocaleString()}/month</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{opportunity.workType}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="capitalize">{opportunity.type.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{opportunity.location.city}, {opportunity.location.state}, {opportunity.location.country}</span>
                  </div>
                </div>

                {/* Privacy Notice */}
                {!isPremium && (opportunity.type === 'FREELANCING' || !opportunity.industry.showCompanyName) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Crown className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">Premium Feature</h4>
                        <p className="text-sm text-yellow-700">
                          {opportunity.type === 'FREELANCING' 
                            ? 'This is a premium freelancing opportunity. Upgrade to apply.'
                            : 'Upgrade to see full company details and contact information.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                      About this {opportunity.type.toLowerCase()}
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {opportunity.description}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                      Requirements
                    </h2>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {opportunity.requirements}
                    </div>
                  </div>

                  {/* Skills */}
                  {opportunity.skills.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                        Required Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              skill.isRequired 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {skill.skillName}
                            {skill.isRequired && ' *'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {opportunity.applicationDeadline && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Application Deadline</h3>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(opportunity.applicationDeadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    {opportunity.startDate && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(opportunity.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Application CTA */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                {isSubmitted ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-manrope">
                      Application Submitted!
                    </h2>
                    <p className="text-gray-600 mb-6">
                      We have received your application. The company will review it and get back to you soon.
                    </p>
                    <Link href="/candidate/applications">
                      <Button className="w-full">
                        View My Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 font-manrope">
                      Apply for this {opportunity.type.toLowerCase()}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Ready to take the next step? Submit your application to be considered for this role.
                    </p>
                    
                    {canApply ? (
                      <Button
                        onClick={() => setShowForm(true)}
                        className="w-full"
                        size="lg"
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-yellow-700 text-sm bg-yellow-50 p-3 rounded-lg">
                          This freelancing opportunity requires a Premium subscription.
                        </p>
                        <Link href="/candidate/premium">
                          <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Apply
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                  Submit Application
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    id="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Tell us why you're interested in this opportunity and what makes you a great fit..."
                  />
                </div>

                <div>
                  <label htmlFor="relevantExperience" className="block text-sm font-semibold text-gray-900 mb-2">
                    Relevant Experience *
                  </label>
                  <textarea
                    id="relevantExperience"
                    value={formData.relevantExperience}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Describe your relevant experience, projects, or skills..."
                  />
                </div>

                <div>
                  <label htmlFor="whyInterested" className="block text-sm font-semibold text-gray-900 mb-2">
                    Why are you interested in this role? *
                  </label>
                  <textarea
                    id="whyInterested"
                    value={formData.whyInterested}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="What motivates you to apply for this specific opportunity?"
                  />
                </div>

                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-semibold text-gray-900 mb-2">
                    Portfolio URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    value={formData.portfolioUrl || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="https://your-portfolio.com"
                  />
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-semibold text-gray-900 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={formData.additionalInfo || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyPage;