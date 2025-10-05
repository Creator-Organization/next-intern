import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function InstituteOpportunities() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute with student applications
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id },
    include: {
      instituteStudents: {
        where: { isActive: true },
        include: {
          candidate: {
            include: {
              applications: {
                include: {
                  opportunity: {
                    include: {
                      industry: true,
                      category: true,
                      location: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  // Aggregate opportunities with application counts
  const opportunityMap = new Map<
    string,
    {
      opportunity: (typeof institute.instituteStudents)[0]['candidate']['applications'][0]['opportunity'];
      applications: (typeof institute.instituteStudents)[0]['candidate']['applications'];
    }
  >();

  institute.instituteStudents.forEach((student) => {
    student.candidate.applications.forEach((app) => {
      const oppId = app.opportunity.id;
      if (!opportunityMap.has(oppId)) {
        opportunityMap.set(oppId, {
          opportunity: app.opportunity,
          applications: [],
        });
      }
      opportunityMap.get(oppId)!.applications.push(app);
    });
  });

  const opportunities = Array.from(opportunityMap.values()).sort(
    (a, b) => b.applications.length - a.applications.length
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-manrope text-3xl font-bold text-gray-900">
          Opportunity Tracking
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor which opportunities your students are applying to
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Opportunities</p>
              <p className="text-3xl font-bold text-gray-900">
                {opportunities.length}
              </p>
            </div>
            <div className="bg-primary-100 flex h-12 w-12 items-center justify-center rounded-lg">
              <Briefcase className="text-primary-600 h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">
                {opportunities.reduce(
                  (sum, opp) => sum + opp.applications.length,
                  0
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {opportunities.length > 0
                  ? (
                      (opportunities.reduce(
                        (sum, opp) =>
                          sum +
                          opp.applications.filter(
                            (app) => app.status === 'SELECTED'
                          ).length,
                        0
                      ) /
                        opportunities.reduce(
                          (sum, opp) => sum + opp.applications.length,
                          0
                        )) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No Applications Yet
          </h3>
          <p className="text-gray-600">
            Your students haven&#39;t applied to any opportunities yet
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map(({ opportunity, applications }) => {
            const statusCounts = {
              pending: applications.filter((app) => app.status === 'PENDING')
                .length,
              reviewed: applications.filter((app) => app.status === 'REVIEWED')
                .length,
              shortlisted: applications.filter(
                (app) => app.status === 'SHORTLISTED'
              ).length,
              selected: applications.filter((app) => app.status === 'SELECTED')
                .length,
              rejected: applications.filter((app) => app.status === 'REJECTED')
                .length,
            };

            return (
              <Card
                key={opportunity.id}
                className="p-6 transition-shadow hover:shadow-lg"
              >
                {/* Opportunity Header */}
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      {opportunity.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{opportunity.industry.companyName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span className="capitalize">
                          {opportunity.type.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Count */}
                  <div className="text-center lg:text-right">
                    <p className="text-primary-600 text-3xl font-bold">
                      {applications.length}
                    </p>
                    <p className="text-sm text-gray-600">Students Applied</p>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 md:grid-cols-5">
                  <div className="rounded-lg bg-yellow-50 p-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-gray-600">Pending</span>
                    </div>
                    <p className="text-xl font-bold text-yellow-600">
                      {statusCounts.pending}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-1">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Reviewed</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {statusCounts.reviewed}
                    </p>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-1">
                      <TrendingUp className="text-primary-600 h-4 w-4" />
                      <span className="text-xs text-gray-600">Shortlisted</span>
                    </div>
                    <p className="text-primary-600 text-xl font-bold">
                      {statusCounts.shortlisted}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-gray-600">Selected</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {statusCounts.selected}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <div className="mb-1 flex items-center justify-center gap-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-gray-600">Rejected</span>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      {statusCounts.rejected}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
