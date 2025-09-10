import { Metadata } from 'next';
import { Pool } from 'pg';
import { Search, ChevronDown, Users, Building2, HelpCircle, MessageSquare, Clock, CheckCircle } from 'lucide-react';

// Database connection (reusing the same pattern as other pages)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | NextIntern',
  description: 'Find answers to common questions about NextIntern. Get help with applications, profiles, company verification, and more.',
  keywords: ['FAQ', 'help', 'support', 'questions', 'NextIntern guide']
};

// FAQ Interface
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful_count: number;
  order: number;
}

interface SupportStats {
  total_tickets: number;
  resolved_tickets: number;
  avg_response_time: number;
  common_categories: Array<{
    category: string;
    count: number;
  }>;
}

// Server Component to fetch data
async function getFAQData() {
  try {
    // Get support statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_tickets,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_response_time
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    // Get common support categories
    const categoriesQuery = `
      SELECT 
        category,
        COUNT(*) as count
      FROM support_tickets 
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 5
    `;
    
    const categoriesResult = await pool.query(categoriesQuery);
    
    // Simulate FAQ data (in production, this would come from a faq table)
    const faqs: FAQ[] = [
      {
        id: '1',
        question: 'How do I create a student account?',
        answer: 'Click the "Sign Up" button and select "Student". Fill in your details including your educational institution, degree, and expected graduation year. Verify your email address to activate your account.',
        category: 'Getting Started',
        helpful_count: 45,
        order: 1
      },
      {
        id: '2',
        question: 'How can I make my profile stand out to companies?',
        answer: 'Complete all sections of your profile, upload a professional resume, add relevant skills and certifications, write a compelling bio, and include portfolio links. Keep your information updated and professional.',
        category: 'Student Profile',
        helpful_count: 38,
        order: 2
      },
      {
        id: '3',
        question: 'What should I include in my internship application?',
        answer: 'Write a personalized cover letter, ensure your resume is updated and relevant, highlight specific skills mentioned in the job posting, and explain why you\'re interested in that particular company and role.',
        category: 'Applications',
        helpful_count: 52,
        order: 3
      },
      {
        id: '4',
        question: 'How do I track my application status?',
        answer: 'Go to "My Applications" in your student dashboard. You\'ll see all your applications with current status: Pending, Under Review, Shortlisted, Rejected, or Accepted. You\'ll also receive email notifications for status changes.',
        category: 'Applications',
        helpful_count: 41,
        order: 4
      },
      {
        id: '5',
        question: 'Can I save internships to apply later?',
        answer: 'Yes! Click the bookmark icon on any internship listing to save it. Access all your saved internships from the "Saved Internships" section in your dashboard.',
        category: 'Student Features',
        helpful_count: 29,
        order: 5
      },
      {
        id: '6',
        question: 'How do I post an internship opportunity?',
        answer: 'After creating a company account and getting verified, go to your company dashboard and click "Post Internship". Fill in all required details including job description, requirements, stipend, and application deadline.',
        category: 'Company Posting',
        helpful_count: 35,
        order: 6
      },
      {
        id: '7',
        question: 'How does company verification work?',
        answer: 'Submit your company registration documents, GST certificate (if applicable), and official company email domain. Our team reviews within 2-3 business days. Verified companies get a badge and higher visibility.',
        category: 'Company Verification',
        helpful_count: 42,
        order: 7
      },
      {
        id: '8',
        question: 'How can I manage applications I receive?',
        answer: 'Use the "Applications Received" section to review candidates, shortlist promising applicants, send messages, and schedule interviews. You can filter by skills, education, and application date.',
        category: 'Company Management',
        helpful_count: 31,
        order: 8
      },
      {
        id: '9',
        question: 'What are the different pricing plans?',
        answer: 'We offer Free (1 posting), Professional (₹2,999/month for 10 postings), and Enterprise (₹9,999/month for unlimited postings plus premium features). All plans include basic applicant management.',
        category: 'Pricing & Billing',
        helpful_count: 48,
        order: 9
      },
      {
        id: '10',
        question: 'How do I cancel my subscription?',
        answer: 'Go to "Billing & Subscription" in your company settings. Click "Cancel Subscription" and follow the prompts. Your account will remain active until the current billing period ends.',
        category: 'Pricing & Billing',
        helpful_count: 27,
        order: 10
      },
      {
        id: '11',
        question: 'Is my personal information secure?',
        answer: 'Yes, we use industry-standard encryption and security measures. We never share your personal information with third parties without consent. Read our Privacy Policy for complete details.',
        category: 'Privacy & Security',
        helpful_count: 36,
        order: 11
      },
      {
        id: '12',
        question: 'How do I report inappropriate behavior?',
        answer: 'Use the "Report" button on user profiles or messages, or contact our support team directly. We take all reports seriously and investigate promptly to maintain a safe platform.',
        category: 'Safety & Support',
        helpful_count: 33,
        order: 12
      }
    ];

    const supportStats: SupportStats = {
      total_tickets: parseInt(statsResult.rows[0]?.total_tickets || '0'),
      resolved_tickets: parseInt(statsResult.rows[0]?.resolved_tickets || '0'),
      avg_response_time: parseFloat(statsResult.rows[0]?.avg_response_time || '0'),
      common_categories: categoriesResult.rows || []
    };

    return { faqs, supportStats };
  } catch (error) {
    console.error('Database query failed:', error);
    
    // Fallback data
    return {
      faqs: [],
      supportStats: {
        total_tickets: 0,
        resolved_tickets: 0,
        avg_response_time: 0,
        common_categories: []
      }
    };
  }
}

