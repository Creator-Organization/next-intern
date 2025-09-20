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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

// --- TYPE DEFINITIONS ---
interface Opportunity {
  id: string;
  title: string;
  description: string;
  opportunityType: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  stipend?: number;
  currency: string;
  duration?: number;
  city?: string;
  state?: string;
  country?: string;
  applicationCount: number;
  createdAt: Date;
  industry: {
    companyName: string;
    industry: string;
    isVerified: boolean;
  };
  category: {
    name: string;
    slug: string;
    color?: string;
  };
  requiredSkills: string[];
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedOpportunities: number;
  profileViews: number;
}

const CandidateDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Redirect if not authenticated or not a candidate
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== 'authenticated') return;

      try {
        // Fetch recommended opportunities
        const opportunitiesResponse = await fetch('/api/opportunities/recommended');
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          setOpportunities(opportunitiesData.data || []);
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/candidate/dashboard-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }

        // Fetch saved opportunities
        const savedResponse = await fetch('/api/candidate/saved-opportunities');
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const savedIds = new Set<string>(savedData.data.map((item: { opportunityId: string }) => item.opportunityId));
          setBookmarkedIds(savedIds);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [status]);

  // Filter opportunities based on search
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const searchTerm = searchFilter.toLowerCase();
    return (
      opportunity.title.toLowerCase().includes(searchTerm) ||
      opportunity.industry.industry.toLowerCase().includes(searchTerm) ||
      opportunity.category.name.toLowerCase().includes(searchTerm) ||
      opportunity.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  });

  // Handle bookmark toggle
  const toggleBookmark = async (opportunityId: string) => {
    try {
      const isBookmarked = bookmarkedIds.has(opportunityId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/opportunities/${opportunityId}/save`, {
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
    }
  };

  // Get candidate display name
  const getCandidateName = () => {
    if (session?.user?.name) return session.user.name;
    return session?.user?.email?.split('@')[0] || 'Candidate';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        userType: session.user.userType,
        candidate: session.user.name ? {
          firstName: session.user.name.split(' ')[0] || '',
          lastName: session.user.name.split(' ')[1] || ''
        } : undefined
      } : undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-manrope">
                  Welcome back, {getCandidateName()}!
                </CardTitle>
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
                  Explore {opportunities.length} personalized recommendations based on your profile and interests.
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
                    
                    return (
                      <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                  {opportunity.title}
                                </h3>
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
                                  {opportunity.opportunityType.toLowerCase()}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-gray-600 mb-3">
                                <Building className="h-4 w-4 mr-2" />
                                <span className="font-medium">{opportunity.industry.companyName}</span>
                                {opportunity.industry.isVerified && (
                                  <div className="ml-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                                <span className="mx-2 text-gray-400">•</span>
                                <span>{opportunity.industry.industry}</span>
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
                          {opportunity.city && (
                            <div className="flex items-center text-sm text-gray-600 mb-4">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{opportunity.city}, {opportunity.state}, {opportunity.country}</span>
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {opportunity.description}
                          </p>

                          {/* Skills */}
                          {opportunity.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {opportunity.requiredSkills.slice(0, 4).map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {opportunity.requiredSkills.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                                  +{opportunity.requiredSkills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Posted {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex gap-3">
                              <Link href={`/opportunities/${opportunity.id}`}>
                                <Button variant="secondary" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/candidate/apply/${opportunity.id}`}>
                                <Button size="sm">
                                  Apply Now
                                </Button>
                              </Link>
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