'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { UserType } from '@prisma/client'
import { UserTypeSelector } from '@/components/auth/UserTypeSelector'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

function SignInContent() {
  const searchParams = useSearchParams()
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(true)

  useEffect(() => {
    const userTypeParam = searchParams.get('type')
    
    const userTypeMap: { [key: string]: UserType } = {
      'candidate': UserType.CANDIDATE,
      'student': UserType.CANDIDATE,
      'industry': UserType.INDUSTRY,
      'company': UserType.INDUSTRY,
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

  const handleSwitchToRegister = () => {
    const typeParam = {
      [UserType.CANDIDATE]: 'candidate',
      [UserType.INDUSTRY]: 'industry',
      [UserType.INSTITUTE]: 'institute',
      [UserType.ADMIN]: 'admin'
    }[selectedUserType!] || 'candidate'

    window.location.href = `/auth/signup?type=${typeParam}`
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 font-manrope mb-2">
            Internship And Project
          </h1>
          <p className="text-gray-600">
            {showTypeSelector ? 'Sign in to your account' : `Sign in as ${getUserTypeDisplayName()}`}
          </p>
        </div>

        {showTypeSelector ? (
          <Card className="p-6">
            <CardContent className="p-0">
              <UserTypeSelector
                selectedType={selectedUserType}
                onSelect={handleUserTypeSelect}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleBackToTypeSelection}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to account type selection
            </button>

            <LoginForm
              userType={selectedUserType || undefined}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </div>
        )}

        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Need help? <a href="/help" className="text-primary-600 hover:underline">Contact Support</a>
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/privacy" className="hover:text-gray-900">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}