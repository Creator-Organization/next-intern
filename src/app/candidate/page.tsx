// src/app/candidate/page.tsx
// Candidate Dashboard - NextIntern 2.0 - Fixed Design & Performance

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  TrendingUp
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated') return;

      try {
        // Fetch opportunities
        const opportunitiesResponse = await fetch(`/api/opportunities?recommended=true&userType=CANDIDATE&isPremium=${session?.user?.isPremium || false}`);
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          setOpportunities(opportunitiesData.data || []);
        }

        // Only fetch stats if we have a candidate ID
        if (session?.user?.candidate?.id) {
          const statsResponse = await fetch(`/api/candidates/${session.user.candidate.id}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData.data);
          }

          const savedResponse = await fetch(`/api/candidates/${session.user.candidate.id}/saved`);
          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            const savedIds = new Set<string>(savedData.data?.map((item: { opportunityId: string }) => item.opportunityId) || []);
            setSavedIds(savedIds);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [status, session]);

  const getCompanyDisplayName = (industry: Opportunity['industry'], isPremium: boolean) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  const handleSaveOpportunity = async (opportunityId: string) => {
    // TODO: Implement save/unsave functionality
    setSavedIds(prev => {
      const newSet = new Set(prev);
      if (prev.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
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
      <Header user={user ? {
        id: user.id,
        email: user.email || '',
        userType: user.userType,
        candidate: user.name ? {
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ')[1] || ''
        } : undefined
      } : undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-manrope">Dashboard</CardTitle>
                {!isPremium && (
                  <Link href="/candidate/premium">
                    <Button size="sm" className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <div className="flex items-center space-x-3 text-primary-600 font-semibold bg-primary-50 p-3 rounded-lg border-l-4 border-primary-500">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </div>
                  <Link href="/candidate/browse" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Eye className="h-5 w-5" />
                    <span>Browse</span>
                  </Link>
                  <Link href="/candidate/applications" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <FileText className="h-5 w-5" />
                    <span>My Applications</span>
                  </Link>
                  <Link href="/candidate/saved" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Bookmark className="h-5 w-5" />
                    <span>Saved</span>
                  </Link>
                  <Link href="/candidate/profile" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {stats && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-manrope">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-semibold text-primary-600">{stats.totalApplications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingApplications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interviews</span>
                    <span className="font-semibold text-green-600">{stats.interviewsScheduled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Saved</span>
                    <span className="font-semibold text-primary-600">{stats.savedOpportunities}</span>
                  </div>
                  {!isPremium && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Premium Jobs</span>
                        <span className="font-semibold text-yellow-600">{stats.premiumOpportunities}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upgrade to apply</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Welcome Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
                      Recommended for You
                    </h1>
                    <p className="text-gray-600">
                      Discover opportunities that match your profile and interests.
                      {!isPremium && (
                        <span className="text-yellow-600 font-medium">
                          {" "}Upgrade to Premium for exclusive freelancing opportunities.
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
                      <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-manrope">Unlock Premium Features</h3>
                        <p className="text-gray-600 mt-1">
                          Access exclusive freelancing opportunities and see full company details for ₹99/month.
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
                  const companyName = getCompanyDisplayName(opportunity.industry, isPremium);
                  const canApply = isPremium || opportunity.type !== 'FREELANCING';
                  const isSaved = savedIds.has(opportunity.id);

                  return (
                    <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                {opportunity.title}
                              </h3>
                              {opportunity.isPremiumOnly && (
                                <Crown className="h-5 w-5 text-yellow-500" />
                              )}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                opportunity.type === 'INTERNSHIP' ? 'bg-blue-100 text-blue-700' :
                                opportunity.type === 'PROJECT' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {opportunity.type}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-600 mb-3">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{companyName}</span>
                              {opportunity.industry.isVerified && (
                                <Check className="h-4 w-4 ml-2 text-green-500" />
                              )}
                              {!opportunity.industry.showCompanyName && !isPremium && (
                                <EyeOff className="h-4 w-4 ml-2 text-gray-400" />
                              )}
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{opportunity.industry.industry}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveOpportunity(opportunity.id)}
                            >
                              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current text-primary-600' : ''}`} />
                            </Button>
                            <Link href={`/candidate/apply/${opportunity.id}`}>
                              <Button size="sm" disabled={!canApply}>
                                {canApply ? 'Apply Now' : 'Premium Only'}
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {opportunity.description}
                        </p>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{opportunity.workType}</span>
                          </div>
                          {opportunity.duration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{opportunity.duration} weeks</span>
                            </div>
                          )}
                          {opportunity.stipend && (
                            <div className="flex items-center text-green-600 font-medium">
                              <Wallet className="h-4 w-4 mr-2" />
                              <span>{opportunity.currency}{opportunity.stipend.toLocaleString()}/month</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {opportunity.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {opportunity.skills.slice(0, 5).map((skill, index) => (
                              <span 
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${
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
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                                +{opportunity.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Privacy Notice */}
                        {!isPremium && opportunity.type === 'FREELANCING' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center text-yellow-700">
                              <Crown className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                This is a premium freelancing opportunity. Upgrade to apply.
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Application Count */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center text-sm text-gray-500">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>{opportunity.applicationCount} applications</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No opportunities found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We&#39;re working on finding the perfect matches for your profile.
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