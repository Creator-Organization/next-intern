import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { 
  Users, 
  Search,
  Filter,
  UserPlus,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  CheckCircle,
  Clock} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function InstituteStudents() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute with students
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id },
    include: {
      instituteStudents: {
        where: { isActive: true },
        include: {
          candidate: {
            include: {
                user: true,
              applications: {
                include: {
                  opportunity: true
                }
              }
            }
          },
          program: true
        },
        orderBy: { enrolledAt: 'desc' }
      }
    }
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  const students = institute.instituteStudents;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">Student Management</h1>
          <p className="text-gray-600 mt-2">View and manage enrolled students</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Students List */}
      <div className="grid grid-cols-1 gap-4">
        {students.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
            <p className="text-gray-600 mb-4">
              Add students manually or set up domain verification for automatic enrollment
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/institute/domains">
                <Button variant="secondary">
                  Set Up Domains
                </Button>
              </Link>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </Card>
        ) : (
          students.map((student) => {
            const applications = student.candidate.applications;
            const totalApps = applications.length;
            const placements = applications.filter(app => app.status === 'SELECTED').length;
            const pendingApps = applications.filter(app => 
              app.status === 'PENDING' || app.status === 'REVIEWED' || app.status === 'SHORTLISTED'
            ).length;

            return (
              <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {student.candidate.firstName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {student.candidate.firstName} {student.candidate.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{student.candidate.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>{student.program.programName}</span>
                        </div>
                        {student.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Year {student.year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-600 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">Applications</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{totalApps}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-green-600 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs">Placed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{placements}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-blue-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{pendingApps}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Student ID & CGPA */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-600">Student ID: </span>
                    <span className="font-medium text-gray-900">{student.studentId}</span>
                  </div>
                  {student.cgpa && (
                    <div>
                      <span className="text-gray-600">CGPA: </span>
                      <span className="font-medium text-gray-900">{student.cgpa.toFixed(2)}</span>
                    </div>
                  )}
                  {student.semester && (
                    <div>
                      <span className="text-gray-600">Semester: </span>
                      <span className="font-medium text-gray-900">{student.semester}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}