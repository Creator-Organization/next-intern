// src/app/api/test/email/route.ts
// Test Email Configuration API - Phase 2 Day 5

import { NextResponse } from 'next/server'
import { validateEmailConfig, EmailUtils } from '@/lib/email'

export async function GET() {
  try {
    console.log('🧪 Testing Email Configuration...')

    // 1. Check environment variables
    console.log('1. Checking environment variables...')
    const config = validateEmailConfig()
    
    if (!config.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        missingVars: config.missingVars
      }, { status: 500 })
    }
    
    console.log('✅ All environment variables present')

    // 2. Test Resend connection
    console.log('2. Testing Resend API connection...')
    const isWorking = await EmailUtils.testEmailConfig()
    
    const result = {
      success: isWorking,
      message: isWorking 
        ? 'Email configuration is working correctly!' 
        : 'Email configuration failed - check your RESEND_API_KEY',
      environmentVariables: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Missing'
      }
    }

    console.log(isWorking ? '✅ Email test passed' : '❌ Email test failed')
    
    return NextResponse.json(result, { 
      status: isWorking ? 200 : 500 
    })
    
  } catch (error) {
    console.error('Email test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}