// src/components/auth/LoginForm.tsx
// Login Form Component - Internship And Project v2 - Fixed

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserType } from '@prisma/client';
import { getDashboardUrl } from '@/lib/auth-utils';

interface LoginFormProps {
  userType?: UserType;
  onSwitchToRegister?: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ userType, onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user type display name
  const getUserTypeDisplayName = (userType?: UserType) => {
    if (!userType) return 'User';

    const displayNames = {
      [UserType.CANDIDATE]: 'Candidate',
      [UserType.INDUSTRY]: 'Company',
      [UserType.INSTITUTE]: 'Institute',
      [UserType.ADMIN]: 'Admin',
    };

    return displayNames[userType] || 'User';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Redirect to appropriate dashboard based on user type
        const dashboardUrl = userType
          ? getDashboardUrl(userType)
          : '/candidate';
        router.push(dashboardUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', {
        callbackUrl: userType ? getDashboardUrl(userType) : '/',
      });
    } catch (err) {
      setError('Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome Back
        </CardTitle>
        <p className="text-gray-600">
          {userType ? getUserTypeDisplayName(userType) : 'User'} Sign In
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            style={{
              backgroundColor: '#0891b2',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              opacity:
                isLoading || !formData.email || !formData.password
                  ? '0.5'
                  : '1',
              cursor:
                isLoading || !formData.email || !formData.password
                  ? 'not-allowed'
                  : 'pointer',
            }}
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
          Sign in with Google
        </Button>

        {onSwitchToRegister && (
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              onClick={onSwitchToRegister}
            >
              Sign up here
            </button>
          </p>
        )}

        <p className="text-center">
          <a
            href="/auth/forgot-password"
            className="text-primary-600 hover:text-primary-700 text-sm hover:underline"
          >
            Forgot your password?
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
