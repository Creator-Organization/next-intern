// src/app/candidate/page.tsx
// Candidate Dashboard - NextIntern 2.0 - Fixed Design & Performance

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // ✅ Add toast import
import {
  Briefcase,
  FileText,
  User,
  Bookmark,
  Clock,
  Wallet,
  MapPin,
  Building,
  Crown,
  EyeOff,
  Check,
  Eye,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  stipend?: number;
  currency: string;
  duration?: number;
  applicationCount: number;
  viewCount: number;
  createdAt: Date;
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
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedOpportunities: number;
  profileViews: number;
  premiumOpportunities: number;
}

const CandidateDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  
  // Add ref to track if data has been fetched
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Only fetch once when component mounts and user is authenticated
    if (status !== 'authenticated' || !session?.user?.candidate?.id) {
      setIsLoading(false);
      return;
    }

    // CRITICAL: Prevent duplicate fetches
    if (hasFetchedData.current) {
      console.log('⏭️ Skipping fetch - data already loaded');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Mark as fetching to prevent duplicates
        hasFetchedData.current = true;
        console.log('🔄 Fetching dashboard data...');

        // Fetch all data in parallel for better performance
        const [opportunitiesResponse, statsResponse, savedResponse] =
          await Promise.all([
            fetch(
              `/api/opportunities?recommended=true&userType=CANDIDATE&isPremium=${session?.user?.isPremium || false}`
            ),
            fetch(`/api/candidates/${session.user.candidate?.id}/stats`),
            fetch(`/api/candidates/${session.user.candidate?.id}/saved`),
          ]);

        // Process opportunities
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          setOpportunities(opportunitiesData.data || []);
          console.log('✅ Opportunities loaded:', opportunitiesData.data?.length || 0);
        }

        // Process stats
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
          console.log('✅ Stats loaded');
        }

        // Process saved
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedIds = new Set<string>(
            savedData.data?.map(
              (item: { opportunityId?: string; opportunity?: { id: string } }) => 
                item.opportunityId || item.opportunity?.id
            ).filter(Boolean) || []
          );
          setSavedIds(savedIds);
          console.log('✅ Saved opportunities loaded:', savedIds.size);
        }

        console.log('✅ Dashboard data fetch complete');
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Reset flag on error so user can retry
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const getCompanyDisplayName = (
    industry: Opportunity['industry'],
    isPremium: boolean
  ) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  // ✅ Fixed save/unsave functionality with toast notifications
  const handleSaveOpportunity = async (opportunityId: string) => {
    if (!session?.user?.candidate?.id) {
      toast.error('Please sign in to save opportunities');
      return;
    }

    const candidateId = session.user.candidate.id;
    const isSaved = savedIds.has(opportunityId);

    // Optimistically update UI
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `/api/candidates/${candidateId}/saved?opportunityId=${opportunityId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          toast.success('Removed from saved opportunities');
          console.log('✅ Opportunity unsaved');
        } else {
          // Revert on error
          setSavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(opportunityId);
            return newSet;
          });
          toast.error('Failed to remove opportunity');
        }
      } else {
        // Save
        const response = await fetch(
          `/api/candidates/${candidateId}/saved`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ opportunityId }),
          }
        );

        if (response.ok) {
          toast.success('Added to saved opportunities');
          console.log('✅ Opportunity saved');
          
          // Update stats
          if (stats) {
            setStats({
              ...stats,
              savedOpportunities: stats.savedOpportunities + 1,
            });
          }
        } else {
          // Revert on error
          setSavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(opportunityId);
            return newSet;
          });
          toast.error('Failed to save opportunity');
        }
      }
    } catch (error) {
      console.error('Save/unsave error:', error);
      // Revert on error
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.add(opportunityId);
        } else {
          newSet.delete(opportunityId);
        }
        return newSet;
      });
      toast.error('An error occurred');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
                  Dashboard
                </CardTitle>
                {!isPremium && (
                  <Link href="/candidate/premium">
                    <Button
                      size="sm"
                      className="mt-2 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <div className="text-primary-600 bg-primary-50 border-primary-500 flex items-center space-x-3 rounded-lg border-l-4 p-3 font-semibold">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                  <Link
                    href="/candidate/browse"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Browse</span>
                  </Link>
                  <Link
                    href="/candidate/applications"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span>My Applications</span>
                  </Link>
                  <Link
                    href="/candidate/saved"
                    className="hover:text-primary-600 hover:bg-primary-50 flex items-center space-x-3 rounded-lg p-3 text-gray-600 transition-colors"
                  >
                    <Bookmark className="h-5 w-5" />
                    <span>Saved</span>
                  </Link>
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
            {/* Welcome Section */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="font-manrope mb-2 text-3xl font-bold text-gray-900">
                      Recommended for You
                    </h1>
                    <p className="text-gray-600">
                      Discover opportunities that match your profile and
                      interests.
                      {!isPremium && (
                        <span className="font-medium text-yellow-600">
                          {' '}
                          Upgrade to Premium for exclusive freelancing
                          opportunities.
                        </span>
                      )}
                    </p>
                  </div>
                  <Link href="/candidate/browse">
                    <Button>Browse All</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Premium Notice */}
            {!isPremium && (
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crown className="mr-3 h-8 w-8 text-yellow-500" />
                      <div>
                        <h3 className="font-manrope text-lg font-semibold text-gray-900">
                          Unlock Premium Features
                        </h3>
                        <p className="mt-1 text-gray-600">
                          Access exclusive freelancing opportunities and see
                          full company details for ₹99/month.
                        </p>
                      </div>
                    </div>
                    <Link href="/candidate/premium">
                      <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunity Listings */}
            <div className="space-y-6">
              {opportunities.length > 0 ? (
                opportunities.map((opportunity) => {
                  const companyName = getCompanyDisplayName(
                    opportunity.industry,
                    isPremium
                  );
                  const canApply =
                    isPremium || opportunity.type !== 'FREELANCING';
                  const isSaved = savedIds.has(opportunity.id);

                  return (
                    <Card
                      key={opportunity.id}
                      className="transition-shadow hover:shadow-lg"
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="mb-2 flex items-center gap-3">
                              <Link href={`/candidate/opportunities/${opportunity.id}`}>
                                <h3 className="font-manrope text-xl font-bold text-gray-900 hover:text-primary-600 cursor-pointer">
                                  {opportunity.title}
                                </h3>
                              </Link>
                              {opportunity.isPremiumOnly && (
                                <Crown className="h-5 w-5 text-yellow-500" />
                              )}
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  opportunity.type === 'INTERNSHIP'
                                    ? 'bg-blue-100 text-blue-700'
                                    : opportunity.type === 'PROJECT'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {opportunity.type}
                              </span>
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
                              onClick={() =>
                                handleSaveOpportunity(opportunity.id)
                              }
                              className="hover:bg-primary-50"
                            >
                              <Bookmark
                                className={`h-4 w-4 ${isSaved ? 'text-primary-600 fill-current' : 'text-gray-400'}`}
                              />
                            </Button>
                            <Link href={`/candidate/opportunities/${opportunity.id}`}>
                              <Button size="sm" variant="secondary">
                                View Details
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
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                              {new Date(
                                opportunity.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        {opportunity.skills.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
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

                        {/* Privacy Notice */}
                        {!isPremium && opportunity.type === 'FREELANCING' && (
                          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <div className="flex items-center text-yellow-700">
                              <Crown className="mr-2 h-4 w-4" />
                              <span className="text-sm">
                                This is a premium freelancing opportunity.
                                Upgrade to apply.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Application Count */}
                        <div className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            <span>
                              {opportunity.applicationCount} applications
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      No opportunities found
                    </h3>
                    <p className="mb-6 text-gray-600">
                      We&#39;re working on finding the perfect matches for your
                      profile.
                    </p>
                    <Link href="/candidate/browse">
                      <Button>Browse All Opportunities</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;