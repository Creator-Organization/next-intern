"use client";

import { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// --- TYPE DEFINITIONS ---
interface OpportunityDetails {
  id: string;
  title: string;
  description: string;
  opportunityType: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  stipend?: number;
  currency: string;
  duration?: number;
  requirements: string;
  minQualification?: string;
  preferredSkills?: string;
  applicationDeadline?: Date;
  startDate?: Date;
  city?: string;
  state?: string;
  country?: string;
  industry: {
    companyName: string;
    industry: string;
    isVerified: boolean;
  };
  category: {
    name: string;
  };
}

interface ApplicationFormData {
  coverLetter: string;
  portfolioUrl?: string;
  availableFrom?: Date;
  expectedStipend?: number;
  whyInterested: string;
  relevantExperience: string;
  additionalInfo?: string;
}

interface ApplicationPageProps {
  params: { id: string };
}

const ApplicationPage: FC<ApplicationPageProps> = ({ params }) => {
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

  // Fetch opportunity details
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`/api/opportunities/${params.id}`);
        if (!response.ok) {
          throw new Error('Opportunity not found');
        }
        const data = await response.json();
        setOpportunity(data);
      } catch (err) {
        setError('Failed to load opportunity details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOpportunity();
    }
  }, [params.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/candidate/apply/${params.id}`);
    }
  }, [status, router, params.id]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setIsSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
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

  if (error && !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/candidate/browse">
            <Button>Browse Other Opportunities</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
              NextIntern
            </Link>
            <Link href="/candidate/browse" className="text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Opportunities
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Opportunity Details */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 font-manrope">
                    {opportunity.title}
                  </h1>
                  
                  {/* Company Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Building className="h-5 w-5 mr-2" />
                      <span className="font-medium">{opportunity.industry.companyName}</span>
                      {opportunity.industry.isVerified && (
                        <Check className="h-4 w-4 ml-1 text-green-500" />
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
                      <span className="capitalize">{opportunity.opportunityType.toLowerCase()}</span>
                    </div>
                  </div>

                  {opportunity.city && (
                    <div className="flex items-center text-gray-600 mb-6">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{opportunity.city}, {opportunity.state}, {opportunity.country}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                      About this {opportunity.opportunityType.toLowerCase()}
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

                  {/* Preferred Skills */}
                  {opportunity.preferredSkills && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
                        Preferred Skills
                      </h2>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {opportunity.preferredSkills}
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
                      Apply for this {opportunity.opportunityType.toLowerCase()}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Ready to take the next step? Submit your application to be considered for this role.
                    </p>
                    {session?.user?.userType === 'CANDIDATE' ? (
                      <Button
                        onClick={() => setShowForm(true)}
                        className="w-full"
                        size="lg"
                      >
                        Apply Now
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">
                          You need to be signed in as a candidate to apply.
                        </p>
                        <Link href={`/auth/signin?callbackUrl=/candidate/apply/${params.id}`}>
                          <Button className="w-full">
                            Sign In to Apply
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

export default ApplicationPage;