// src/app/auth/forgot-password/page.tsx
// Forgot Password Page - Phase 2 Day 5

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    retryAfter?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else if (response.status === 429) {
        // Rate limited
        setError(data.error || 'Too many requests. Please try again later.')
        if (data.retryAfter) {
          setRateLimitInfo({ retryAfter: data.retryAfter })
        }
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-teal-100">
            {/* Success State */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              
              <p className="text-gray-600 mb-6">
                If an account with <strong>{email}</strong> exists, we&#39;ve sent a password reset link to your email address.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">What&#39;s next?</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the reset link within 15 minutes</li>
                      <li>Create a new secure password</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Back to Sign In
                </button>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                    setError('')
                  }}
                  className="w-full text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Try Different Email
                </button>
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
              <Mail className="w-8 h-8 text-teal-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            
            <p className="text-gray-600">
              Enter your email address and we&#39;ll send you a link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                {rateLimitInfo.retryAfter && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Try again after: {new Date(rateLimitInfo.retryAfter).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign in here
                </Link>
              </p>
              
              <Link 
                href="/"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}