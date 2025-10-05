import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { 
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function InstitutePrograms() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute with programs
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id },
    include: {
      programs: {
        include: {
          students: {
            where: { isActive: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-manrope">Program Management</h1>
          <p className="text-gray-600 mt-2">Manage academic programs and internship requirements</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* Programs List */}
      {institute.programs.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Added</h3>
          <p className="text-gray-600 mb-4">
            Create academic programs to track student internship requirements
          </p>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Program
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {institute.programs.map((program) => (
            <Card key={program.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Program Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {program.programName}
                    </h3>
                    <p className="text-sm text-gray-600">{program.programType.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Program Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Department</span>
                  </div>
                  <span className="font-medium text-gray-900">{program.department}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Students Enrolled</span>
                  </div>
                  <span className="font-medium text-gray-900">{program.students.length}</span>
                </div>

              </div>

              {/* Internship Requirement */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {program.internshipRequired ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      Internship {program.internshipRequired ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  {program.internshipRequired && program.minimumDuration && (
                    <span className="text-sm text-gray-600">
                      {program.minimumDuration} months minimum
                    </span>
                  )}
                </div>
                {program.internshipRequired && program.semester && (
                  <p className="text-sm text-gray-600 mt-2">
                    Required in Semester {program.semester}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  program.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {program.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}