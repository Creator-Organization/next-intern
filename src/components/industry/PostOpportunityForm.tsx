'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, DollarSign, FileText, AlertCircle } from 'lucide-react'

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

interface PostingLimits {
  INTERNSHIP: number
  PROJECT: number
  FREELANCING: number
}

interface Props {
  categories: Category[]
  locations: Location[]
  isPremium: boolean
  postingLimits: PostingLimits | null
}

export default function PostOpportunityForm({ categories, locations, isPremium, postingLimits }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'INTERNSHIP',
    workType: 'REMOTE',
    categoryId: categories[0]?.id || '',
    locationId: locations[0]?.id || '',
    stipend: '',
    currency: 'INR',
    duration: '',
    requirements: '',
    preferredSkills: '',
    minQualification: '',
    experienceRequired: '0',
    applicationDeadline: '',
    startDate: ''
  })

  const canPostType = (type: string) => {
    if (isPremium) return true
    if (!postingLimits) return true
    
    if (type === 'FREELANCING') return false
    return postingLimits[type as keyof PostingLimits] > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.title.length < 10 || formData.title.length > 100) {
      setError('Title must be between 10 and 100 characters')
      return
    }

    if (formData.description.length < 50 || formData.description.length > 2000) {
      setError('Description must be between 50 and 2000 characters')
      return
    }

    if (!formData.requirements || formData.requirements.length < 10) {
      setError('Requirements must be at least 10 characters')
      return
    }

    if (!canPostType(formData.type)) {
      setError(`You cannot post ${formData.type} opportunities. ${formData.type === 'FREELANCING' ? 'Upgrade to premium.' : 'Monthly limit reached.'}`)
      return
    }

    // ✅ SAVE TO SESSION STORAGE AND REDIRECT TO T&C
    const dataToSave = {
      ...formData,
      stipend: formData.stipend ? parseInt(formData.stipend) : null,
      duration: formData.duration ? parseInt(formData.duration) : 1,
      experienceRequired: parseInt(formData.experienceRequired),
      showCompanyName: true
    };

    sessionStorage.setItem('opportunityFormData', JSON.stringify(dataToSave));
    toast.success('Form saved! Please accept terms to continue.');
    router.push('/industry/post/terms');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Frontend Developer Intern"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opportunity Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="INTERNSHIP" disabled={!canPostType('INTERNSHIP')}>
                  Internship {!isPremium && postingLimits && ` (${postingLimits.INTERNSHIP} left)`}
                </option>
                <option value="PROJECT" disabled={!canPostType('PROJECT')}>
                  Project {!isPremium && postingLimits && ` (${postingLimits.PROJECT} left)`}
                </option>
                <option value="FREELANCING" disabled={!canPostType('FREELANCING')}>
                  Freelancing {!isPremium && ' (Premium Only)'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Type *
              </label>
              <select
                required
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {categories.length === 0 && <option value="">No categories available</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Note: Categories need to be added to the database first. Contact admin.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                required
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {locations.length === 0 && <option value="">No locations available</option>}
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.city}, {loc.state}, {loc.country}
                  </option>
                ))}
              </select>
              {locations.length === 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Note: Locations need to be added to the database first. Contact admin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Detailed description of the opportunity, responsibilities, and what candidates will learn..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements *
              </label>
              <textarea
                required
                minLength={10}
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Required skills and qualifications..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                placeholder="Nice-to-have skills and qualifications..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Qualification (Optional)
              </label>
              <input
                type="text"
                value={formData.minQualification}
                onChange={(e) => setFormData({ ...formData, minQualification: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </div>
          </CardContent>
        </Card>

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
                  Monthly Stipend (₹) - Optional
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., 10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typical range: ₹5,000 - ₹50,000/month
                </p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., 6"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typically 3-6 months for internships
                </p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Required (years)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.experienceRequired}
                onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                0 for freshers/students
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canPostType(formData.type)}
            className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
          >
            Continue to Terms →
          </Button>
        </div>
      </div>
    </form>
  )
}