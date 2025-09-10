// src/app/auth/reset-password/page.tsx
// Reset Password Page - Phase 2 Day 5

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [tokenError, setTokenError] = useState('')

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    match: false
  })

  // Check for token on mount
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset.')
    }
  }, [token])

  // Update password strength indicators
  useEffect(() => {
    const { password, confirmPassword } = passwords
    
    setPasswordStrength({
      minLength: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      match: password === confirmPassword && password.length > 0
    })
  }, [passwords])

  const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setTokenError('Invalid or missing reset token.')
      return
    }

    const { password, confirmPassword } = passwords
    
    // Client-side validation
    const newErrors: string[] = []
    
    if (password.length < 8) {
      newErrors.push('Password must be at least 8 characters long')
    }
    
    if (!/[a-z]/.test(password)) {
      newErrors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[A-Z]/.test(password)) {
      newErrors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/\d/.test(password)) {
      newErrors.push('Password must contain at least one number')
    }
    
    if (password !== confirmPassword) {
      newErrors.push('Passwords do not match')
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Handle Zod validation errors
          const validationErrors = data.details.map((detail: { message: string }) => detail.message)
          setErrors(validationErrors)
        } else {
          setErrors([data.error || 'Failed to reset password. Please try again.'])
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors(['Network error. Please check your connection and try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              
              <button
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h1>
              
              <p className="text-gray-600 mb-6">
                {tokenError}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/forgot-password')}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Request New Reset Link
                </button>
                
                <Link 
                  href="/auth/signin"
                  className="block w-full text-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-teal-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Set New Password
            </h1>
            
            <p className="text-gray-600">
              Choose a strong password for your NextIntern account.
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Please fix the following errors:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  value={passwords.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {passwords.password && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
                <div className="space-y-2">
                  {[
                    { key: 'minLength', text: 'At least 8 characters', met: passwordStrength.minLength },
                    { key: 'hasLower', text: 'One lowercase letter', met: passwordStrength.hasLower },
                    { key: 'hasUpper', text: 'One uppercase letter', met: passwordStrength.hasUpper },
                    { key: 'hasNumber', text: 'One number', met: passwordStrength.hasNumber },
                    { key: 'match', text: 'Passwords match', met: passwordStrength.match }
                  ].map((req) => (
                    <div key={req.key} className={`flex items-center text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-200'}`}>
                        {req.met && <CheckCircle className="w-3 h-3" />}
                      </div>
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || Object.values(passwordStrength).some(v => !v)}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/auth/signin"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}