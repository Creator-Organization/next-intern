'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, DollarSign, FileText, AlertCircle, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Location {
  id: string
  city: string
  state: string
  country: string
}

interface Opportunity {
  id: string
  title: string
  description: string
  type: string
  workType: string
  categoryId: string
  locationId: string
  stipend: number | null
  currency: string
  duration: number
  requirements: string
  preferredSkills: string | null
  minQualification: string | null
  experienceRequired: number | null
  applicationDeadline: Date | null
  startDate: Date | null
  isActive: boolean
  approvalStatus: string
  rejectionReason: string | null
}

interface Props {
  opportunity: Opportunity
  categories: Category[]
  locations: Location[]
}

export default function EditOpportunityForm({ opportunity, categories, locations }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: opportunity.title,
    description: opportunity.description,
    type: opportunity.type,
    workType: opportunity.workType,
    categoryId: opportunity.categoryId,
    locationId: opportunity.locationId,
    stipend: opportunity.stipend?.toString() || '',
    currency: opportunity.currency,
    duration: opportunity.duration.toString(),
    requirements: opportunity.requirements,
    preferredSkills: opportunity.preferredSkills || '',
    minQualification: opportunity.minQualification || '',
    experienceRequired: opportunity.experienceRequired?.toString() || '0',
    applicationDeadline: opportunity.applicationDeadline 
      ? new Date(opportunity.applicationDeadline).toISOString().split('T')[0] 
      : '',
    startDate: opportunity.startDate 
      ? new Date(opportunity.startDate).toISOString().split('T')[0] 
      : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if opportunity is already approved
    if (opportunity.approvalStatus === 'APPROVED') {
      setError('Cannot edit approved opportunities. Please contact support.')
      setLoading(false)
      return
    }

    // Validation
    if (formData.title.length < 10 || formData.title.length > 100) {
      setError('Title must be between 10 and 100 characters')
      setLoading(false)
      return
    }

    if (formData.description.length < 50 || formData.description.length > 2000) {
      setError('Description must be between 50 and 2000 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stipend: formData.stipend ? parseInt(formData.stipend) : null,
          duration: parseInt(formData.duration),
          experienceRequired: parseInt(formData.experienceRequired)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update opportunity')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/industry/opportunities')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update opportunity')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete opportunity')
      }

      router.push('/industry/opportunities')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Opportunity Updated Successfully!</h3>
          <p className="text-gray-600 mb-4">Redirecting to your opportunities...</p>
        </CardContent>
      </Card>
    )
  }

  const getApprovalStatusCard = () => {
    if (opportunity.approvalStatus === 'PENDING') {
      return (
        <Card className="bg-yellow-50 border-2 border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">⏳ Pending Admin Approval</p>
                <p className="text-xs text-yellow-800 mt-1">
                  This opportunity is awaiting review by our admin team. You can still edit it before approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (opportunity.approvalStatus === 'APPROVED') {
      return (
        <Card className="bg-green-50 border-2 border-green-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900">✅ Approved & Live</p>
                <p className="text-xs text-green-800 mt-1">
                  This opportunity is live and visible to candidates. Editing is disabled. Contact support to make changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (opportunity.approvalStatus === 'REJECTED') {
      return (
        <Card className="bg-red-50 border-2 border-red-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">❌ Rejected by Admin</p>
                {opportunity.rejectionReason && (
                  <p className="text-xs text-red-800 mt-1">
                    <strong>Reason:</strong> {opportunity.rejectionReason}
                  </p>
                )}
                <p className="text-xs text-red-700 mt-2">
                  Please fix the issues and resubmit, or delete this and create a new opportunity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Approval Status Card */}
        {getApprovalStatusCard()}

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                minLength={10}
                maxLength={100}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="PROJECT">Project</option>
                <option value="FREELANCING">Freelancing</option>
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type *
              </label>
              <select
                required
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                required
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city}, {loc.state}, {loc.country}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle>Description & Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                minLength={50}
                maxLength={2000}
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements *
              </label>
              <textarea
                required
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Skills (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.preferredSkills}
                onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
                disabled={opportunity.approvalStatus === 'APPROVED'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </CardContent>
        </Card>

        {/* Compensation & Duration */}
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Compensation & Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stipend (₹) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  disabled={opportunity.approvalStatus === 'APPROVED'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (months) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  disabled={opportunity.approvalStatus === 'APPROVED'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  disabled={opportunity.approvalStatus === 'APPROVED'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  disabled={opportunity.approvalStatus === 'APPROVED'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {opportunity.approvalStatus !== 'APPROVED' && (
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
            >
              {loading ? 'Updating...' : 'Update Opportunity'}
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Opportunity
          </Button>
        </div>
      </div>
    </form>
  )
}