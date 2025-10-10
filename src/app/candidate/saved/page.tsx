// src/app/candidate/saved/page.tsx
// Saved Opportunities Page - NextIntern 2.0

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // ✅ Add toast import
import {
  Bookmark,
  BookmarkX,
  Briefcase,
  User,
  FileText,
  Clock,
  Wallet,
  Building,
  MapPin,
  Crown,
  EyeOff,
  Check,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface SavedOpportunity {
  id: string;
  savedAt: Date;
  opportunity: {
    id: string;
    title: string;
    description: string;
    type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
    workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    stipend?: number;
    currency: string;
    duration?: number;
    applicationCount: number;
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
      color?: string;
    };
    skills: Array<{
      skillName: string;
      isRequired: boolean;
    }>;
  };
}

const SavedPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedOpportunities, setSavedOpportunities] = useState<
    SavedOpportunity[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchSavedOpportunities = async () => {
      if (status !== 'authenticated' || !session?.user?.candidate?.id) return;

      try {
        const candidateId = session.user.candidate.id;
        const response = await fetch(`/api/candidates/${candidateId}/saved`);
        if (response.ok) {
          const data = await response.json();
          setSavedOpportunities(data.data || []);
        } else {
          // Fallback empty data
          setSavedOpportunities([]);
        }
      } catch (error) {
        console.error('Failed to fetch saved opportunities:', error);
        setSavedOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedOpportunities();
  }, [status]);

  const handleUnsave = async (opportunityId: string) => {
    if (!session?.user?.candidate?.id) {
      console.error('No candidate ID found');
      return;
    }

    try {
      const candidateId = session.user.candidate.id;
      const response = await fetch(
        `/api/candidates/${candidateId}/saved?opportunityId=${opportunityId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        // Remove from local state immediately for better UX
        toast.success('Removed From Saved Succesfully');
          console.log('✅ Opportunity Unsaved');
        setSavedOpportunities((prev) =>
          prev.filter((saved) => saved.opportunity.id !== opportunityId)
        );
        console.log('✅ Opportunity unsaved successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to unsave:', errorData);
        alert('Failed to remove opportunity from saved list');
      }
    } catch (error) {
      console.error('Error unsaving opportunity:', error);
      alert('An error occurred while removing the opportunity');
    }
  };

  const getCompanyDisplayName = (
    industry: SavedOpportunity['opportunity']['industry'],
    isPremium: boolean
  ) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading saved opportunities...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = session?.user;
  const isPremium = user?.isPremium || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        user={
          user
            ? {
                id: user.id,
                email: user.email || '',
                userType: user.userType,
                candidate: user.name
                  ? {
                      firstName: user.name.split(' ')[0] || '',
                      lastName: user.name.split(' ')[1] || '',
                    }
                  : undefined,
              }
            : undefined
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-manrope text-lg">
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Link
                    href="/candidate"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/candidate/applications"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Applications</span>
                  </Link>
                  <div className="text-primary-600 bg-primary-50 border-primary-500 flex items-center space-x-3 rounded-lg border-l-4 p-3 font-semibold">
                    <Bookmark className="h-5 w-5" />
                    <span>Saved</span>
                  </div>
                  <Link
                    href="/candidate/profile"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-6 lg:col-span-3">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-manrope mb-2 text-3xl font-bold text-gray-900">
                      Saved Opportunities
                    </h1>
                    <p className="text-gray-600">
                      Keep track of opportunities you&#39;re interested in
                      applying to later.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-600 text-2xl font-bold">
                      {savedOpportunities.length}
                    </p>
                    <p className="text-sm text-gray-500">Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Opportunities */}
            {savedOpportunities.length > 0 ? (
              <div className="space-y-4">
                {savedOpportunities.map((saved) => {
                  const opportunity = saved.opportunity;
                  const companyName = getCompanyDisplayName(
                    opportunity.industry,
                    isPremium
                  );
                  const canApply =
                    isPremium || opportunity.type !== 'FREELANCING';

                  return (
                    <Card
                      key={saved.id}
                      className="transition-shadow hover:shadow-lg"
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-manrope text-xl font-bold text-gray-900">
                                {opportunity.title}
                              </h3>
                              {opportunity.isPremiumOnly && (
                                <Crown className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>

                            <div className="mb-3 flex items-center text-gray-600">
                              <Building className="mr-2 h-4 w-4" />
                              <span className="font-medium">{companyName}</span>
                              {opportunity.industry.isVerified && (
                                <Check className="ml-2 h-4 w-4 text-green-500" />
                              )}
                              {!opportunity.industry.showCompanyName &&
                                !isPremium && (
                                  <EyeOff className="ml-2 h-4 w-4 text-gray-400" />
                                )}
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{opportunity.industry.industry}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsave(opportunity.id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Link href={`/candidate/apply/${opportunity.id}`}>
                              <Button size="sm" disabled={!canApply}>
                                {canApply ? 'Apply Now' : 'Premium Only'}
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mb-4 line-clamp-2 text-gray-700">
                          {opportunity.description}
                        </p>

                        {/* Details */}
                        <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            <span>{opportunity.workType}</span>
                          </div>
                          {opportunity.duration && (
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>{opportunity.duration} weeks</span>
                            </div>
                          )}
                          {opportunity.stipend && (
                            <div className="flex items-center font-medium text-green-600">
                              <Wallet className="mr-2 h-4 w-4" />
                              <span>
                                {opportunity.currency}
                                {opportunity.stipend.toLocaleString()}/month
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-500">
                            <Bookmark className="mr-2 h-4 w-4" />
                            <span>Saved {getTimeSince(saved.savedAt)}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {opportunity.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills
                              .slice(0, 5)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className={`rounded-full px-2 py-1 text-xs ${
                                    skill.isRequired
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {skill.skillName}
                                  {skill.isRequired && ' *'}
                                </span>
                              ))}
                            {opportunity.skills.length > 5 && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                +{opportunity.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookmarkX className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No saved opportunities yet
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Start exploring and save opportunities that interest you to
                    apply later.
                  </p>
                  <Link href="/candidate/browse">
                    <Button>Browse Opportunities</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;
