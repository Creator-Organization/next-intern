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
  Calendar, 
  CheckCircle, 
  Building,
  MapPin,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

// --- TYPE DEFINITIONS ---
interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'WITHDRAWN';
  appliedAt: Date;
  reviewedAt?: Date;
  coverLetter?: string;
  companyNotes?: string;
  rejectionReason?: string;
  opportunity: {
    id: string;
    title: string;
    opportunityType: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
    workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    stipend?: number;
    currency: string;
    duration?: number;
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
  };
  interviews?: {
    id: string;
    scheduledAt: Date;
    type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'HR';
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  }[];
}

const ApplicationsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'selected' | 'rejected'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/candidate/applications');
        if (response.ok) {
          const data = await response.json();
          setApplications(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [status]);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'PENDING' || app.status === 'REVIEWED';
    if (filter === 'reviewed') return app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED';
    if (filter === 'selected') return app.status === 'SELECTED';
    if (filter === 'rejected') return app.status === 'REJECTED' || app.status === 'WITHDRAWN';
    return true;
  });

  // Get status display info
  const getStatusInfo = (status: Application['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Applied', color: 'bg-blue-100 text-blue-800', step: 1 };
      case 'REVIEWED':
        return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', step: 2 };
      case 'SHORTLISTED':
        return { label: 'Shortlisted', color: 'bg-green-100 text-green-800', step: 3 };
      case 'INTERVIEW_SCHEDULED':
        return { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800', step: 3 };
      case 'SELECTED':
        return { label: 'Selected', color: 'bg-green-100 text-green-800', step: 4 };
      case 'REJECTED':
        return { label: 'Not Selected', color: 'bg-red-100 text-red-800', step: 0 };
      case 'WITHDRAWN':
        return { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', step: 0 };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', step: 0 };
    }
  };

  // Get time since application
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
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
                    <Button>
                      Browse More Opportunities
                    </Button>
                  </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: 'all', label: 'All', count: applications.length },
                    { key: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWED').length },
                    { key: 'reviewed', label: 'In Progress', count: applications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW_SCHEDULED').length },
                    { key: 'selected', label: 'Selected', count: applications.filter(a => a.status === 'SELECTED').length },
                    { key: 'rejected', label: 'Closed', count: applications.filter(a => a.status === 'REJECTED' || a.status === 'WITHDRAWN').length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as 'all' | 'pending' | 'reviewed' | 'selected' | 'rejected')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filter === tab.key
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
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
                  const nextInterview = application.interviews?.find(i => i.status === 'SCHEDULED');
                  
                  return (
                    <Card key={application.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                {application.opportunity.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-600 mb-3">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{application.opportunity.industry.companyName}</span>
                              {application.opportunity.industry.isVerified && (
                                <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                              )}
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{application.opportunity.industry.industry}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
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
                            <div className="flex items-center">
                              <span className="text-green-600 font-medium">
                                {application.opportunity.currency}{application.opportunity.stipend.toLocaleString()}/month
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Applied {getTimeSince(application.appliedAt)}</span>
                          </div>
                        </div>

                        {/* Next Interview */}
                        {nextInterview && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-purple-900">Upcoming Interview</h4>
                                <p className="text-sm text-purple-700">
                                  {nextInterview.type} interview scheduled for{' '}
                                  {new Date(nextInterview.scheduledAt).toLocaleDateString()} at{' '}
                                  {new Date(nextInterview.scheduledAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <Button size="sm" variant="secondary">
                                <Calendar className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {application.status === 'REJECTED' && application.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-2">Feedback</h4>
                            <p className="text-sm text-red-700">{application.rejectionReason}</p>
                          </div>
                        )}

                        {/* Company Notes */}
                        {application.companyNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Company Notes</h4>
                            <p className="text-sm text-blue-700">{application.companyNotes}</p>
                          </div>
                        )}
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
                    <Button>
                      Browse Opportunities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                  Application Details
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Opportunity</h3>
                  <p className="text-lg font-medium">{selectedApplication.opportunity.title}</p>
                  <p className="text-gray-600">{selectedApplication.opportunity.industry.companyName}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Status</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusInfo(selectedApplication.status).color}`}>
                    {getStatusInfo(selectedApplication.status).label}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Applied On</h3>
                  <p className="text-gray-600">
                    {new Date(selectedApplication.appliedAt).toLocaleDateString()} at{' '}
                    {new Date(selectedApplication.appliedAt).toLocaleTimeString()}
                  </p>
                </div>

                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">{selectedApplication.coverLetter}</p>
                    </div>
                  </div>
                )}

                {selectedApplication.interviews && selectedApplication.interviews.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Interviews</h3>
                    <div className="space-y-3">
                      {selectedApplication.interviews.map((interview) => (
                        <div key={interview.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{interview.type} Interview</p>
                              <p className="text-sm text-gray-600">
                                {new Date(interview.scheduledAt).toLocaleDateString()} at{' '}
                                {new Date(interview.scheduledAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              interview.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                              interview.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interview.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button onClick={() => setSelectedApplication(null)}>
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