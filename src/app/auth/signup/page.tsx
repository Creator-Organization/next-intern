// src/app/auth/signup/page.tsx
// Sign Up Page - NextIntern v2 - Clean Auth Style

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserType } from '@prisma/client'
import { UserTypeSelector } from '@/components/auth/UserTypeSelector'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(true)

  useEffect(() => {
    // Check if user type is passed as URL parameter - Updated for new user types
    const userTypeParam = searchParams.get('type')
    
    // Map URL params to new user types
    const userTypeMap: { [key: string]: UserType } = {
      'candidate': UserType.CANDIDATE,
      'student': UserType.CANDIDATE,     // Legacy support
      'industry': UserType.INDUSTRY,
      'company': UserType.INDUSTRY,      // Legacy support
      'institute': UserType.INSTITUTE,
      'admin': UserType.ADMIN
    }

    if (userTypeParam && userTypeMap[userTypeParam]) {
      setSelectedUserType(userTypeMap[userTypeParam])
      setShowTypeSelector(false)
    }
  }, [searchParams])

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type)
    setShowTypeSelector(false)
  }

  const handleBackToTypeSelection = () => {
    setSelectedUserType(null)
    setShowTypeSelector(true)
  }

  const handleSwitchToLogin = () => {
    // Map user types to URL params for login
    const typeParam = {
      [UserType.CANDIDATE]: 'candidate',
      [UserType.INDUSTRY]: 'industry',
      [UserType.INSTITUTE]: 'institute',
      [UserType.ADMIN]: 'admin'
    }[selectedUserType!] || 'candidate'

    window.location.href = `/auth/signin?type=${typeParam}`
  }

  // Get user type display name
  const getUserTypeDisplayName = () => {
    if (!selectedUserType) return ''
    
    const displayNames = {
      [UserType.CANDIDATE]: 'Candidate',
      [UserType.INDUSTRY]: 'Company',
      [UserType.INSTITUTE]: 'Institute',
      [UserType.ADMIN]: 'Admin'
    }
    
    return displayNames[selectedUserType]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      
      {/* Brand Logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
          NextIntern
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 font-manrope mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            {showTypeSelector ? 'Join NextIntern today' : `Join as ${getUserTypeDisplayName()}`}
          </p>
        </div>

        {showTypeSelector ? (
          /* User Type Selection */
          <Card className="p-6">
            <CardContent className="p-0">
              <UserTypeSelector
                selectedType={selectedUserType}
                onSelect={handleUserTypeSelect}
              />
            </CardContent>
          </Card>
        ) : (
          /* Registration Form */
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={handleBackToTypeSelection}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to account type selection
            </button>

            {/* Register Form */}
            <RegisterForm
              userType={selectedUserType!}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        )}

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Need help? <Link href="/help" className="text-primary-600 hover:underline">Contact Support</Link>
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}