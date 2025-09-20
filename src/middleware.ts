/**
 * Authentication Middleware
 * NextIntern v2 - Updated for 28-Table Schema
 * 
 * Protects routes and handles user type-based authorization
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { UserType } from '@prisma/client'

// Define protected routes - Updated for new user types
const protectedRoutes = {
  candidate: ['/candidate'],    // Updated from student
  industry: ['/industry'],      // Updated from company
  institute: ['/institute'],    // New user type
  admin: ['/admin']
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/how-it-works',
  '/internships',
  '/opportunities',             // Updated route name
  '/companies',
  '/industries',                // New route for industries
  '/institutes',                // New route for institutes
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/faq',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/recovery',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/search',
  '/categories',
  '/locations',
  '/blog',
  '/resources',
  '/success-stories',
  '/help'
]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get session
  const session = await auth()

  // Redirect to sign-in if no session
  if (!session) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Check user type-based access
  const userType = session.user.userType

  // Candidate routes (updated from student)
  if (pathname.startsWith('/candidate')) {
    if (userType !== UserType.CANDIDATE) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Industry routes (updated from company)
  if (pathname.startsWith('/industry')) {
    if (userType !== UserType.INDUSTRY) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Institute routes (new)
  if (pathname.startsWith('/institute')) {
    if (userType !== UserType.INSTITUTE) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userType !== UserType.ADMIN) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Legacy route redirects for backward compatibility
  if (pathname.startsWith('/student')) {
    if (userType === UserType.CANDIDATE) {
      return NextResponse.redirect(new URL(pathname.replace('/student', '/candidate'), request.url))
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (pathname.startsWith('/company')) {
    if (userType === UserType.INDUSTRY) {
      return NextResponse.redirect(new URL(pathname.replace('/company', '/industry'), request.url))
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}