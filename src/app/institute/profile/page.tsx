import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { 
  Building,
  MapPin,
  Mail,
  Shield,
  Award,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function InstituteProfile() {
  const session = await auth();

  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  // Fetch institute data
  const institute = await prisma.institute.findUnique({
    where: { userId: session.user.id }
  });

  if (!institute) {
    redirect('/institute/profile?setup=true');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-manrope">Institute Profile</h1>
        <p className="text-gray-600 mt-2">Manage your institute information and settings</p>
      </div>

      {/* Profile Form */}
      <form className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
            <Building className="w-5 h-5 text-primary-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Name *
              </label>
              <input
                type="text"
                defaultValue={institute.instituteName}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter institute name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institute Type *
              </label>
              <select
                defaultValue={institute.instituteType}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="UNIVERSITY">University</option>
                <option value="COLLEGE">College</option>
                <option value="TECHNICAL_INSTITUTE">Technical Institute</option>
                <option value="COMMUNITY_COLLEGE">Community College</option>
                <option value="VOCATIONAL_SCHOOL">Vocational School</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                defaultValue={institute.description || ''}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description of your institute..."
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-600" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                defaultValue={institute.email}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="contact@institute.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={institute.phone || ''}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                defaultValue={institute.websiteUrl || ''}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://www.institute.edu"
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                defaultValue={institute.address}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                defaultValue={institute.city}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                defaultValue={institute.state}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                defaultValue={institute.country}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Country"
              />
            </div>
          </div>
        </Card>

        {/* Accreditation */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-manrope flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            Accreditation & Verification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accreditation Number
              </label>
              <input
                type="text"
                defaultValue={institute.accreditationNumber || ''}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Accreditation number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Shield className={`w-5 h-5 ${institute.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className={`font-medium ${institute.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {institute.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ugcApproved"
                defaultChecked={institute.ugcApproved}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="ugcApproved" className="text-sm font-medium text-gray-700">
                UGC Approved
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="aicteApproved"
                defaultChecked={institute.aicteApproved}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="aicteApproved" className="text-sm font-medium text-gray-700">
                AICTE Approved
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="secondary">
            Cancel
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}