// Group FAQs by category
function groupFAQsByCategory(faqs: FAQ[]) {
  const categories = ['Getting Started', 'Student Profile', 'Applications', 'Student Features', 
                     'Company Posting', 'Company Verification', 'Company Management', 
                     'Pricing & Billing', 'Privacy & Security', 'Safety & Support'];
  
  const grouped: Record<string, FAQ[]> = {};
  
  categories.forEach(category => {
    grouped[category] = faqs.filter(faq => faq.category === category);
  });
  
  return grouped;
}

// FAQ Item Component
function FAQItem({ faq }: { faq: FAQ }) {
  return (
    <details className="group border border-gray-200 rounded-lg mb-4">
      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-medium text-gray-900 pr-4">
          {faq.question}
        </h3>
        <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-6 pb-6">
        <p className="text-gray-700 mb-4">
          {faq.answer}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <CheckCircle className="w-4 h-4 mr-1" />
          {faq.helpful_count} people found this helpful
        </div>
      </div>
    </details>
  );
}

export default async function FAQPage() {
  const { faqs, supportStats } = await getFAQData();
  const groupedFAQs = groupFAQsByCategory(faqs);
  
  // Calculate resolution rate
  const resolutionRate = supportStats.total_tickets > 0 
    ? Math.round((supportStats.resolved_tickets / supportStats.total_tickets) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find quick answers to common questions about NextIntern
            </p>
            
            {/* Search Box */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support Stats */}
      {supportStats.total_tickets > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Our Support Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {resolutionRate}%
                </div>
                <div className="text-sm text-gray-600">
                  Resolution Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round(supportStats.avg_response_time)}h
                </div>
                <div className="text-sm text-gray-600">
                  Avg Response Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {supportStats.total_tickets}
                </div>
                <div className="text-sm text-gray-600">
                  Tickets This Month
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h3>
              <nav className="space-y-2">
                <a href="#getting-started" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Getting Started
                </a>
                <a href="#student-help" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Users className="w-4 h-4 mr-3" />
                  Student Help
                </a>
                <a href="#company-help" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Building2 className="w-4 h-4 mr-3" />
                  Company Help
                </a>
                <a href="#billing" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Clock className="w-4 h-4 mr-3" />
                  Billing & Plans
                </a>
                <a href="#safety" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Safety & Support
                </a>
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            
            {/* Getting Started */}
            <section id="getting-started" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <HelpCircle className="w-6 h-6 mr-3 text-primary-600" />
                  Getting Started
                </h2>
                {groupedFAQs['Getting Started']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Student Help */}
            <section id="student-help" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary-600" />
                  Student Help
                </h2>
                
                {/* Student Profile */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile & Applications</h3>
                {groupedFAQs['Student Profile']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Applications']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                
                {/* Student Features */}
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Platform Features</h3>
                {groupedFAQs['Student Features']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Company Help */}
            <section id="company-help" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building2 className="w-6 h-6 mr-3 text-primary-600" />
                  Company Help
                </h2>
                
                {/* Company Posting */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">Posting & Verification</h3>
                {groupedFAQs['Company Posting']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Company Verification']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                
                {/* Company Management */}
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Managing Applications</h3>
                {groupedFAQs['Company Management']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Billing & Plans */}
            <section id="billing" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-primary-600" />
                  Billing & Plans
                </h2>
                {groupedFAQs['Pricing & Billing']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Safety & Support */}
            <section id="safety" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-primary-600" />
                  Safety & Support
                </h2>
                {groupedFAQs['Privacy & Security']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Safety & Support']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              
              {/* Contact Support */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <MessageSquare className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get personalized help from our support team
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Us
                </a>
              </div>

              {/* Help Center */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <HelpCircle className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Help Center
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Browse detailed guides and tutorials
                </p>
                <a
                  href="/help"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Visit Help Center
                </a>
              </div>

              {/* Community */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Users className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Community Forum
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with other users and share experiences
                </p>
                <a
                  href="/resources"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Join Community
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}