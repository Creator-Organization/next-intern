'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Upload, Award } from 'lucide-react'

const engineeringDomains = [
  "Software Engineering",
  "Web Development", 
  "Mobile App Development",
  "Data Science & Analytics",
  "AI/Machine Learning",
  "DevOps & Cloud",
  "Cybersecurity",
  "Blockchain Development",
  "Game Development",
  "Embedded Systems",
  "IoT Development",
  "Computer Vision",
  "Natural Language Processing",
  "Robotics",
  "Network Engineering"
]

const resumeSectionOptions = [
  "Research",
  "Achievements", 
  "Prior Projects",
  "Work Experience",
  "Education",
  "Certifications",
  "Publications",
  "Skills Assessment",
  "Leadership Experience",
  "Extracurricular Activities"
]

interface FormData {
  title: string
  domain: string
  skills: string
  duration: string
  deadline: string
  positions: string
  studentsRequired: string
  description: string
  stipend: boolean
  ppo: boolean
  certificate: boolean
  mentorship: boolean
  offerLetter: boolean
  remote: boolean
  hybrid: boolean
  flexibleHours: boolean
  paid: boolean
  budget: string
  offerConditions: string
  socialLinks: string
}

export default function PostOpportunityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'internship' | 'project'>('internship')
  const [customDomains, setCustomDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [selectedResumeSections, setSelectedResumeSections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    domain: '',
    skills: '',
    duration: '',
    deadline: '',
    positions: '1',
    studentsRequired: '3',
    description: '',
    stipend: false,
    ppo: false,
    certificate: false,
    mentorship: false,
    offerLetter: false,
    remote: false,
    hybrid: false,
    flexibleHours: false,
    paid: false,
    budget: '',
    offerConditions: '',
    socialLinks: ''
  })

  const addCustomDomain = () => {
    if (newDomain.trim() && !customDomains.includes(newDomain.trim())) {
      setCustomDomains([...customDomains, newDomain.trim()])
      setNewDomain('')
    }
  }

  const removeCustomDomain = (domain: string) => {
    setCustomDomains(customDomains.filter(d => d !== domain))
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsLoading(true)
    
    try {
      const opportunityData = {
        ...formData,
        type: activeTab.toUpperCase(),
        skills: formData.skills.split(',').map(s => s.trim()),
        resumeSectionsToView: selectedResumeSections,
        isDraft
      }

      const response = await fetch('/api/industry/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunityData)
      })

      if (response.ok) {
        router.push('/industry?posted=true')
      } else {
        throw new Error('Failed to post opportunity')
      }
    } catch (error) {
      console.error('Error posting opportunity:', error)
      // Add error handling UI here
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: keyof FormData, checked: boolean) => {
    updateFormData(field, checked)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-manrope mb-2">Post New Opportunity</h1>
        <p className="text-gray-600">Create an internship, project, or freelance opportunity for candidates</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'internship' 
              ? 'bg-white text-teal-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('internship')}
        >
          Post Internship
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'project' 
              ? 'bg-white text-teal-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('project')}
        >
          Post Project
        </button>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-600" />
            {activeTab === 'internship' ? 'Post New Internship Opportunity' : 'Post New Project Opportunity'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {activeTab === 'internship' 
              ? 'Create a detailed internship posting to attract talented engineering students'
              : 'Create a project posting for students to work on real-world engineering challenges'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Domain Management */}
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Manage Engineering Domains</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add custom engineering domain..."
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomDomain()}
              />
              <Button onClick={addCustomDomain}>Add</Button>
            </div>
            {customDomains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customDomains.map((domain) => (
                  <span key={domain} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {domain}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeCustomDomain(domain)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={activeTab === 'internship' ? 'Internship Title *' : 'Project Title *'}
              placeholder={activeTab === 'internship' ? 'e.g., Full Stack Developer Intern' : 'e.g., E-commerce Platform Development'}
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Engineering Domain *</label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100"
                value={formData.domain}
                onChange={(e) => updateFormData('domain', e.target.value)}
              >
                <option value="">Select engineering domain</option>
                {[...engineeringDomains, ...customDomains].map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills */}
          <Input
            label="Required Technical Skills *"
            placeholder="e.g., React, Node.js, Python, MongoDB, AWS, Docker"
            value={formData.skills}
            onChange={(e) => updateFormData('skills', e.target.value)}
          />
          <p className="text-xs text-gray-500">Separate skills with commas</p>

          {/* Duration and Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {activeTab === 'internship' ? 'Internship Duration *' : 'Project Duration *'}
              </label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100"
                value={formData.duration}
                onChange={(e) => updateFormData('duration', e.target.value)}
              >
                <option value="">Select duration</option>
                <option value="2-weeks">2 Weeks</option>
                <option value="1-month">1 Month</option>
                <option value="2-months">2 Months</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
                <option value="flexible">Flexible Duration</option>
              </select>
            </div>
            <Input
              label="Application Deadline *"
              type="date"
              value={formData.deadline}
              onChange={(e) => updateFormData('deadline', e.target.value)}
            />
            <Input
              label={activeTab === 'internship' ? 'Number of Positions' : 'Students Required'}
              type="number"
              placeholder={activeTab === 'internship' ? '1' : '3'}
              min="1"
              value={activeTab === 'internship' ? formData.positions : formData.studentsRequired}
              onChange={(e) => updateFormData(
                activeTab === 'internship' ? 'positions' : 'studentsRequired', 
                e.target.value
              )}
            />
          </div>

          {/* Resume Sections */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Student Resume Sections to View</h3>
            <p className="text-sm text-gray-600">
              Select which sections of student resumes you want to see to maintain their privacy
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {resumeSectionOptions.map((section) => (
                <div key={section} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={section}
                    checked={selectedResumeSections.includes(section)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResumeSections([...selectedResumeSections, section])
                      } else {
                        setSelectedResumeSections(selectedResumeSections.filter(s => s !== section))
                      }
                    }}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor={section} className="text-sm text-gray-700">{section}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <Textarea
            label={activeTab === 'internship' ? 'Internship Description *' : 'Project Description *'}
            placeholder={
              activeTab === 'internship'
                ? 'Describe the internship, key responsibilities, learning outcomes, and what makes this opportunity exciting for engineering students...'
                : 'Describe the project goals, deliverables, technologies to be used, and learning outcomes for students...'
            }
            rows={5}
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
          />

          {/* Benefits and Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">
                {activeTab === 'internship' ? 'Compensation & Benefits' : 'Project Compensation'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="compensation"
                    checked={activeTab === 'internship' ? formData.stipend : formData.paid}
                    onChange={(e) => handleCheckboxChange(
                      activeTab === 'internship' ? 'stipend' : 'paid', 
                      e.target.checked
                    )}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="compensation" className="text-sm text-gray-700">
                    {activeTab === 'internship' ? 'Stipend Available' : 'This is a Paid Project'}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="certificate"
                    checked={formData.certificate}
                    onChange={(e) => handleCheckboxChange('certificate', e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="certificate" className="text-sm text-gray-700">Completion Certificate</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mentorship"
                    checked={formData.mentorship}
                    onChange={(e) => handleCheckboxChange('mentorship', e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="mentorship" className="text-sm text-gray-700">
                    {activeTab === 'internship' ? '1-on-1 Mentorship' : 'Technical Mentorship'}
                  </label>
                </div>
                {activeTab === 'internship' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ppo"
                      checked={formData.ppo}
                      onChange={(e) => handleCheckboxChange('ppo', e.target.checked)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="ppo" className="text-sm text-gray-700">PPO/Full-time Offer Opportunity</label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">
                {activeTab === 'internship' ? 'Work Arrangement' : 'Project Details'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={formData.remote}
                    onChange={(e) => handleCheckboxChange('remote', e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="remote" className="text-sm text-gray-700">Remote Work Available</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="flexible"
                    checked={formData.flexibleHours}
                    onChange={(e) => handleCheckboxChange('flexibleHours', e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="flexible" className="text-sm text-gray-700">Flexible Working Hours</label>
                </div>
                {activeTab === 'project' && (
                  <Input
                    label="Budget (if paid)"
                    placeholder="₹50,000"
                    value={formData.budget}
                    onChange={(e) => updateFormData('budget', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Offer Letter Section */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Offer Letter & Social Sharing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Offer Letter Conditions"
                placeholder="Specify conditions for offer letter (e.g., completion requirements, performance criteria...)"
                rows={3}
                value={formData.offerConditions}
                onChange={(e) => updateFormData('offerConditions', e.target.value)}
              />
              <div className="space-y-2">
                <Input
                  label="Social Media Links for Sharing"
                  placeholder="LinkedIn, Twitter, Company website..."
                  value={formData.socialLinks}
                  onChange={(e) => updateFormData('socialLinks', e.target.value)}
                />
                <p className="text-xs text-gray-500">Links where students can share their offer letters</p>
              </div>
            </div>
          </div>

          {/* NDA Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">NDA Document (Optional)</label>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".pdf" 
                className="flex h-10 w-full rounded-md border border-gray-100 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100" 
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              Upload if students need to sign an NDA
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-gradient-to-r from-teal-600 to-green-600" 
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'internship' ? 'Post Internship Opportunity' : 'Post Project Opportunity'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
            >
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}