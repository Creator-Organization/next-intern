// src/app/pricing/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Check, 
  X,
  ArrowRight,
  Users,
  Building,
  Star,
  Phone,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Fetch pricing-related stats from database
async function getPricingStats() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching pricing stats from database...');

    // Get platform usage statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as companies_using_platform,
        COUNT(DISTINCT s.id) as students_registered,
        COUNT(DISTINCT i.id) as total_internships_posted,
        COUNT(DISTINCT a.id) as total_applications,
        AVG(i.stipend) as avg_internship_value,
        COUNT(DISTINCT CASE WHEN a.status = 'ACCEPTED' THEN a.id END) as successful_hires
      FROM companies c
      LEFT JOIN internships i ON c.id = i.company_id
      LEFT JOIN students s ON true
      LEFT JOIN applications a ON i.id = a.internship_id
      WHERE c.is_verified = true
    `;
    
    const result = await client.query(statsQuery);
    const stats = result.rows[0];

    // Get company size distribution to understand customer segments
    const segmentQuery = `
      SELECT 
        company_size,
        COUNT(*) as count,
        COUNT(CASE WHEN i.id IS NOT NULL THEN 1 END) as active_companies
      FROM companies c
      LEFT JOIN internships i ON c.id = i.company_id AND i.is_active = true
      WHERE c.is_verified = true
      GROUP BY company_size
      ORDER BY 
        CASE company_size 
          WHEN 'STARTUP' THEN 1
          WHEN 'SMALL' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LARGE' THEN 4
        END
    `;
    const segmentResult = await client.query(segmentQuery);
    const segments = segmentResult.rows;

    // Calculate average response time for support metrics
    const responseQuery = `
      SELECT 
        AVG(EXTRACT(HOURS FROM (resolved_at - created_at))) as avg_response_hours
      FROM support_tickets 
      WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL
    `;
    const responseResult = await client.query(responseQuery);
    const avgResponseHours = responseResult.rows[0]?.avg_response_hours || 24;

    console.log('Pricing stats fetched successfully:', {
      companiesUsingPlatform: stats.companies_using_platform,
      studentsRegistered: stats.students_registered,
      totalInternshipsPosted: stats.total_internships_posted,
      totalApplications: stats.total_applications,
      avgInternshipValue: stats.avg_internship_value,
      successfulHires: stats.successful_hires,
      avgResponseHours,
      segmentsCount: segments.length
    });

    return {
      companiesUsingPlatform: parseInt(stats.companies_using_platform),
      studentsRegistered: parseInt(stats.students_registered),
      totalInternshipsPosted: parseInt(stats.total_internships_posted),
      totalApplications: parseInt(stats.total_applications),
      avgInternshipValue: Math.round(parseFloat(stats.avg_internship_value) || 25000),
      successfulHires: parseInt(stats.successful_hires),
      avgResponseHours: Math.round(parseFloat(avgResponseHours)),
      segments
    };

  } catch (error) {
    console.error('Pricing page database error:', error);
    throw new Error(`Failed to fetch pricing stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    client.release();
  }
}

