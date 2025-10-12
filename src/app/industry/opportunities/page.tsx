/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/industry/opportunities/page.tsx - FIX IMPORTS
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header'; // FIXED: Named import
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  workType: string;
  stipend: number | null;
  currency: string;
  duration: number;
  viewCount: number;
  applicationCount: number;
  isActive: boolean;
  createdAt: string;
  isApproved: boolean;
  approvalStatus: string;
  approvedAt: string | null;
  rejectionReason: string | null;
  applicationDeadline: Date | null;
  category: { name: string } | null;
  location?: { city: string; state: string };
  _count?: { applications: number };
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasFetchedData = useRef(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<
    Opportunity[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/industry');
    else if (
      status === 'authenticated' &&
      session?.user?.userType !== 'INDUSTRY'
    )
      router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (
        status !== 'authenticated' ||
        !session?.user?.industry?.id ||
        hasFetchedData.current
      )
        return;
      hasFetchedData.current = true;
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/industries/${session.user.industry.id}/opportunities`
        );
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data.opportunities || []);
          setFilteredOpportunities(data.opportunities || []);
        } else {
          toast.error('Failed to load opportunities');
          hasFetchedData.current = false;
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error loading opportunities');
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [status, session?.user?.industry?.id]);

  useEffect(() => {
    if (activeFilter === 'all') setFilteredOpportunities(opportunities);
    else if (activeFilter === 'pending')
      setFilteredOpportunities(
        opportunities.filter((o) => o.approvalStatus === 'PENDING')
      );
    else if (activeFilter === 'approved')
      setFilteredOpportunities(
        opportunities.filter((o) => o.approvalStatus === 'APPROVED')
      );
    else if (activeFilter === 'rejected')
      setFilteredOpportunities(
        opportunities.filter((o) => o.approvalStatus === 'REJECTED')
      );
  }, [activeFilter, opportunities]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const loadingToast = toast.loading('Deleting...');
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('✅ Deleted!', { id: loadingToast, duration: 4000 });
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting', { id: loadingToast });
    }
  };

  const getStatusBadge = (opp: Opportunity) => {
    if (opp.approvalStatus === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
          <Clock className="h-4 w-4" />⏳ Pending
        </span>
      );
    } else if (opp.approvalStatus === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          ✅ Approved
        </span>
      );
    } else if (opp.approvalStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          ❌ Rejected
        </span>
      );
    }
    return null;
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return 'No deadline';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INTERNSHIP':
        return 'bg-blue-100 text-blue-800';
      case 'PROJECT':
        return 'bg-purple-100 text-purple-800';
      case 'FREELANCING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  const stats = {
    total: opportunities.length,
    pending: opportunities.filter((o) => o.approvalStatus === 'PENDING').length,
    approved: opportunities.filter((o) => o.approvalStatus === 'APPROVED')
      .length,
    rejected: opportunities.filter((o) => o.approvalStatus === 'REJECTED')
      .length,
  };

  return (
    <>
      <Header user={session?.user as any} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope text-2xl font-bold text-gray-900">
                Your Opportunities
              </h2>
              <p className="text-gray-600">
                Manage and track your active internships and projects
              </p>
            </div>
            <Link href="/industry/post">
              <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                <Plus className="mr-2 h-4 w-4" />
                Post New
              </Button>
            </Link>
          </div>

          {/* Info Banner */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  ℹ️ Only approved opportunities are visible to candidates
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  All new opportunities must be reviewed and approved by our
                  admin team before going live.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                    <div className="h-4 w-4 rounded-full bg-teal-600"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Approved</p>
                    <p className="text-2xl font-bold text-green-800">
                      {stats.approved}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700">Rejected</p>
                    <p className="text-2xl font-bold text-red-800">
                      {stats.rejected}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-lg px-4 py-2 font-medium transition ${activeFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`rounded-lg px-4 py-2 font-medium transition ${activeFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveFilter('approved')}
              className={`rounded-lg px-4 py-2 font-medium transition ${activeFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setActiveFilter('rejected')}
              className={`rounded-lg px-4 py-2 font-medium transition ${activeFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                  <Plus className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {activeFilter === 'all'
                    ? 'No Opportunities Yet'
                    : `No ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Opportunities`}
                </h3>
                <p className="mb-6 text-gray-600">
                  {activeFilter === 'all'
                    ? 'Start connecting with talented candidates by posting your first opportunity.'
                    : `You don't have any ${activeFilter} opportunities at the moment`}
                </p>
                {activeFilter === 'all' && (
                  <Link href="/industry/post">
                    <Button className="bg-gradient-to-r from-teal-600 to-green-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Opportunity
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOpportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="border-teal-100 bg-white/70 backdrop-blur-sm transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {opp.title}
                          </h3>
                          {getStatusBadge(opp)}
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(opp.type)}`}
                          >
                            {opp.type.toLowerCase()}
                          </span>
                        </div>

                        {opp.approvalStatus === 'REJECTED' &&
                          opp.rejectionReason && (
                            <Card className="mb-3 border-red-200 bg-red-50">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                  <div>
                                    <p className="mb-1 text-sm font-semibold text-red-800">
                                      Rejection Reason:
                                    </p>
                                    <p className="text-sm text-red-700">
                                      {opp.rejectionReason}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                        <p className="mb-3 text-sm text-gray-600">
                          {opp.category?.name || 'No category'}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {opp._count?.applications || 0} applications
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{opp.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Deadline: {formatDate(opp.applicationDeadline)}
                            </span>
                          </div>
                          {opp.stipend && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{opp.stipend.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-gray-400">
                          Posted on {formatDate(opp.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {opp.approvalStatus === 'APPROVED' && (
                          <Link
                            href={`/opportunities/${opp.id}`}
                            target="_blank"
                          >
                            <Button variant="secondary" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              Preview
                            </Button>
                          </Link>
                        )}
                        <Link
                          href={`/industry/opportunities/${opp.id}/analytics`}
                        >
                          <Button variant="secondary" size="sm">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/industry/opportunities/${opp.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(opp.id, opp.title)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
