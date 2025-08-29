/**
 * Sign In Page
 * NextIntern - Authentication System
 */

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { UserType } from '@prisma/client'
import { UserTypeSelector } from '@/components/auth/UserTypeSelector'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(true)

  useEffect(() => {
    // Check if user type is passed as URL parameter
    const userTypeParam = searchParams.get('type')
    if (userTypeParam === 'student' || userTypeParam === 'company') {
      setSelectedUserType(userTypeParam === 'student' ? UserType.STUDENT : UserType.COMPANY)
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
    const currentType = selectedUserType === UserType.STUDENT ? 'student' : 'company'
    window.location.href = `/auth/signup?type=${currentType}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 font-manrope mb-2">
            NextIntern
          </h1>
          <p className="text-gray-600">
            Sign in to your account
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
          /* Login Form */
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={handleBackToTypeSelection}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to account type selection
            </button>

            {/* Login Form */}
            <LoginForm
              userType={selectedUserType || undefined}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </div>
        )}

        {/* Footer Links */}
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