// src/app/privacy/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield,
  Lock,
  Eye,
  FileText,
  Mail,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
                Internship And Project
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
              <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                Contact
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
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full mb-6">
              <Shield className="h-5 w-5 text-primary-600 mr-2" />
              <span className="text-primary-700 font-medium">Privacy & Security</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold font-manrope text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-4">
              Your privacy is important to us. This policy explains how Internship And Project collects, 
              uses, and protects your personal information.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Highlights */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 border-0 bg-gray-50">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure by Design</h3>
                <p className="text-gray-600 text-sm">
                  Your data is encrypted and protected with industry-standard security measures.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-gray-50">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparent Data Use</h3>
                <p className="text-gray-600 text-sm">
                  We clearly explain what data we collect and how we use it to improve your experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 border-0 bg-gray-50">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
                <p className="text-gray-600 text-sm">
                  You have full control over your data and can modify or delete it anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Internship And Project Technologies Pvt. Ltd. (&#34;Internship And Project,&#34; &#34;we,&#34; &#34;our,&#34; or &#34;us&#34;) 
                operates the Internship And Project platform that connects students with internship opportunities. 
                This Privacy Policy describes how we collect, use, disclose, and safeguard your information 
                when you use our website, mobile application, and related services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using Internship And Project, you agree to the collection and use of information 
                in accordance with this Privacy Policy. If you do not agree with our policies and practices, 
                do not use our services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Create an account (name, email, phone number, date of birth)</li>
                <li>Complete your profile (education, skills, work experience)</li>
                <li>Upload documents (resume, portfolio, certificates)</li>
                <li>Apply to internships (cover letters, application responses)</li>
                <li>Contact us for support (communication records)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Company Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                For company accounts, we additionally collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Company details (name, industry, size, location)</li>
                <li>Business information (website, description, founding year)</li>
                <li>Verification documents (registration certificates, tax documents)</li>
                <li>Job posting details (requirements, descriptions, stipends)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Usage data (pages visited, time spent, click patterns)</li>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Location data (if you enable location services)</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      For Students
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Match you with relevant internship opportunities</li>
                      <li>• Enable applications and communication with companies</li>
                      <li>• Provide personalized recommendations</li>
                      <li>• Track application status and progress</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      For Companies
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Display your internship postings to relevant students</li>
                      <li>• Facilitate candidate screening and selection</li>
                      <li>• Provide analytics on posting performance</li>
                      <li>• Enable communication with potential interns</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Platform Operations</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process transactions and send notifications</li>
                <li>Respond to customer service requests</li>
                <li>Improve our platform through analytics</li>
                <li>Detect and prevent fraud or security issues</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              
              <Card className="mb-6 border-l-4 border-l-amber-500 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
                      <p className="text-amber-700 text-sm">
                        We never sell your personal information to third parties. Information sharing 
                        only occurs in specific circumstances outlined below.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Your Consent</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>When you apply to internships, your profile is shared with relevant companies</li>
                <li>When companies express interest, your contact information may be shared</li>
                <li>When you explicitly opt-in to third-party integrations or services</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Cloud storage and hosting providers (AWS, Google Cloud)</li>
                <li>Email service providers (for notifications and communications)</li>
                <li>Analytics services (to improve our platform)</li>
                <li>Payment processors (for subscription billing)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may disclose your information when required by law, court order, or government request, 
                or when we believe disclosure is necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Protect our rights, property, or safety</li>
                <li>Protect the rights, property, or safety of our users</li>
                <li>Investigate potential violations of our terms</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Security Measures</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive information</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection practices</li>
              </ul>

              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Security Limitations</h4>
                  <p className="text-red-700 text-sm">
                    While we strive to protect your personal information, no method of transmission 
                    over the internet or electronic storage is 100% secure. We cannot guarantee 
                    absolute security of your data.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                6. Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have certain rights regarding your personal information. These rights may vary 
                depending on your location and applicable privacy laws.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Access & Portability</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Request a copy of your personal data</li>
                    <li>• Download your profile information</li>
                    <li>• Export your application history</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Control & Deletion</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Update or correct your information</li>
                    <li>• Delete your account and data</li>
                    <li>• Opt-out of marketing communications</li>
                  </ul>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                To exercise these rights, please contact us at privacy@Internship And Project.com or through 
                your account settings. We will respond to your request within 30 days.
              </p>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience, 
                analyze usage patterns, and personalize content.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements (with consent)</li>
              </ul>

              <p className="text-gray-600 leading-relaxed">
                You can control cookie preferences through your browser settings or our cookie 
                preference center. Note that disabling certain cookies may affect platform functionality.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal information only as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>

              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Inactive Accounts:</strong> Data retained for 3 years after last activity</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer for compliance</li>
              </ul>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data during international transfers.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new Privacy Policy on this page and updating the 
                &#34;Last updated&#34; date.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We encourage you to review this Privacy Policy periodically for any changes. 
                Your continued use of our services after any modifications constitutes acceptance 
                of the updated Privacy Policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold font-manrope text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, 
                please contact us:
              </p>
              
              <Card className="border-l-4 border-l-primary-500">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="text-gray-900">privacy@Internship And Project.com</span>
                    </div>
                    <div className="flex items-start">
                      <Building className="h-5 w-5 text-primary-600 mr-3 mt-1" />
                      <div className="text-gray-900">
                        <div>Internship And Project Technologies Pvt. Ltd.</div>
                        <div className="text-sm text-gray-600 mt-1">
                          IT Park, Phase 2, Block B, 4th Floor<br />
                          Hinjewadi, Pune, Maharashtra 411057<br />
                          India
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-manrope mb-4">
            Questions About Your Privacy?
          </h2>
          <p className="text-gray-600 mb-6">
            Our privacy team is here to help. Contact us for any questions about how we handle your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Contact Privacy Team
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="secondary" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                View Terms of Service
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
                Internship And Project
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Connecting students with companies for meaningful internship experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </div>
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
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Internship And Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}