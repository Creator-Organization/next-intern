// src/app/industry/page.tsx - KEEP OLD DASHBOARD, JUST ADD HEADER
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  Users, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  ArrowRight,
  Clock,
  RefreshCw,
  Building2,
  CreditCard,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface DashboardStats {
  totalOpportunities: number;
  activeOpportunities: number;
  totalApplications: number;
  pendingApplications: number;
  totalViews: number;
  messagesCount: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'view' | 'message';
  title: string;
  description: string;
  time: string;
  candidateName?: string;
  opportunityId?: string;
}

interface TopOpportunity {
  id: string;
  title: string;
  type: string;
  applications: number;
  views: number;
  conversionRate: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  topOpportunities: TopOpportunity[];
  isPremium: boolean;
  companyName: string;
  lastUpdated: string;
}

export default function IndustryDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasFetchedData = useRef(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchDashboardData = async (showToast = false) => {
    if (status !== 'authenticated' || !session?.user?.industry?.id) return;

    const isInitialLoad = !dashboardData;
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch(`/api/industries/${session.user.industry.id}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(new Date(result.data.lastUpdated).toLocaleTimeString());
        
        if (showToast) {
          toast.success('✅ Dashboard refreshed!', { duration: 2000 });
        }
      } else {
        throw new Error(result.error || 'Failed to load data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      if (showToast || isInitialLoad) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.industry?.id && !hasFetchedData.current) {
      hasFetchedData.current = true;
      fetchDashboardData(false);
    }
  }, [status, session?.user?.industry?.id]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, session?.user?.industry?.id]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No dashboard data available</p>
          <Button onClick={() => fetchDashboardData(false)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats, recentActivity, topOpportunities, isPremium, companyName } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-manrope">
                Welcome back, {companyName}!
              </h1>
              <p className="text-gray-600">Here&#39;s what&#39;s happening with your opportunities today.</p>
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>

              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="secondary"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>

              <Link href="/industry/post">
                <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium Upgrade Notice */}
          {!isPremium && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">Unlock Premium Features</h3>
                    <p className="text-purple-700 text-sm">
                      See full candidate details, unlimited posting, and advanced analytics
                    </p>
                  </div>
                  <Link href="/industry/billing">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeOpportunities}</p>
                    <p className="text-xs text-gray-500">of {stats.totalOpportunities} total</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                    <p className="text-xs text-gray-500">{stats.pendingApplications} pending review</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                    <p className="text-xs text-gray-500">{stats.conversionRate}% conversion rate</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unread Messages</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.messagesCount}</p>
                    <p className="text-xs text-gray-500">Active chats</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Link href="/industry/applications">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.type === 'application' && <Users className="h-4 w-4 text-teal-600" />}
                        {activity.type === 'view' && <Eye className="h-4 w-4 text-teal-600" />}
                        {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-teal-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.candidateName}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performing Opportunities */}
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Top Performing Opportunities</span>
                  <Link href="/industry/opportunities">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topOpportunities.length > 0 ? (
                  topOpportunities.map((opportunity, index) => (
                    <Link key={opportunity.id} href={`/industry/opportunities/${opportunity.id}/analytics`}>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-teal-700">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{opportunity.title}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {opportunity.applications} apps
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {opportunity.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {opportunity.conversionRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No opportunities posted yet</p>
                    <Link href="/industry/post">
                      <Button size="sm" className="mt-2">Post Your First</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
{/* Quick Actions Section */}
<div>
  <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
    Quick Actions
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    
    {/* Post New Opportunity */}
    <Link href="/industry/post">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Plus className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                Post New Opportunity
              </h3>
              <p className="text-sm text-gray-600">Create internship or project</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* View Applications */}
    <Link href="/industry/applications">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                View Applications
              </h3>
              <p className="text-sm text-gray-600">Review candidate applications</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* Manage Opportunities */}
    <Link href="/industry/opportunities">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                Manage Opportunities
              </h3>
              <p className="text-sm text-gray-600">Edit or close postings</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* ✅ ADD THIS NEW CARD - Reports & Analytics */}
    <Link href="/industry/reports">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                Reports & Analytics
              </h3>
              <p className="text-sm text-gray-600">View performance insights</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* Company Profile */}
    <Link href="/industry/profile">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Company Profile
              </h3>
              <p className="text-sm text-gray-600">Update company details</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

    {/* Billing */}
    <Link href="/industry/billing">
      <Card className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
              <CreditCard className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                Billing & Subscription
              </h3>
              <p className="text-sm text-gray-600">Manage your plan</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>

  </div>
</div>
        </div>
      </div>
    </div>
  );
}