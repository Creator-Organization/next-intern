// src/components/auth/RegisterForm.tsx
// Register Form Component - NextIntern v2 - Fixed

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { UserType } from '@prisma/client'
import { getDashboardUrl } from '@/lib/auth-utils'

interface RegisterFormProps {
  userType: UserType
  onSwitchToLogin?: () => void
}

interface CandidateFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  college?: string
}

interface IndustryFormData {
  email: string
  password: string
  confirmPassword: string
  companyName: string
  industry?: string
}

interface InstituteFormData {
  email: string
  password: string
  confirmPassword: string
  instituteName: string
  instituteType?: string
  affiliatedUniversity?: string
}

type RegisterFormData = CandidateFormData | IndustryFormData | InstituteFormData

export function RegisterForm({ userType, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>(() => {
    switch (userType) {
      case UserType.CANDIDATE:
        return { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', college: '' }
      case UserType.INDUSTRY:
        return { email: '', password: '', confirmPassword: '', companyName: '', industry: '' }
      case UserType.INSTITUTE:
        return { email: '', password: '', confirmPassword: '', instituteName: '', instituteType: '', affiliatedUniversity: '' }
      default:
        return { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', college: '' }
    }
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)

  // Password validation
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', message: 'Too short' }
    if (password.length < 8) return { strength: 'fair', message: 'Could be longer' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'good', message: 'Add numbers and mixed case' }
    }
    return { strength: 'strong', message: 'Strong password' }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ''

  // Email validation
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null)
      return
    }

    setCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setEmailAvailable(data.available)
    } catch {
      setEmailAvailable(null)
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      // Prepare form data based on user type
      let requestData: any = {
        email: formData.email,
        password: formData.password,
        userType
      }

      if (userType === UserType.CANDIDATE) {
        const data = formData as CandidateFormData
        requestData = {
          ...requestData,
          firstName: data.firstName,
          lastName: data.lastName
        }
      } else if (userType === UserType.INDUSTRY) {
        const data = formData as IndustryFormData
        requestData = {
          ...requestData,
          companyName: data.companyName,
          industry: data.industry
        }
      } else if (userType === UserType.INSTITUTE) {
        const data = formData as InstituteFormData
        requestData = {
          ...requestData,
          instituteName: data.instituteName,
          instituteType: data.instituteType
        }
      }

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        // Auto sign in after registration
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (signInResult?.ok) {
          // Get dashboard URL based on user type
          const dashboardUrl = getDashboardUrl(userType)
          router.push(dashboardUrl)
        } else {
          // Registration succeeded but auto-login failed, redirect to login
          router.push(`/auth/signin?email=${encodeURIComponent(formData.email)}`)
        }
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const callbackUrl = getDashboardUrl(userType)
      await signIn('google', { callbackUrl })
    } catch {
      setError('Google sign-in failed')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
    
    // Check email availability when email changes
    if (field === 'email') {
      const timeoutId = setTimeout(() => checkEmailAvailability(value), 500)
      return () => clearTimeout(timeoutId)
    }
  }

  // Form validation based on user type
  const isFormValid = () => {
    const baseValid = formData.email && formData.password && passwordsMatch && emailAvailable

    if (!baseValid) return false

    switch (userType) {
      case UserType.CANDIDATE:
        const candidateData = formData as CandidateFormData
        return candidateData.firstName && candidateData.lastName
      case UserType.INDUSTRY:
        const industryData = formData as IndustryFormData
        return industryData.companyName
      case UserType.INSTITUTE:
        const instituteData = formData as InstituteFormData
        return instituteData.instituteName
      default:
        return true
    }
  }

  // Get user type display name
  const getUserTypeLabel = () => {
    switch (userType) {
      case UserType.CANDIDATE:
        return 'Candidate'
      case UserType.INDUSTRY:
        return 'Company'
      case UserType.INSTITUTE:
        return 'Institute'
      default:
        return 'User'
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create Account
        </CardTitle>
        <p className="text-gray-600">
          Join as a {getUserTypeLabel()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate-specific fields */}
          {userType === UserType.CANDIDATE && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                value={(formData as CandidateFormData).firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={(formData as CandidateFormData).lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Industry-specific fields */}
          {userType === UserType.INDUSTRY && (
            <>
              <Input
                label="Company Name"
                placeholder="Your Company Name"
                value={(formData as IndustryFormData).companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                label="Industry (Optional)"
                placeholder="Technology, Healthcare, Finance..."
                value={(formData as IndustryFormData).industry || ''}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                disabled={isLoading}
              />
            </>
          )}

          {/* Institute-specific fields */}
          {userType === UserType.INSTITUTE && (
            <>
              <Input
                label="Institute Name"
                placeholder="Your Institution Name"
                value={(formData as InstituteFormData).instituteName}
                onChange={(e) => handleInputChange('instituteName', e.target.value)}
                required
                disabled={isLoading}
              />
              <Input
                label="Institute Type (Optional)"
                placeholder="University, College, Technical Institute..."
                value={(formData as InstituteFormData).instituteType || ''}
                onChange={(e) => handleInputChange('instituteType', e.target.value)}
                disabled={isLoading}
              />
            </>
          )}
          
          {/* Email with availability check */}
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
            {formData.email && (
              <div className="absolute right-3 top-9">
                {checkingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : emailAvailable === true ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : emailAvailable === false ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            )}
            {emailAvailable === false && (
              <p className="text-xs text-red-600 mt-1">Email already registered</p>
            )}
          </div>
          
          {/* Password with strength indicator */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {formData.password && (
              <div className="mt-1 flex items-center gap-2">
                <div className={`h-1 flex-1 rounded ${
                  passwordStrength.strength === 'weak' ? 'bg-red-200' :
                  passwordStrength.strength === 'fair' ? 'bg-yellow-200' :
                  passwordStrength.strength === 'good' ? 'bg-blue-200' : 'bg-green-200'
                }`}>
                  <div className={`h-full rounded transition-all ${
                    passwordStrength.strength === 'weak' ? 'w-1/4 bg-red-500' :
                    passwordStrength.strength === 'fair' ? 'w-2/4 bg-yellow-500' :
                    passwordStrength.strength === 'good' ? 'w-3/4 bg-blue-500' : 'w-full bg-green-500'
                  }`} />
                </div>
                <span className={`text-xs ${
                  passwordStrength.strength === 'weak' ? 'text-red-600' :
                  passwordStrength.strength === 'fair' ? 'text-yellow-600' :
                  passwordStrength.strength === 'good' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  {passwordStrength.message}
                </span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              disabled={isLoading}
            />
            {formData.confirmPassword && (
              <div className="absolute right-3 top-9">
                {passwordsMatch ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>
        
        {onSwitchToLogin && (
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              onClick={onSwitchToLogin}
            >
              Sign in here
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  )
}