export default async function PricingPage() {
  const stats = await getPricingStats();

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for startups and small companies testing the waters",
      features: [
        "Post up to 3 internships per month",
        "Access to basic candidate profiles",
        "Standard application management",
        "Email support",
        "Basic analytics dashboard",
        "7-day application history"
      ],
      limitations: [
        "Limited to 50 applications per month",
        "No priority listing",
        "Standard response time (48-72 hours)"
      ],
      cta: "Start Free",
      popular: false,
      gradient: "from-gray-50 to-gray-100"
    },
    {
      name: "Professional",
      price: "₹2,499",
      period: "/month",
      description: "Ideal for growing companies with regular hiring needs",
      features: [
        "Post unlimited internships",
        "Access to detailed candidate profiles",
        "Advanced filtering and search",
        "Priority email & chat support",
        "Comprehensive analytics & insights",
        "90-day application history",
        "Custom company branding",
        "Interview scheduling tools",
        "Candidate shortlisting features"
      ],
      limitations: [],
      cta: "Start 14-Day Trial",
      popular: true,
      gradient: "from-primary-50 to-primary-100"
    },
    {
      name: "Enterprise",
      price: "₹7,999",
      period: "/month",
      description: "For large organizations with extensive hiring requirements",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Priority phone support",
        "Custom integrations (ATS, HRIS)",
        "Bulk posting capabilities",
        "Advanced reporting & analytics",
        "White-label options",
        "API access",
        "Compliance & security features",
        "Training sessions for HR teams",
        "SLA guarantee (4-hour response)"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-purple-50 to-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
                NextIntern
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/internships" className="text-gray-600 hover:text-primary-600 transition-colors">
                Browse Internships
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-primary-600 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="/pricing" className="text-primary-600 font-medium">
                Pricing
              </Link>
              <div className="flex items-center space-x-3">
                <Link href="/auth/student">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/student">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold font-manrope text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Choose the perfect plan for your hiring needs. Join {stats.companiesUsingPlatform}+ companies 
              who trust NextIntern to find top talent efficiently.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {stats.studentsRegistered.toLocaleString()}+
              </div>
              <div className="text-gray-600 mt-1">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {stats.totalInternshipsPosted.toLocaleString()}+
              </div>
              <div className="text-gray-600 mt-1">Internships Posted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                ₹{stats.avgInternshipValue.toLocaleString()}
              </div>
              <div className="text-gray-600 mt-1">Avg Internship Value</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {Math.round((stats.successfulHires / stats.totalApplications) * 100)}%
              </div>
              <div className="text-gray-600 mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl scale-105' : 'shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Crown className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className={`bg-gradient-to-br ${plan.gradient} rounded-t-lg p-8`}>
                  <div className="text-center">
                    <CardTitle className="text-2xl font-bold font-manrope text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">What&#39;s included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Limitations:</h4>
                        <ul className="space-y-3">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start">
                              <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="pt-6">
                      <Link href="/auth/company">
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                          variant={plan.popular ? 'primary' : 'secondary'}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-gray-600">
              Detailed feature comparison to help you choose the right plan
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-primary-50">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: "Monthly Internship Posts", starter: "3", professional: "Unlimited", enterprise: "Unlimited" },
                    { feature: "Candidate Profile Access", starter: "Basic", professional: "Detailed", enterprise: "Full Access" },
                    { feature: "Application History", starter: "7 days", professional: "90 days", enterprise: "Unlimited" },
                    { feature: "Analytics Dashboard", starter: "Basic", professional: "Advanced", enterprise: "Enterprise" },
                    { feature: "Support Level", starter: "Email", professional: "Email + Chat", enterprise: "Phone + Dedicated" },
                    { feature: "Response Time SLA", starter: "48-72 hours", professional: "24 hours", enterprise: "4 hours" },
                    { feature: "Custom Branding", starter: "❌", professional: "✅", enterprise: "✅" },
                    { feature: "API Access", starter: "❌", professional: "❌", enterprise: "✅" },
                    { feature: "White-label Options", starter: "❌", professional: "❌", enterprise: "✅" }
                  ].map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{row.starter}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center bg-primary-25">{row.professional}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "How does the free trial work?",
                answer: "You get full access to Professional features for 14 days, no credit card required. You can post unlimited internships and access all features during the trial period."
              },
              {
                question: "Can I change plans anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated for the remaining period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, and UPI payments. Enterprise customers can also pay via bank transfer with annual billing."
              },
              {
                question: "Is there a setup fee?",
                answer: "No setup fees for any plan. You only pay the monthly subscription fee, and you can cancel anytime without penalties."
              },
              {
                question: "How does support work?",
                answer: `Our ${stats.avgResponseHours}-hour average response time ensures you get help when needed. Professional plans include chat support, while Enterprise gets dedicated phone support.`
              },
              {
                question: "Do you offer discounts for annual billing?",
                answer: "Yes! Annual billing provides 2 months free (16% savings). Enterprise customers get additional discounts for multi-year commitments."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 bg-gray-50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Ready to Start Hiring?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join {stats.companiesUsingPlatform}+ companies who have posted {stats.totalInternshipsPosted}+ 
            internships and made {stats.successfulHires}+ successful hires through NextIntern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/company">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                <Phone className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold font-manrope text-white mb-4">
                NextIntern
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Connecting students with companies for meaningful internship experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Students</h4>
              <div className="space-y-2">
                <Link href="/internships" className="block text-gray-400 hover:text-white transition-colors">
                  Browse Internships
                </Link>
                <Link href="/auth/student" className="block text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
                <Link href="/resources" className="block text-gray-400 hover:text-white transition-colors">
                  Career Resources
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Companies</h4>
              <div className="space-y-2">
                <Link href="/auth/company" className="block text-gray-400 hover:text-white transition-colors">
                  Post Internships
                </Link>
                <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 NextIntern. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}