import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | NextIntern',
  description: 'Terms and conditions for using the NextIntern platform. Read our user agreements, platform policies, and legal information.',
  keywords: ['terms of service', 'user agreement', 'platform policies', 'NextIntern legal']
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const lastUpdated = new Date('2024-08-23');

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            These terms govern your use of NextIntern and related services.
            Please read them carefully.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* 1. Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                By accessing or using NextIntern (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not use our services.
              </p>
              <p className="text-gray-700 mb-4">
                These Terms apply to all users of the Platform, including students, companies, and administrators. By creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </div>
          </section>

          {/* 2. User Accounts and Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. User Accounts and Eligibility
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Student Accounts</h3>
              <p className="text-gray-700 mb-4">
                To create a student account, you must be enrolled in or have graduated from an accredited educational institution. You must provide accurate, complete, and current information during registration.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Company Accounts</h3>
              <p className="text-gray-700 mb-4">
                Company accounts may only be created by authorized representatives of legitimate businesses. Companies must provide valid business information and may be subject to verification processes.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Security</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Age Requirements</h3>
              <p className="text-gray-700">
                Users must be at least 16 years old to create an account. Users under 18 should have parental consent to use the Platform.
              </p>
            </div>
          </section>

          {/* 3. Platform Usage Rules */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Platform Usage Rules
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Acceptable Use</h3>
              <p className="text-gray-700 mb-4">You agree to use the Platform only for lawful purposes and in accordance with these Terms. You may not:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Post false, misleading, or deceptive information</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Use automated tools to scrape or collect data</li>
                <li>Post spam, advertisements, or solicitations</li>
                <li>Share inappropriate or offensive content</li>
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Content Guidelines</h3>
              <p className="text-gray-700 mb-4">
                All content posted on the Platform must be professional, accurate, and appropriate. We reserve the right to remove content that violates these guidelines without notice.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Communication Standards</h3>
              <p className="text-gray-700">
                Communications between students and companies must remain professional and relevant to internship opportunities. Personal information exchanges outside the Platform are at your own risk.
              </p>
            </div>
          </section>

          {/* 4. Student Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Student Responsibilities
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">As a student user, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate and up-to-date profile information</li>
                <li>Submit genuine applications and documents</li>
                <li>Respond professionally to company communications</li>
                <li>Honor commitments made to internship providers</li>
                <li>Report any inappropriate behavior by companies</li>
                <li>Maintain confidentiality of company information shared during applications</li>
              </ul>
              <p className="text-gray-700">
                Students are responsible for verifying the legitimacy of internship opportunities and companies before sharing personal information or accepting positions.
              </p>
            </div>
          </section>

          {/* 5. Company Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Company Responsibilities
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">As a company user, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate company and internship information</li>
                <li>Post legitimate internship opportunities only</li>
                <li>Treat all applicants fairly and without discrimination</li>
                <li>Respond to applications in a timely manner</li>
                <li>Honor commitments made to selected interns</li>
                <li>Comply with applicable labor laws and regulations</li>
                <li>Protect student privacy and personal information</li>
                <li>Pay any applicable platform fees promptly</li>
              </ul>
              <p className="text-gray-700">
                Companies must ensure their internship postings comply with local labor laws and provide fair compensation where required.
              </p>
            </div>
          </section>

          {/* 6. Intellectual Property Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property Rights
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Platform Content</h3>
              <p className="text-gray-700 mb-4">
                NextIntern owns all rights to the Platform, including its design, code, trademarks, and proprietary content. Users may not copy, modify, or distribute our intellectual property without permission.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">User Content</h3>
              <p className="text-gray-700 mb-4">
                You retain ownership of content you upload but grant NextIntern a license to use, display, and distribute such content as necessary to provide our services.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Copyright Protection</h3>
              <p className="text-gray-700">
                We respect intellectual property rights and will respond to valid copyright infringement notices in accordance with applicable laws.
              </p>
            </div>
          </section>

          {/* 7. Payment Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Payment Terms
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Company Subscriptions</h3>
              <p className="text-gray-700 mb-4">
                Companies using premium features must pay applicable subscription fees. All fees are non-refundable unless required by law.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                Payments are processed by third-party providers. By providing payment information, you authorize us to charge applicable fees to your chosen payment method.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Billing Disputes</h3>
              <p className="text-gray-700">
                Billing disputes must be reported within 30 days of the charge. We will investigate and resolve disputes in good faith.
              </p>
            </div>
          </section>

          {/* 8. Account Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Account Termination
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Voluntary Termination</h3>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time through your account settings. Account data will be deleted in accordance with our Privacy Policy.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Involuntary Termination</h3>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate accounts that violate these Terms, engage in prohibited activities, or pose risks to other users or the Platform.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Effects of Termination</h3>
              <p className="text-gray-700">
                Upon termination, your access to the Platform will cease immediately. You remain liable for any outstanding obligations incurred before termination.
              </p>
            </div>
          </section>

          {/* 9. Disclaimers and Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Disclaimers and Limitation of Liability
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Service Disclaimers</h3>
              <p className="text-gray-700 mb-4">
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of user-generated content or internship opportunities.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">User Interactions</h3>
              <p className="text-gray-700 mb-4">
                NextIntern is not responsible for interactions between students and companies. Users engage with each other at their own risk and should exercise appropriate caution.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Limitation of Liability</h3>
              <p className="text-gray-700">
                To the maximum extent permitted by law, NextIntern&apos;s liability is limited to the amount you paid for our services in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* 10. Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Dispute Resolution
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Informal Resolution</h3>
              <p className="text-gray-700 mb-4">
                Before initiating formal proceedings, parties agree to attempt good faith resolution of disputes through direct communication or mediation.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Arbitration</h3>
              <p className="text-gray-700 mb-4">
                Disputes that cannot be resolved informally will be settled through binding arbitration in accordance with applicable arbitration rules.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Governing Law</h3>
              <p className="text-gray-700">
                These Terms are governed by the laws of India. Any legal proceedings will be conducted in courts of competent jurisdiction in Mumbai, India.
              </p>
            </div>
          </section>

          {/* 11. General Provisions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. General Provisions
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Severability</h3>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Entire Agreement</h3>
              <p className="text-gray-700 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and NextIntern regarding use of the Platform.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment</h3>
              <p className="text-gray-700 mb-4">
                NextIntern may assign these Terms without notice. Users may not assign their rights or obligations under these Terms without our written consent.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
              <p className="text-gray-700">
                For questions about these Terms, please contact us at legal@nextintern.com or through our support system.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Questions about our Terms?
              </h3>
              <p className="text-blue-700 mb-4">
                Our legal team is here to help clarify any questions about these terms of service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Contact Legal Team
                </a>
                <a
                  href="/privacy"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
                >
                  Read Privacy Policy
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}