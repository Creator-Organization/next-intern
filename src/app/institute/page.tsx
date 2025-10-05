import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  CheckCircle,
  Building,
  MapPin,
  Award,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function InstituteDashboard() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute data with relations
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id },
    include: {
      domains: { where: { isVerified: true } },
      programs: { where: { isActive: true } },
      instituteStudents: {
        where: { isActive: true },
        include: {
          candidate: {
            include: {
              applications: true
            }
          }
        }
      }
    }
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  // Calculate metrics
  const totalStudents = institute.instituteStudents.length;
  const activeApplications = institute.instituteStudents.reduce(
    (sum, student) => 
      sum + student.candidate.applications.filter(app => 
        app.status === 'PENDING' || app.status === 'REVIEWED' || app.status === 'SHORTLISTED'
      ).length, 
    0
  );
  const successfulPlacements = institute.instituteStudents.reduce(
    (sum, student) => 
      sum + student.candidate.applications.filter(app => 
        app.status === 'SELECTED'
      ).length, 
    0
  );
  const placementRate = totalStudents > 0 
    ? ((successfulPlacements / totalStudents) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">
          Institute Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage students, track placements, and monitor internship programs
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
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

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Applications</p>
              <p className="text-3xl font-bold text-gray-900">{activeApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
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

        <Card className="p-6 hover:shadow-lg transition-shadow">
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

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/institute/students">
            <Button variant="secondary" className="w-full justify-start">
              <Users className="w-5 h-5 mr-3" />
              Manage Students
            </Button>
          </Link>
          <Link href="/institute/programs">
            <Button variant="secondary" className="w-full justify-start">
              <GraduationCap className="w-5 h-5 mr-3" />
              Programs
            </Button>
          </Link>
          <Link href="/institute/analytics">
            <Button variant="secondary" className="w-full justify-start">
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Button>
          </Link>
          <Link href="/institute/domains">
            <Button variant="secondary" className="w-full justify-start">
              <Shield className="w-5 h-5 mr-3" />
              Verify Domains
            </Button>
          </Link>
        </div>
      </Card>

      {/* Institute Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 font-manrope">Institute Information</h2>
          <Link href="/institute/profile">
            <Button variant="ghost" size="sm">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Building className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Institute Name</p>
                <p className="text-gray-900 font-medium">{institute.instituteName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-gray-900 font-medium">
                  {institute.instituteType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-gray-900 font-medium">
                  {institute.city}, {institute.state}, {institute.country}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Programs</p>
                <p className="text-gray-900 font-medium">{institute.programs.length} Active</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Verified Domains</p>
                <p className="text-gray-900 font-medium">{institute.domains.length}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <p className={`font-medium ${
                  institute.isVerified ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {institute.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}