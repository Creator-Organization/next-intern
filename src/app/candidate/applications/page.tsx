// src/app/candidate/applications/page.tsx
// Applications Page - NextIntern v2 - Fully Optimized ✅

"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // ✅ Toast notifications
import { 
  Briefcase, 
  FileText, 
  User, 
  Bookmark, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Building,
  MapPin,
  Eye,
  X,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'WITHDRAWN';
  appliedAt: Date;
  coverLetter?: string;
  expectedSalary?: number;
  canJoinFrom?: Date;
  opportunity: {
    id: string;
    title: string;
    type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
    workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    stipend?: number;
    currency: string;
    duration?: number;
    industry: {
      companyName: string;
      industry: string;
      isVerified: boolean;
      showCompanyName: boolean;
      anonymousId: string;
    };
  };
}

const ApplicationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'selected' | 'rejected'>('all');
  
  // ✅ Prevent duplicate fetches
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchApplications = async () => {
      // Only fetch once when authenticated
      if (status !== 'authenticated' || hasFetchedData.current) {
        if (hasFetchedData.current) {
          console.log('⏭️ Skipping fetch - applications already loaded');
        }
        return;
      }

      hasFetchedData.current = true;
      setIsLoading(true);

      try {
        console.log('🔄 Fetching applications...');
        const response = await fetch('/api/candidates/applications');
        
        if (response.ok) {
          const data = await response.json();
          setApplications(data.data || []);
          console.log('✅ Applications loaded:', data.data?.length || 0);
          
          // Show success toast only if there are applications
          if (data.data && data.data.length > 0) {
            toast.success(`Loaded ${data.data.length} application${data.data.length > 1 ? 's' : ''}`);
          }
        } else {
          console.error('❌ Failed to fetch applications');
          toast.error('Failed to load applications');
          setApplications([]);
        }
      } catch (error) {
        console.error('❌ Applications fetch error:', error);
        toast.error('Failed to load applications');
        setApplications([]);
        // Reset flag on error so user can retry
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [status]); // Only depend on status

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'PENDING' || app.status === 'REVIEWED';
    if (filter === 'reviewed') return app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED';
    if (filter === 'selected') return app.status === 'SELECTED';
    if (filter === 'rejected') return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
    return true;
  });

  const getStatusInfo = (status: Application['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Applied', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'REVIEWED':
        return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye };
      case 'SHORTLISTED':
        return { label: 'Shortlisted', color: 'bg-green-100 text-green-800', icon: TrendingUp };
      case 'INTERVIEW_SCHEDULED':
        return { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800', icon: Calendar };
      case 'SELECTED':
        return { label: 'Selected', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'REJECTED':
        return { label: 'Not Selected', color: 'bg-red-100 text-red-800', icon: X };
      case 'WITHDRAWN':
        return { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getCompanyDisplayName = (industry: Application['opportunity']['industry'], isPremium: boolean) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  // ✅ Handle filter change with toast
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    const count = applications.filter(app => {
      if (newFilter === 'all') return true;
      if (newFilter === 'pending') return app.status === 'PENDING' || app.status === 'REVIEWED';
      if (newFilter === 'reviewed') return app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED';
      if (newFilter === 'selected') return app.status === 'SELECTED';
      if (newFilter === 'rejected') return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
      return true;
    }).length;

    // Show toast for filter changes (optional - can be removed if too chatty)
    if (newFilter !== 'all') {
      toast.success(`Showing ${count} ${newFilter} application${count !== 1 ? 's' : ''}`);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-primary-600 mx-auto text-primary-600" />
          <p className="mt-4 text-gray-600">Loading your applications...</p>
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
                <CardTitle className="text-lg font-manrope">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Link href="/candidate" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="flex items-center space-x-3 text-primary-600 font-semibold bg-primary-50 p-3 rounded-lg border-l-4 border-primary-500">
                    <FileText className="h-5 w-5" />
                    <span>My Applications</span>
                  </div>
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
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
                      My Applications
                    </h1>
                    <p className="text-gray-600">
                      Track the status of all your applications in one place.
                    </p>
                  </div>
                  <Link href="/candidate/browse">
                    <Button>Browse More Opportunities</Button>
                  </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
                  {[
                    { key: 'all', label: 'All', count: applications.length },
                    { key: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWED').length },
                    { key: 'reviewed', label: 'In Progress', count: applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED').length },
                    { key: 'selected', label: 'Selected', count: applications.filter(a => a.status === 'SELECTED').length },
                    { key: 'rejected', label: 'Closed', count: applications.filter(a => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => handleFilterChange(tab.key as typeof filter)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        filter === tab.key
                          ? 'bg-white text-primary-600 shadow-md scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const statusInfo = getStatusInfo(application.status);
                  const StatusIcon = statusInfo.icon;
                  const companyName = getCompanyDisplayName(application.opportunity.industry, isPremium);
                  
                  return (
                    <Card key={application.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/candidate/opportunities/${application.opportunity.id}`}>
                                <h3 className="text-xl font-bold text-gray-900 font-manrope hover:text-primary-600 transition-colors cursor-pointer">
                                  {application.opportunity.title}
                                </h3>
                              </Link>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-600 mb-3">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{companyName}</span>
                              {application.opportunity.industry.isVerified && (
                                <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                              )}
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{application.opportunity.industry.industry}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              toast.success('Viewing application details');
                            }}
                            className="hover:bg-primary-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{application.opportunity.workType}</span>
                          </div>
                          {application.opportunity.duration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{application.opportunity.duration} weeks</span>
                            </div>
                          )}
                          {application.opportunity.stipend && (
                            <div className="flex items-center text-green-600 font-medium">
                              <span>{application.opportunity.currency}{application.opportunity.stipend.toLocaleString()}/month</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Applied {getTimeSince(application.appliedAt)}</span>
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
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? "You haven't applied to any opportunities yet. Start exploring!"
                      : `You don't have any ${filter} applications at the moment.`
                    }
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

      {/* Application Details Modal - Enhanced */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                  Application Details
                </h2>
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    toast.success('Closed application details');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Opportunity</h3>
                  <p className="text-lg font-medium">{selectedApplication.opportunity.title}</p>
                  <p className="text-gray-600">
                    {getCompanyDisplayName(selectedApplication.opportunity.industry, isPremium)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Status</h3>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedApplication.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Applied On</h3>
                  <p className="text-gray-600">
                    {new Date(selectedApplication.appliedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(selectedApplication.appliedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-line">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                {selectedApplication.expectedSalary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Expected Salary</h3>
                    <p className="text-gray-700">
                      {selectedApplication.opportunity.currency}{selectedApplication.expectedSalary.toLocaleString()}/month
                    </p>
                  </div>
                )}

                {selectedApplication.canJoinFrom && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can Join From</h3>
                    <p className="text-gray-700">
                      {new Date(selectedApplication.canJoinFrom).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t mt-6">
                <Link href={`/candidate/opportunities/${selectedApplication.opportunity.id}`}>
                  <Button variant="secondary">View Opportunity</Button>
                </Link>
                <Button onClick={() => {
                  setSelectedApplication(null);
                  toast.success('Closed application details');
                }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;