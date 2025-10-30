/**
 * Authentication Error Page
 * Internship And Project - Authentication System
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication. Please try again.',
  CredentialsSignin: 'Invalid email or password. Please check your credentials.',
  EmailCreateAccount: 'Could not create account. The email address may already be in use.',
  OAuthSignin: 'Error signing in with OAuth provider.',
  OAuthCallback: 'OAuth provider returned an error.',
  OAuthCreateAccount: 'Could not create account with OAuth provider.',
  EmailSignin: 'Email sign-in error occurred.',
  Callback: 'OAuth callback error occurred.',
  OAuthAccountNotLinked: 'Your account is already linked to a different provider.',
  SessionRequired: 'You must be signed in to access this page.'
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

  const handleRetryAuth = () => {
    window.location.href = '/auth/signin'
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Authentication Error
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600">
                {errorMessage}
              </p>
              {error !== 'Default' && (
                <p className="text-xs text-gray-400">
                  Error Code: {error}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRetryAuth}
                className="w-full bg-primary hover:bg-primary-hover"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="secondary"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Still having trouble?
              </p>
              <div className="space-y-1 text-sm">
                <a 
                  href="/help" 
                  className="block text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Contact Support
                </a>
                <a 
                  href="/auth/recovery" 
                  className="block text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Reset Password
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}