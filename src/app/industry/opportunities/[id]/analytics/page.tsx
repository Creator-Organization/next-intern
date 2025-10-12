/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Header } from '@/components/ui/header'; // ✅ ADD THIS
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Eye,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import Link from 'next/link';

async function getOpportunityAnalytics(opportunityId: string, userId: string) {
  // Get industry profile
  const industry = await db.industry.findUnique({
    where: { userId },
  });

  if (!industry) {
    throw new Error('Industry profile not found');
  }

  // Get opportunity with analytics
  const opportunity = await db.opportunity.findFirst({
    where: {
      id: opportunityId,
      industryId: industry.id,
    },
    include: {
      location: true,
      category: true,
      applications: {
        include: {
          candidate: {
            select: {
              college: true,
              degree: true,
              graduationYear: true,
              city: true,
              state: true,
            },
          },
        },
      },
      skills: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!opportunity) {
    throw new Error('Opportunity not found or unauthorized');
  }

  // Calculate analytics
  const totalApplications = opportunity.applications.length;
  const statusCounts = opportunity.applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Location distribution
  const locationDist = opportunity.applications.reduce(
    (acc, app) => {
      const loc = app.candidate.city || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // College distribution
  const collegeDist = opportunity.applications.reduce(
    (acc, app) => {
      const college = app.candidate.college || 'Unknown';
      acc[college] = (acc[college] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Degree distribution
  const degreeDist = opportunity.applications.reduce(
    (acc, app) => {
      const degree = app.candidate.degree || 'Unknown';
      acc[degree] = (acc[degree] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Graduation year distribution
  const yearDist = opportunity.applications.reduce(
    (acc, app) => {
      const year = app.candidate.graduationYear?.toString() || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Application timeline (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentApplications = opportunity.applications.filter(
    (app) => new Date(app.appliedAt) >= sevenDaysAgo
  );

  const dailyApplications = recentApplications.reduce(
    (acc, app) => {
      const date = new Date(app.appliedAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Conversion metrics
  const conversionRate =
    opportunity.viewCount > 0
      ? ((totalApplications / opportunity.viewCount) * 100).toFixed(2)
      : '0.00';

  const shortlistRate =
    totalApplications > 0
      ? (((statusCounts.SHORTLISTED || 0) / totalApplications) * 100).toFixed(2)
      : '0.00';

  const selectionRate =
    totalApplications > 0
      ? (((statusCounts.SELECTED || 0) / totalApplications) * 100).toFixed(2)
      : '0.00';

  return {
    opportunity,
    analytics: {
      totalViews: opportunity.viewCount,
      totalApplications,
      statusCounts,
      locationDist,
      collegeDist,
      degreeDist,
      yearDist,
      dailyApplications,
      conversionRate: parseFloat(conversionRate),
      shortlistRate: parseFloat(shortlistRate),
      selectionRate: parseFloat(selectionRate),
    },
  };
}

export default async function OpportunityAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const resolvedParams = await params;

  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin');
  }

  const { opportunity, analytics } = await getOpportunityAnalytics(
    resolvedParams.id,
    session.user.id
  );

  const topLocations = Object.entries(analytics.locationDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topColleges = Object.entries(analytics.collegeDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ✅ ADD HEADER */}
      <Header user={session.user as any} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/industry/opportunities">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
              </Button>
            </Link>
            <div>
              <h1 className="font-manrope text-2xl font-bold text-gray-900">
                {opportunity.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Analytics & Performance Metrics
              </p>
            </div>
          </div>
          <Link href={`/industry/opportunities/${opportunity.id}/edit`}>
            <Button>Edit Opportunity</Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.totalViews}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.totalApplications}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.conversionRate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selection Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {analytics.selectionRate}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.statusCounts).map(
                  ([status, count]) => {
                    const percentage = (
                      (count / analytics.totalApplications) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={status}>
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Applications (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.dailyApplications).length > 0 ? (
                  Object.entries(analytics.dailyApplications).map(
                    ([date, count]) => (
                      <div
                        key={date}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">{date}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{
                                width: `${(count / Math.max(...Object.values(analytics.dailyApplications))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-8 text-sm font-medium text-gray-900">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No applications in the last 7 days
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Applicant Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topLocations.length > 0 ? (
                  topLocations.map(([location, count]) => (
                    <div
                      key={location}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700">{location}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {count} applicants
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No location data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Colleges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Colleges/Universities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topColleges.length > 0 ? (
                  topColleges.map(([college, count]) => (
                    <div
                      key={college}
                      className="flex items-center justify-between"
                    >
                      <span className="max-w-[200px] truncate text-sm text-gray-700">
                        {college}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No college data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Degree Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Degree Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.degreeDist).length > 0 ? (
                  Object.entries(analytics.degreeDist).map(
                    ([degree, count]) => (
                      <div
                        key={degree}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{degree}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No degree data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Graduation Year */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Graduation Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.yearDist).length > 0 ? (
                  Object.entries(analytics.yearDist)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([year, count]) => (
                      <div
                        key={year}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{year}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {count}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No graduation year data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
