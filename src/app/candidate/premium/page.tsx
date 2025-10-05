import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { 
  Crown,
  Check,
  X,
  Sparkles,
  Eye,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Shield,
  Zap,
  Star
} from 'lucide-react'
import Link from 'next/link'

async function getUserSubscription(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: true
    }
  })

  if (!user?.candidate) {
    throw new Error('Candidate profile not found')
  }

  // Get latest subscription
  const subscription = await db.userSubscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  return {
    candidate: user.candidate,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    activeSubscription: subscription
  }
}

export default async function PremiumPage() {
  const session = await auth()
  
  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  const { candidate, isPremium, premiumExpiresAt, activeSubscription } = 
    await getUserSubscription(session.user.id)

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const features = [
    {
      icon: Eye,
      title: 'See Full Company Details',
      free: false,
      premium: true,
      description: 'View complete company names, locations, and contact information'
    },
    {
      icon: Briefcase,
      title: 'Access Freelancing Opportunities',
      free: false,
      premium: true,
      description: 'Apply to exclusive freelancing projects and gigs'
    },
    {
      icon: MessageSquare,
      title: 'Unlimited Messaging',
      free: true,
      premium: true,
      description: 'Connect with companies about opportunities'
    },
    {
      icon: TrendingUp,
      title: 'Priority in Search Results',
      free: false,
      premium: true,
      description: 'Your profile appears at the top of company searches'
    },
    {
      icon: Star,
      title: 'Featured Profile Badge',
      free: false,
      premium: true,
      description: 'Stand out with a premium badge on your profile'
    },
    {
      icon: Shield,
      title: 'Enhanced Privacy Controls',
      free: false,
      premium: true,
      description: 'Advanced settings to control who sees your information'
    },
    {
      icon: Zap,
      title: 'Early Access to New Features',
      free: false,
      premium: true,
      description: 'Be the first to try new platform features'
    },
    {
      icon: Sparkles,
      title: 'Dedicated Support',
      free: false,
      premium: true,
      description: 'Priority customer support and faster response times'
    }
  ]

  const plans = [
    {
      name: 'Monthly',
      price: 299,
      period: 'month',
      popular: false,
      savings: null,
      features: ['All Premium Features', 'Cancel Anytime', 'Instant Activation']
    },
    {
      name: 'Quarterly',
      price: 799,
      period: '3 months',
      popular: true,
      savings: '11% off',
      features: ['All Premium Features', 'Save ₹98', 'Best Value', 'Priority Support']
    },
    {
      name: 'Annual',
      price: 2999,
      period: 'year',
      popular: false,
      savings: '17% off',
      features: ['All Premium Features', 'Save ₹589', 'Maximum Savings', 'VIP Support']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={{
        id: session.user.id,
        email: session.user.email,
        userType: session.user.userType,
        candidate: session.user.candidate ? {
          firstName: session.user.candidate.firstName,
          lastName: session.user.candidate.lastName
        } : undefined
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Current Status */}
        {isPremium && (
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Crown className="h-8 w-8 text-purple-600 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 mb-1">
                      Premium Member
                    </h3>
                    <p className="text-purple-700">
                      You&apos;re enjoying all premium features. Your subscription {premiumExpiresAt ? `renews on ${formatDate(premiumExpiresAt)}` : 'is active'}.
                    </p>
                    {activeSubscription && (
                      <p className="text-sm text-purple-600 mt-2">
                        Plan: {activeSubscription.planType} • Status: {activeSubscription.status}
                      </p>
                    )}
                  </div>
                </div>
                <Link href="/candidate/settings">
                  <Button variant="secondary">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-manrope">
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get premium access to exclusive opportunities, see full company details, and stand out from the crowd
          </p>
        </div>

        {/* Features Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center">Compare Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Free</th>
                    <th className="text-center py-4 px-4">
                      <div className="inline-flex items-center gap-2 text-purple-600 font-semibold">
                        <Crown className="h-5 w-5" />
                        Premium
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <feature.icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{feature.title}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.free ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.premium ? (
                          <Check className="h-5 w-5 text-purple-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        {!isPremium && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                All plans include access to all premium features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {plans.map((plan, index) => (
                <Card 
                  key={index}
                  className={`relative ${
                    plan.popular 
                      ? 'border-2 border-purple-500 shadow-xl scale-105' 
                      : 'border border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      {plan.savings && (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                          {plan.savings}
                        </span>
                      )}
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                        <span className="text-gray-600">/ {plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        ₹{Math.round(plan.price / (plan.period.includes('year') ? 12 : plan.period.includes('3') ? 3 : 1))}/month
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                          : ''
                      }`}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Get {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-manrope">
            What Premium Members Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma',
                role: 'Software Engineer',
                feedback: 'Premium membership helped me land my dream internship. Seeing full company details made all the difference!',
                rating: 5
              },
              {
                name: 'Rahul Kumar',
                role: 'Data Science Student',
                feedback: 'Access to freelancing opportunities has been amazing. I have already completed 3 projects!',
                rating: 5
              },
              {
                name: 'Ananya Patel',
                role: 'Marketing Intern',
                feedback: 'The priority placement in searches got me noticed by top companies. Worth every rupee!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.feedback}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. You&apos;ll continue to have premium access until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit/debit cards, UPI, net banking, and popular digital wallets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">We offer a 7-day money-back guarantee. If you&apos;re not satisfied, contact support for a full refund.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I switch plans?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        {!isPremium && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Upgrade?
                </h3>
                <p className="text-purple-100 mb-6">
                  Join thousands of premium members getting better opportunities
                </p>
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Crown className="h-5 w-5 mr-2" />
                  Start Your Premium Journey
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}