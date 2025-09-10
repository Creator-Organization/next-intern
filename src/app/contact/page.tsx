// src/app/contact/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Building,
  Users,
  ArrowRight,
  CheckCircle
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

// Fetch contact-related stats from database
async function getContactStats() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching contact stats from database...');

    // Get support ticket statistics
    const supportQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_tickets,
        AVG(EXTRACT(HOURS FROM (resolved_at - created_at))) as avg_resolution_hours,
        COUNT(CASE WHEN priority = 'HIGH' THEN 1 END) as high_priority_tickets
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    
    const supportResult = await client.query(supportQuery);
    const supportStats = supportResult.rows[0];

    // Get platform usage for support context
    const usageQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as active_companies,
        COUNT(DISTINCT s.id) as active_students,
        COUNT(DISTINCT i.id) as active_internships
      FROM companies c
      CROSS JOIN students s
      LEFT JOIN internships i ON i.is_active = true
      WHERE c.is_verified = true
    `;
    
    const usageResult = await client.query(usageQuery);
    const usageStats = usageResult.rows[0];

    // Calculate response time and satisfaction metrics
    const avgResolutionHours = parseFloat(supportStats.avg_resolution_hours) || 24;
    const resolutionRate = supportStats.total_tickets > 0 
      ? Math.round((supportStats.resolved_tickets / supportStats.total_tickets) * 100) 
      : 95;

    console.log('Contact stats fetched successfully:', {
      totalTickets: supportStats.total_tickets,
      resolvedTickets: supportStats.resolved_tickets,
      avgResolutionHours,
      highPriorityTickets: supportStats.high_priority_tickets,
      resolutionRate,
      activeCompanies: usageStats.active_companies,
      activeStudents: usageStats.active_students,
      activeInternships: usageStats.active_internships
    });

    return {
      totalTickets: parseInt(supportStats.total_tickets),
      resolvedTickets: parseInt(supportStats.resolved_tickets), 
      avgResolutionHours: Math.round(avgResolutionHours),
      resolutionRate,
      activeCompanies: parseInt(usageStats.active_companies),
      activeStudents: parseInt(usageStats.active_students),
      activeInternships: parseInt(usageStats.active_internships)
    };

  } catch (error) {
    console.error('Contact page database error:', error);
    throw new Error(`Failed to fetch contact stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    client.release();
  }
}

export default async function ContactPage() {
  const stats = await getContactStats();

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
              <Link href="/pricing" className="text-gray-600 hover:text-primary-600 transition-colors">
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
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about NextIntern? Need help with your account? Our support team is here 
              to help you succeed. We typically respond within {stats.avgResolutionHours} hours.
            </p>
          </div>
        </div>
      </div>

      {/* Support Stats */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {stats.avgResolutionHours}h
              </div>
              <div className="text-gray-600 mt-1">Avg Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {stats.resolutionRate}%
              </div>
              <div className="text-gray-600 mt-1">Resolution Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {stats.activeCompanies.toLocaleString()}+
              </div>
              <div className="text-gray-600 mt-1">Companies Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                24/7
              </div>
              <div className="text-gray-600 mt-1">Email Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-manrope">Send us a Message</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we&#39;ll get back to you within {stats.avgResolutionHours} hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {/* Form Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        I am a:
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="userType" value="student" className="mr-3" />
                          <Users className="h-5 w-5 mr-2 text-primary-600" />
                          <span>Student</span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="userType" value="company" className="mr-3" />
                          <Building className="h-5 w-5 mr-2 text-primary-600" />
                          <span>Company</span>
                        </label>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <option value="">Select a topic</option>
                        <option value="account">Account Issues</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing Questions</option>
                        <option value="feature">Feature Requests</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="general">General Questions</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Please describe your question or issue in detail..."
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div>
                <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-6">
                  Other Ways to Reach Us
                </h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                          <p className="text-gray-600 mb-2">
                            For general inquiries and support requests
                          </p>
                          <a href="mailto:support@nextintern.com" className="text-primary-600 hover:text-primary-700">
                            support@nextintern.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Sales & Partnerships</h3>
                          <p className="text-gray-600 mb-2">
                            For business inquiries and partnership opportunities
                          </p>
                          <a href="mailto:sales@nextintern.com" className="text-primary-600 hover:text-primary-700">
                            sales@nextintern.com
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Phone className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                          <p className="text-gray-600 mb-2">
                            Available for Enterprise customers (Mon-Fri, 9 AM - 6 PM IST)
                          </p>
                          <span className="text-primary-600">
                            +91 (80) 4567-8900
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Office Information */}
              <div>
                <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-6">
                  Visit Our Office
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Headquarters</h3>
                        <p className="text-gray-600 leading-relaxed">
                          NextIntern Technologies Pvt. Ltd.<br />
                          IT Park, Phase 2, Block B, 4th Floor<br />
                          Hinjewadi, Pune, Maharashtra 411057<br />
                          India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Hours */}
              <div>
                <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-6">
                  Business Hours
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday - Friday:</span>
                          <span className="font-medium text-gray-900">9:00 AM - 6:00 PM IST</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saturday:</span>
                          <span className="font-medium text-gray-900">10:00 AM - 2:00 PM IST</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sunday:</span>
                          <span className="font-medium text-gray-900">Closed</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            Email support is available 24/7 with responses within {stats.avgResolutionHours} hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-4">
              Common Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to frequently asked questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "How do I reset my password?",
                answer: "You can reset your password by clicking &#39;Forgot Password&#39; on the login page. We&#39;ll send you a secure reset link via email."
              },
              {
                question: "How do I post an internship?",
                answer: "After creating a company account and getting verified, go to your dashboard and click &#39;Post Internship&#39; to create detailed job listings."
              },
              {
                question: "Is NextIntern free for students?",
                answer: "Yes! NextIntern is completely free for students. You can create profiles, apply to internships, and use all student features at no cost."
              },
              {
                question: "How long does company verification take?",
                answer: "Company verification typically takes 24-48 hours. Our team reviews submitted documents to ensure platform quality and safety."
              },
              {
                question: "Can I edit my application after submitting?",
                answer: "You cannot edit submitted applications, but you can contact the company directly through our messaging system for updates or clarifications."
              },
              {
                question: "How do I cancel my subscription?",
                answer: "You can cancel your subscription anytime from your account settings. Your access continues until the end of the current billing period."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/help">
              <Button variant="secondary" size="lg">
                View Help Center
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join {stats.activeStudents.toLocaleString()}+ students and {stats.activeCompanies}+ companies 
            who trust NextIntern for their internship needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/student">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Join as Student
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/company">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                Post Internships
                <Building className="ml-2 h-5 w-5" />
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
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
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