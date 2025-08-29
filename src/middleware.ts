/**
 * Authentication Middleware
 * NextIntern - Internship Platform
 * 
 * Protects routes and handles user type-based authorization
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { UserType } from '@prisma/client'

// Define protected routes
const protectedRoutes = {
  student: ['/student'],
  company: ['/company'],
  admin: ['/admin']
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/how-it-works',
  '/internships',
  '/companies',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/faq',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/recovery',
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

  // Student routes
  if (pathname.startsWith('/student')) {
    if (userType !== UserType.STUDENT) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Company routes
  if (pathname.startsWith('/company')) {
    if (userType !== UserType.COMPANY) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userType !== UserType.ADMIN) {
      return NextResponse.redirect(new URL('/', request.url))
    }
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