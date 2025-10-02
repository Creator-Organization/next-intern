import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
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
  Clock
} from 'lucide-react'

// Get subscription details
async function getSubscriptionDetails(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      industry: true,
      subscription: true
    }
  })

  if (!user?.industry) {
    throw new Error('Industry not found')
  }

  return {
    user,
    industry: user.industry,
    subscription: user.subscription
  }
}

export default async function BillingPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin')
  }

  const { user, subscription } = await getSubscriptionDetails(session.user.id)

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
      current: !user.isPremium,
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
      current: user.isPremium,
      recommended: true
    }
  ]

  return (
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

      {/* Current Subscription */}
      {subscription && (
        <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.plan.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : subscription.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscription.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(subscription.priceAmount)} / {subscription.billingCycle.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-sm text-gray-900">{formatDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {subscription.status === 'ACTIVE' ? 'Next Billing' : 'End Date'}
                </p>
                <p className="text-sm text-gray-900">
                  {subscription.nextBillingDate 
                    ? formatDate(subscription.nextBillingDate)
                    : formatDate(subscription.endDate)
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              {subscription.status === 'ACTIVE' && (
                <Button variant="secondary" size="sm">
                  Cancel Subscription
                </Button>
              )}
              <Button variant="secondary" size="sm">
                Update Payment Method
              </Button>
              <Button variant="secondary" size="sm">
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
                    >
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
  )
}