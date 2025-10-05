import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { 
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function InstituteDomains() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute with verified domains
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id },
    include: {
      domains: {
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Domain Verification</h1>
        <p className="text-gray-600 mt-2">
          Verify email domains to automatically enroll students
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              How Domain Verification Works
            </h3>
            <p className="text-sm text-blue-800">
              Add your institute&#39;s email domain (e.g., @college.edu) to automatically link students who sign up with matching email addresses. 
              Students with verified domains will be automatically enrolled under your institute.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Domain Form */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-manrope">Add New Domain</h2>
        <form className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="e.g., college.edu or university.ac.in"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          Enter domain without @ symbol. Example: college.edu
        </p>
      </Card>

      {/* Verified Domains List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope">Verified Domains</h2>

        {institute.domains.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Domains Added</h3>
            <p className="text-gray-600">
              Add your first domain to enable automatic student enrollment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {institute.domains.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    domain.isVerified 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    {domain.isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-medium text-gray-900">
                        @{domain.domain}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        domain.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {domain.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    {domain.verifiedAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Verified on {new Date(domain.verifiedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Student Count Info */}
      {institute.domains.some(d => d.isVerified) && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                Auto-Enrollment Active
              </h3>
              <p className="text-sm text-green-800">
                Students signing up with verified email domains will be automatically linked to your institute. 
                You can manage enrolled students from the Students page.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}