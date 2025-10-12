/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Check,
  X,
  Crown,
  Zap,
  Users,
  BarChart,
  Shield,
  Clock,
  Loader2,
  Download,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubscriptionData {
  user: {
    id: string
    email: string
    isPremium: boolean
    premiumExpiresAt: Date | null
  }
  industry: {
    id: string
    companyName: string
    currentMonthPosts: number
    monthlyPostLimit: number
  }
  subscription: {
    id: string
    plan: string
    status: string
    priceAmount: number
    billingCycle: string
    startDate: Date
    nextBillingDate: Date | null
    endDate: Date
  } | null
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchBillingData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/users/${session.user.id}/billing`)
        
        if (response.ok) {
          const result = await response.json()
          setData(result.data)
        } else {
          toast.error('Failed to load billing data')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error loading billing data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBillingData()
  }, [status, session])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'PREMIUM_MONTHLY',
          billingCycle: 'MONTHLY',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Redirect to payment gateway
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        } else {
          toast.success('Subscription upgraded! Redirecting to payment...')
          // Refresh data after upgrade
          setTimeout(() => window.location.reload(), 2000)
        }
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        toast.success('Subscription cancelled successfully')
        setShowCancelModal(false)
        // Refresh data
        window.location.reload()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleDownloadInvoices = async () => {
    try {
      const response = await fetch('/api/subscriptions/invoices')
      
      if (response.ok) {
        const result = await response.json()
        if (result.invoices.length === 0) {
          toast.error('No invoices available')
        } else {
          toast.success('Opening invoices...')
          // Open invoices in new tabs or download
          result.invoices.forEach((invoice: any) => {
            window.open(invoice.url, '_blank')
          })
        }
      } else {
        toast.error('Failed to load invoices')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load invoices')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (amount: number) => {
    return `₹${(amount).toLocaleString()}`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Billing data not found</p>
      </div>
    )
  }

  const plans = [
    {
      name: 'Free',
      price: 0,
      billing: 'Forever',
      description: 'Perfect for getting started',
      features: [
        { name: '3 internship posts per month', included: true },
        { name: '3 project posts per month', included: true },
        { name: 'Basic candidate profiles', included: true },
        { name: 'Application management', included: true },
        { name: 'Company name hidden', included: false },
        { name: 'Candidate contact info', included: false },
        { name: 'Freelancing posts', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false }
      ],
      current: !data.user.isPremium,
      recommended: false
    },
    {
      name: 'Premium',
      price: 4999,
      billing: 'per month',
      description: 'Unlock full hiring potential',
      features: [
        { name: 'Unlimited internship posts', included: true },
        { name: 'Unlimited project posts', included: true },
        { name: 'Unlimited freelancing posts', included: true },
        { name: 'Full candidate profiles', included: true },
        { name: 'Candidate contact info', included: true },
        { name: 'Company name visible', included: true },
        { name: 'Advanced analytics & insights', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Early access to features', included: true }
      ],
      current: data.user.isPremium,
      recommended: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-manrope">
              Billing & Subscription
            </h1>
            <p className="text-gray-600">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Current Plan Status */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.user.isPremium ? 'Premium' : 'Free'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Posts used this month: {data.industry.currentMonthPosts} / {data.industry.monthlyPostLimit}
                  </p>
                </div>
                {!data.user.isPremium && (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {isUpgrading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Upgrading...</>
                    ) : (
                      <><Crown className="h-4 w-4 mr-2" />Upgrade to Premium</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Subscription Details */}
          {data.subscription && (
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.subscription.plan.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.subscription.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : data.subscription.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {data.subscription.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(data.subscription.priceAmount)} / {data.subscription.billingCycle.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="text-sm text-gray-900">{formatDate(data.subscription.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {data.subscription.status === 'ACTIVE' ? 'Next Billing' : 'End Date'}
                    </p>
                    <p className="text-sm text-gray-900">
                      {data.subscription.nextBillingDate 
                        ? formatDate(data.subscription.nextBillingDate)
                        : formatDate(data.subscription.endDate)
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {data.subscription.status === 'ACTIVE' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => toast('Payment method update coming soon')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleDownloadInvoices}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Plans */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                Select the plan that best fits your hiring needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.name}
                  className={`relative ${
                    plan.recommended 
                      ? 'border-2 border-teal-500 shadow-xl' 
                      : 'border-gray-200'
                  } ${plan.current ? 'bg-teal-50' : 'bg-white'}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Crown className="h-4 w-4" />
                        Recommended
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/ {plan.billing}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4">
                      {plan.current ? (
                        <Button 
                          className="w-full" 
                          disabled
                          variant="secondary"
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full ${
                            plan.recommended 
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600' 
                              : ''
                          }`}
                          onClick={plan.price > 0 ? handleUpgrade : () => toast('Downgrade coming soon')}
                          disabled={isUpgrading}
                        >
                          {isUpgrading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          {plan.price === 0 ? 'Downgrade to Free' : 'Upgrade Now'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Why Upgrade to Premium?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Unlimited Posting</h4>
                <p className="text-sm text-gray-700">
                  Post unlimited internships, projects, and freelancing opportunities
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Full Candidate Access</h4>
                <p className="text-sm text-gray-700">
                  View complete profiles with contact information and resumes
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <BarChart className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
                <p className="text-sm text-gray-700">
                  Get detailed insights into applications and hiring performance
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Brand Visibility</h4>
                <p className="text-sm text-gray-700">
                  Display your company name and build trust with candidates
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
                <p className="text-sm text-gray-700">
                  Get faster response times and dedicated assistance
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mb-3">
                  <Crown className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Early Access</h4>
                <p className="text-sm text-gray-700">
                  Be the first to try new features and improvements
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-gray-700">
                  Yes, you can cancel your subscription at any time. You&#39;ll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">What happens to my posted opportunities if I downgrade?</h4>
                <p className="text-sm text-gray-700">
                  Your existing opportunities will remain active. However, you&#39;ll be subject to the free plan&#39;s monthly posting limits for new opportunities.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Do you offer refunds?</h4>
                <p className="text-sm text-gray-700">
                  We offer a 7-day money-back guarantee. If you&#39;re not satisfied within the first week, contact us for a full refund.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Can I switch between monthly and yearly billing?</h4>
                <p className="text-sm text-gray-700">
                  Yes, you can change your billing cycle at any time. Changes will take effect on your next billing date.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Cancel Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel your subscription? You&#39;ll lose access to premium features at the end of your billing period.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  Keep Subscription
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling...</>
                  ) : (
                    'Yes, Cancel'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}