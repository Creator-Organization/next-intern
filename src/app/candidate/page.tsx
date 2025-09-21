// src/app/candidate/page.tsx
// Candidate Dashboard - NextIntern v2 - Fixed for 28-table schema

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Briefcase, 
  FileText, 
  User, 
  Bookmark, 
  Clock, 
  Wallet, 
  MapPin,
  Building,
  Filter,
  TrendingUp,
  Calendar,
  Bell,
  Eye,
  EyeOff,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

// --- TYPE DEFINITIONS (Updated for 28-table schema) ---
interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING'; // Updated field name
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  stipend?: number;
  currency: string;
  duration?: number;
  locationId: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  applicationCount: number;
  viewCount: number;
  createdAt: Date;
  industry: { // Updated to match industries table
    id: string;
    companyName: string;
    industry: string;
    isVerified: boolean;
    showCompanyName: boolean; // Privacy control
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
  isPremiumOnly: boolean; // Privacy control
  showCompanyName: boolean; // Privacy control
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedOpportunities: number;
  profileViews: number;
  premiumOpportunities: number; // New field
}

interface SessionUser {
  id: string;
  email: string;
  userType: 'CANDIDATE' | 'INDUSTRY' | 'INSTITUTE' | 'ADMIN';
  isPremium: boolean; // Add premium status
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    showFullName: boolean; // Privacy control
  };
}

const CandidateDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  // Redirect if not authenticated or not a candidate
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch dashboard data with fallback
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated') return;

      try {
        // Fetch recommended opportunities with privacy controls
        const opportunitiesResponse = await fetch('/api/candidate/opportunities/recommended');
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          setOpportunities(opportunitiesData.data || []);
        } else {
          // Fallback data for development
          setOpportunities(getFallbackOpportunities());
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/candidate/dashboard-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        } else {
          // Fallback stats
          setStats({
            totalApplications: 12,
            pendingApplications: 5,
            interviewsScheduled: 2,
            savedOpportunities: 8,
            profileViews: 24,
            premiumOpportunities: 15
          });
        }

        // Fetch saved opportunities
        const savedResponse = await fetch('/api/candidate/saved-opportunities');
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedIds = new Set<string>(savedData.data.map((item: { opportunityId: string }) => item.opportunityId));
          setBookmarkedIds(savedIds);
        } else {
          // Fallback saved IDs
          setBookmarkedIds(new Set(['1', '3']));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use fallback data
        setOpportunities(getFallbackOpportunities());
        setStats({
          totalApplications: 12,
          pendingApplications: 5,
          interviewsScheduled: 2,
          savedOpportunities: 8,
          profileViews: 24,
          premiumOpportunities: 15
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [status]);

  // Fallback data for development
  const getFallbackOpportunities = (): Opportunity[] => [
    {
      id: '1',
      title: 'Frontend Developer Intern',
      description: 'Join our dynamic team to build cutting-edge web applications using React, TypeScript, and modern development practices.',
      type: 'INTERNSHIP',
      workType: 'REMOTE',
      stipend: 25000,
      currency: 'INR',
      duration: 12,
      locationId: 'loc1',
      location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      applicationCount: 45,
      viewCount: 234,
      createdAt: new Date('2025-01-15'),
      industry: {
        id: 'ind1',
        companyName: 'TechCorp Solutions',
        industry: 'Technology',
        isVerified: true,
        showCompanyName: true,
        anonymousId: 'comp_123'
      },
      category: { id: 'cat1', name: 'Software Development', slug: 'software-development', color: '#3B82F6' },
      skills: [
        { skillName: 'React', isRequired: true },
        { skillName: 'TypeScript', isRequired: true },
        { skillName: 'Node.js', isRequired: false }
      ],
      isPremiumOnly: false,
      showCompanyName: true
    },
    {
      id: '2',
      title: 'Data Science Project',
      description: 'Work on machine learning models for predictive analytics in the healthcare domain.',
      type: 'PROJECT',
      workType: 'HYBRID',
      stipend: 30000,
      currency: 'INR',
      duration: 8,
      locationId: 'loc2',
      location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
      applicationCount: 28,
      viewCount: 156,
      createdAt: new Date('2025-01-12'),
      industry: {
        id: 'ind2',
        companyName: 'Company #456', // Anonymous display for free users
        industry: 'Healthcare',
        isVerified: true,
        showCompanyName: false,
        anonymousId: 'comp_456'
      },
      category: { id: 'cat2', name: 'Data Science', slug: 'data-science', color: '#10B981' },
      skills: [
        { skillName: 'Python', isRequired: true },
        { skillName: 'Machine Learning', isRequired: true },
        { skillName: 'SQL', isRequired: false }
      ],
      isPremiumOnly: false,
      showCompanyName: false
    },
    {
      id: '3',
      title: 'Premium Freelance Project',
      description: 'Build a mobile application for our enterprise clients. Premium feature with direct client contact.',
      type: 'FREELANCING',
      workType: 'REMOTE',
      stipend: 50000,
      currency: 'INR',
      duration: 6,
      locationId: 'loc3',
      location: { city: 'Delhi', state: 'Delhi', country: 'India' },
      applicationCount: 12,
      viewCount: 89,
      createdAt: new Date('2025-01-10'),
      industry: {
        id: 'ind3',
        companyName: 'Premium Corp',
        industry: 'Technology',
        isVerified: true,
        showCompanyName: true,
        anonymousId: 'comp_789'
      },
      category: { id: 'cat3', name: 'Mobile Development', slug: 'mobile-development', color: '#8B5CF6' },
      skills: [
        { skillName: 'React Native', isRequired: true },
        { skillName: 'JavaScript', isRequired: true }
      ],
      isPremiumOnly: true,
      showCompanyName: true
    }
  ];

  // Filter opportunities based on search and user access
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchTerm = searchFilter.toLowerCase();
    const matchesSearch = (
      opportunity.title.toLowerCase().includes(searchTerm) ||
      opportunity.industry.industry.toLowerCase().includes(searchTerm) ||
      opportunity.category.name.toLowerCase().includes(searchTerm) ||
      opportunity.skills.some(skill => skill.skillName.toLowerCase().includes(searchTerm))
    );

    // Filter based on user premium status and opportunity access
    const user = session?.user as SessionUser;
    const canViewFreelancing = user?.isPremium || opportunity.type !== 'FREELANCING';
    
    return matchesSearch && canViewFreelancing;
  });

  // Handle bookmark toggle
  const toggleBookmark = async (opportunityId: string) => {
    try {
      const isBookmarked = bookmarkedIds.has(opportunityId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/candidate/opportunities/${opportunityId}/save`, {
        method,
      });

      if (response.ok) {
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.delete(opportunityId);
          } else {
            newSet.add(opportunityId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      // Optimistic update for demo
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (prev.has(opportunityId)) {
          newSet.delete(opportunityId);
        } else {
          newSet.add(opportunityId);
        }
        return newSet;
      });
    }
  };

  // Get candidate display name with privacy controls
  const getCandidateName = () => {
    const user = session?.user as SessionUser;
    if (user?.candidate?.showFullName && user.candidate.firstName) {
      return `${user.candidate.firstName} ${user.candidate.lastName}`;
    }
    return user?.email?.split('@')[0] || 'Candidate';
  };

  // Get company display name based on privacy settings
  const getCompanyDisplayName = (industry: Opportunity['industry'], isPremium: boolean) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  // Handle premium upgrade prompt
  const handlePremiumUpgrade = () => {
    setShowPremiumPrompt(true);
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
    return null; // Will redirect
  }

  const user = session?.user as SessionUser;
  const isPremium = user?.isPremium || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user ? {
        id: user.id,
        email: user.email,
        userType: user.userType,
        candidate: user.candidate
      } : undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-manrope">
                    Welcome back, {getCandidateName()}!
                  </CardTitle>
                  {isPremium && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
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
                  <Link href="/candidate" className="flex items-center space-x-3 text-primary-600 font-semibold bg-primary-50 p-3 rounded-lg border-l-4 border-primary-500">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/candidate/browse" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Search className="h-5 w-5" />
                    <span>Browse Opportunities</span>
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
                  <Link href="/candidate/messages" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                    <span>Messages</span>
                  </Link>
                  {isPremium && (
                    <Link href="/candidate/freelancing" className="flex items-center space-x-3 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 p-3 rounded-lg transition-colors">
                      <Crown className="h-5 w-5" />
                      <span>Freelancing Hub</span>
                    </Link>
                  )}
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
                    <span className="font-semibold">{stats.totalApplications}</span>
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
                    <span className="font-semibold">{stats.savedOpportunities}</span>
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
          <main className="lg:col-span-3 space-y-8">
            
            {/* Welcome Section */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
                  Discover Your Next Opportunity
                </h1>
                <p className="text-gray-600 mb-6">
                  Explore {filteredOpportunities.length} personalized recommendations based on your profile and interests.
                  {!isPremium && (
                    <span className="text-yellow-600 font-medium">
                      {" "}Upgrade to Premium for exclusive freelancing opportunities.
                    </span>
                  )}
                </p>
                
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by title, company, skills..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <Button variant="secondary" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Prompt */}
            {!isPremium && showPremiumPrompt && (
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Unlock Premium Features</h3>
                        <p className="text-gray-600 mt-1">
                          Get access to exclusive freelancing opportunities, full company details, and direct client contact.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href="/candidate/premium">
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          Upgrade Now
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setShowPremiumPrompt(false)}>
                        ×
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunity Listings */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                  Recommended for You
                </h2>
                <Link href="/candidate/browse">
                  <Button variant="secondary">View All</Button>
                </Link>
              </div>

              {filteredOpportunities.length > 0 ? (
                <div className="grid gap-6">
                  {filteredOpportunities.map((opportunity) => {
                    const isBookmarked = bookmarkedIds.has(opportunity.id);
                    const companyName = getCompanyDisplayName(opportunity.industry, isPremium);
                    const canApplyToFreelancing = isPremium || opportunity.type !== 'FREELANCING';
                    
                    return (
                      <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                  {opportunity.title}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                  opportunity.type === 'FREELANCING' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-primary-100 text-primary-700'
                                }`}>
                                  {opportunity.type.toLowerCase()}
                                </span>
                                {opportunity.isPremiumOnly && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              
                              <div className="flex items-center text-gray-600 mb-3">
                                <Building className="h-4 w-4 mr-2" />
                                <span className="font-medium">{companyName}</span>
                                {opportunity.industry.isVerified && (
                                  <div className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                                <span className="mx-2 text-gray-400">•</span>
                                <span>{opportunity.industry.industry}</span>
                                {!opportunity.industry.showCompanyName && !isPremium && (
                                  <button
                                    onClick={handlePremiumUpgrade}
                                    className="ml-2 text-yellow-600 hover:text-yellow-700"
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(opportunity.id)}
                              className="p-2"
                            >
                              <Bookmark 
                                className={`h-5 w-5 transition-colors ${
                                  isBookmarked 
                                    ? 'text-primary-600 fill-current' 
                                    : 'text-gray-400 hover:text-primary-600'
                                }`}
                              />
                            </Button>
                          </div>

                          {/* Key Details */}
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
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              <span>{opportunity.applicationCount} applied</span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{opportunity.location.city}, {opportunity.location.state}, {opportunity.location.country}</span>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {opportunity.description}
                          </p>

                          {/* Skills */}
                          {opportunity.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {opportunity.skills.slice(0, 4).map((skill, index) => (
                                <span 
                                  key={index}
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    skill.isRequired 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {skill.skillName}
                                  {skill.isRequired && '*'}
                                </span>
                              ))}
                              {opportunity.skills.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                                  +{opportunity.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Privacy Notice */}
                          {!isPremium && (opportunity.type === 'FREELANCING' || !opportunity.industry.showCompanyName) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center text-yellow-700">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="text-sm">
                                  {opportunity.type === 'FREELANCING' 
                                    ? 'Premium feature - Upgrade to apply to freelancing opportunities'
                                    : 'Upgrade to see full company details and contact information'
                                  }
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Posted {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{opportunity.viewCount} views</span>
                            </div>
                            
                            <div className="flex gap-3">
                              <Link href={`/candidate/opportunities/${opportunity.id}`}>
                                <Button variant="secondary" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              {canApplyToFreelancing ? (
                                <Link href={`/candidate/apply/${opportunity.id}`}>
                                  <Button size="sm">
                                    Apply Now
                                  </Button>
                                </Link>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={handlePremiumUpgrade}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                >
                                  <Crown className="h-4 w-4 mr-1" />
                                  Upgrade to Apply
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-16">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your search terms or explore all opportunities.
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