import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Briefcase,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default async function InstituteAnalytics() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute with comprehensive analytics data
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
                      category: true
                    }
                  }
                }
              }
            }
          },
          program: true
        }
      }
    }
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  // Aggregate all applications from students
  const allApplications = institute.instituteStudents.flatMap(
    student => student.candidate.applications
  );

  // Calculate metrics
  const totalStudents = institute.instituteStudents.length;
  const totalApplications = allApplications.length;
  const successfulPlacements = allApplications.filter(app => app.status === 'SELECTED').length;
  const placementRate = totalStudents > 0 
    ? ((successfulPlacements / totalStudents) * 100).toFixed(1) 
    : '0.0';

  // Status distribution
  const statusCounts = {
    pending: allApplications.filter(app => app.status === 'PENDING').length,
    reviewed: allApplications.filter(app => app.status === 'REVIEWED').length,
    shortlisted: allApplications.filter(app => app.status === 'SHORTLISTED').length,
    selected: allApplications.filter(app => app.status === 'SELECTED').length,
    rejected: allApplications.filter(app => app.status === 'REJECTED').length,
  };

  // Opportunity type distribution
  const typeCounts = {
    internship: allApplications.filter(app => app.opportunity.type === 'INTERNSHIP').length,
    project: allApplications.filter(app => app.opportunity.type === 'PROJECT').length,
    freelancing: allApplications.filter(app => app.opportunity.type === 'FREELANCING').length,
  };

  // Top categories
  const categoryMap = new Map<string, number>();
  allApplications.forEach(app => {
    const categoryName = app.opportunity.category.name;
    categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
  });
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Program-wise breakdown
  const programMap = new Map<string, { total: number; placed: number }>();
  institute.instituteStudents.forEach(student => {
    const programName = student.program.programName;
    const placed = student.candidate.applications.filter(app => app.status === 'SELECTED').length > 0 ? 1 : 0;
    
    if (!programMap.has(programName)) {
      programMap.set(programName, { total: 0, placed: 0 });
    }
    const current = programMap.get(programName)!;
    programMap.set(programName, { total: current.total + 1, placed: current.placed + placed });
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track placement metrics and student performance</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Placements</p>
              <p className="text-3xl font-bold text-gray-900">{successfulPlacements}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Placement Rate</p>
              <p className="text-3xl font-bold text-gray-900">{placementRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Application Status Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Application Status Distribution</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{statusCounts.pending}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (statusCounts.pending / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Reviewed</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{statusCounts.reviewed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (statusCounts.reviewed / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Shortlisted</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{statusCounts.shortlisted}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (statusCounts.shortlisted / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Selected</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{statusCounts.selected}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (statusCounts.selected / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Rejected</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{statusCounts.rejected}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${totalApplications > 0 ? (statusCounts.rejected / totalApplications) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Opportunity Type Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Opportunity Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{typeCounts.internship}</p>
            <p className="text-sm text-gray-600">Internships</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{typeCounts.project}</p>
            <p className="text-sm text-gray-600">Projects</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{typeCounts.freelancing}</p>
            <p className="text-sm text-gray-600">Freelancing</p>
          </div>
        </div>
      </Card>

      {/* Top Categories */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Top Application Categories</h2>
        <div className="space-y-3">
          {topCategories.map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{category}</span>
              <span className="text-sm font-bold text-primary-600">{count} applications</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Program-wise Placement */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Program-wise Placement</h2>
        <div className="space-y-4">
          {Array.from(programMap.entries()).map(([program, stats]) => {
            const rate = stats.total > 0 ? ((stats.placed / stats.total) * 100).toFixed(1) : '0.0';
            return (
              <div key={program}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{program}</span>
                  <span className="text-sm text-gray-600">
                    {stats.placed}/{stats.total} ({rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}