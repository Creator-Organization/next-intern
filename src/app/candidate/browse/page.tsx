'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast'; // ✅ Add toast import
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Wallet,
  Building,
  Bookmark,
  Eye,
  Crown,
  EyeOff,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

function BrowseContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get('type') || 'all'
  );
  const [workTypeFilter, setWorkTypeFilter] = useState<string>(
    searchParams.get('workType') || 'all'
  );

  const hasFetchedInitial = useRef(false);

  // Add saved opportunities state
  const [savedOpportunities, setSavedOpportunities] = useState<Set<string>>(
    new Set()
  );

  // Load saved opportunities on mount
  useEffect(() => {
    const loadSavedOpportunities = async () => {
      if (!session?.user?.candidate?.id) return;

      try {
        const response = await fetch(
          `/api/candidates/${session.user.candidate.id}/saved`
        );

        if (response.ok) {
          const data = await response.json();
          const savedIds = new Set<string>(
            data.data
              ?.map(
                (item: {
                  opportunityId?: string;
                  opportunity?: { id: string };
                }) => item.opportunityId || item.opportunity?.id
              )
              .filter(Boolean) || []
          );
          setSavedOpportunities(savedIds);
          console.log('✅ Loaded saved opportunities:', savedIds.size);
        }
      } catch (error) {
        console.error('Failed to load saved opportunities:', error);
      }
    };

    if (status === 'authenticated' && session?.user?.candidate?.id) {
      loadSavedOpportunities();
    }
  }, [session?.user?.candidate?.id, status]); // Only run when these change

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  // Initial load only - fetch once when page first loads
  useEffect(() => {
    const fetchInitialData = async () => {
      if (status !== 'authenticated' || hasFetchedInitial.current) {
        return;
      }

      hasFetchedInitial.current = true;
      setIsInitialLoad(true);

      try {
        const params = new URLSearchParams({
          userType: 'CANDIDATE',
          isPremium: session?.user?.isPremium ? 'true' : 'false',
        });

        // Only add filters from URL on initial load
        const urlSearch = searchParams.get('q');
        const urlType = searchParams.get('type');
        const urlWorkType = searchParams.get('workType');

        if (urlSearch) params.append('search', urlSearch);
        if (urlType && urlType !== 'all') params.append('type', urlType);
        if (urlWorkType && urlWorkType !== 'all')
          params.append('workType', urlWorkType);

        console.log('🔄 Initial data load...');
        const response = await fetch(`/api/opportunities?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setOpportunities(data.data || []);
          console.log('✅ Initial data loaded:', data.data?.length || 0);
        } else {
          toast.error('Failed to load opportunities');
        }
      } catch (error) {
        console.error('❌ Failed to fetch opportunities:', error);
        toast.error('Failed to load opportunities');
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchInitialData();
  }, [status, session, searchParams]);

  // Manual search function - only called when Search button is clicked
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        userType: 'CANDIDATE',
        isPremium: session?.user?.isPremium ? 'true' : 'false',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (workTypeFilter !== 'all') params.append('workType', workTypeFilter);

      console.log('🔍 Manual search triggered...');
      const response = await fetch(`/api/opportunities?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.data || []);
        console.log('✅ Search results loaded:', data.data?.length || 0);
        
        // ✅ Show success toast with result count
        toast.success(`Found ${data.data?.length || 0} opportunities`);
      } else {
        toast.error('Search failed. Please try again.');
      }

      // Update URL without page refresh
      const urlParams = new URLSearchParams();
      if (searchQuery) urlParams.set('q', searchQuery);
      if (typeFilter !== 'all') urlParams.set('type', typeFilter);
      if (workTypeFilter !== 'all') urlParams.set('workType', workTypeFilter);

      const newUrl = urlParams.toString()
        ? `/candidate/browse?${urlParams.toString()}`
        : '/candidate/browse';

      router.push(newUrl, { scroll: false });
    } catch (error) {
      console.error('❌ Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyDisplayName = (
    industry: Opportunity['industry'],
    isPremium: boolean
  ) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  // ✅ Fixed save/unsave with toast notifications
  const handleSaveOpportunity = async (opportunityId: string) => {
    if (!session?.user?.candidate?.id) {
      toast.error('Please sign in to save opportunities');
      return;
    }

    const candidateId = session.user.candidate.id;
    const isSaved = savedOpportunities.has(opportunityId);

    // Optimistic update
    setSavedOpportunities((prev) => {
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
          setSavedOpportunities((prev) => new Set(prev).add(opportunityId));
          toast.error('Failed to remove opportunity');
        }
      } else {
        // Save
        const response = await fetch(`/api/candidates/${candidateId}/saved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunityId }),
        });

        if (response.ok) {
          toast.success('Added to saved opportunities');
          console.log('✅ Opportunity saved');
        } else {
          // Revert on error
          setSavedOpportunities((prev) => {
            const newSet = new Set(prev);
            newSet.delete(opportunityId);
            return newSet;
          });
          toast.error('Failed to save opportunity');
        }
      }
    } catch (error) {
      console.error('Save/unsave error:', error);
      // Revert state on error
      setSavedOpportunities((prev) => {
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

  const handleClearFilters = async () => {
    setSearchQuery('');
    setTypeFilter('all');
    setWorkTypeFilter('all');
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        userType: 'CANDIDATE',
        isPremium: session?.user?.isPremium ? 'true' : 'false',
      });

      console.log('🔄 Clearing filters...');
      const response = await fetch(`/api/opportunities?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.data || []);
        console.log('✅ All opportunities loaded:', data.data?.length || 0);
        
        // ✅ Show success toast
        toast.success('Filters cleared');
      } else {
        toast.error('Failed to clear filters');
      }

      router.push('/candidate/browse');
    } catch (error) {
      console.error('❌ Clear filters failed:', error);
      toast.error('Failed to clear filters');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isInitialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-manrope mb-4 text-3xl font-bold text-gray-900">
            Browse Opportunities
          </h1>
          <p className="text-gray-600">
            Discover internships, projects, and freelancing opportunities that
            match your skills and interests.
          </p>
        </div>

        {/* Search and Filter Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search opportunities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              <div className="flex gap-4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  disabled={isLoading}
                  className="focus:ring-primary-500 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none disabled:opacity-50"
                >
                  <option value="all">All Types</option>
                  <option value="INTERNSHIP">Internships</option>
                  <option value="PROJECT">Projects</option>
                  {isPremium && (
                    <option value="FREELANCING">Freelancing</option>
                  )}
                </select>

                <select
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                  disabled={isLoading}
                  className="focus:ring-primary-500 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:outline-none disabled:opacity-50"
                >
                  <option value="all">All Work Types</option>
                  <option value="REMOTE">Remote</option>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                </select>

                {(searchQuery ||
                  typeFilter !== 'all' ||
                  workTypeFilter !== 'all') && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClearFilters}
                    disabled={isLoading}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="text-primary-600 h-8 w-8 animate-spin" />
            <span className="ml-3 text-gray-600">Loading results...</span>
          </div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {opportunities.length} opportunities found
              </h2>
            </div>

            <div className="grid gap-6">
              {opportunities.map((opportunity) => {
                const companyName = getCompanyDisplayName(
                  opportunity.industry,
                  isPremium
                );
                const canApply =
                  isPremium || opportunity.type !== 'FREELANCING';
                const isSaved = savedOpportunities.has(opportunity.id);

                return (
                  <Card
                    key={opportunity.id}
                    className="transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="mb-2 flex items-center gap-3">
                            <Link
                              href={`/candidate/opportunities/${opportunity.id}`}
                            >
                              <h3 className="font-manrope hover:text-primary-600 cursor-pointer text-xl font-bold text-gray-900 transition-colors">
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
                            title={
                              isSaved
                                ? 'Remove from saved'
                                : 'Save opportunity'
                            }
                          >
                            <Bookmark
                              className={`h-4 w-4 transition-all ${
                                isSaved
                                  ? 'text-primary-600 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                          <Link
                            href={`/candidate/opportunities/${opportunity.id}`}
                          >
                            <Button variant="secondary" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/candidate/apply/${opportunity.id}`}>
                            <Button size="sm" disabled={!canApply}>
                              {canApply ? 'Apply' : 'Premium'}
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <p className="mb-4 line-clamp-2 text-gray-700">
                        {opportunity.description}
                      </p>

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
                        <div className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>
                            {opportunity.applicationCount} applications
                          </span>
                        </div>
                      </div>

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
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No opportunities found
              </h3>
              <p className="mb-6 text-gray-600">
                Try adjusting your search criteria or browse all opportunities.
              </p>
              <Button onClick={handleClearFilters} disabled={isLoading}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}