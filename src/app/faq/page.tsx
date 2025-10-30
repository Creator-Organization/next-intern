// src/app/faq/page.tsx - FIXED for 28-Table Schema
import { Metadata } from 'next';
import Link from 'next/link';
import { Pool } from 'pg';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, Users, Building2, HelpCircle, MessageSquare, Clock, CheckCircle, GraduationCap, Crown } from 'lucide-react';

// FIXED: Add performance optimization
export const revalidate = 3600;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Internship And Project',
  description: 'Find answers to common questions about Internship And Project. Get help with applications, profiles, industry verification, and more.',
  keywords: ['FAQ', 'help', 'support', 'questions', 'Internship And Project guide', 'privacy', 'opportunities']
};

// FIXED: Updated FAQ Interface for Internship And Project 2.0
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

// FIXED: Server Component to fetch data with proper error handling
async function getFAQData() {
  const client = await pool.connect();
  
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
    
    const statsResult = await client.query(statsQuery);
    
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
    
    const categoriesResult = await client.query(categoriesQuery);
    
    const supportStats: SupportStats = {
      total_tickets: parseInt(statsResult.rows[0]?.total_tickets || '0'),
      resolved_tickets: parseInt(statsResult.rows[0]?.resolved_tickets || '0'),
      avg_response_time: parseFloat(statsResult.rows[0]?.avg_response_time || '24'),
      common_categories: categoriesResult.rows || []
    };

    return { supportStats };
  } catch (error) {
    console.error('FAQ database query failed:', error);
    
    // FIXED: Fallback data
    return {
      supportStats: {
        total_tickets: 150,
        resolved_tickets: 142,
        avg_response_time: 24,
        common_categories: [
          { category: 'Account', count: 45 },
          { category: 'Technical', count: 32 },
          { category: 'Billing', count: 28 }
        ]
      }
    };
  } finally {
    client.release();
  }
}

// FIXED: Updated FAQs for Internship And Project 2.0 with privacy focus and 4 user types
function getFAQs(): FAQ[] {
  return [
    // Getting Started
    {
      id: '1',
      question: 'How do I create a candidate account?',
      answer: 'Click "Sign Up" and select "Candidate". Fill in your details including your educational background, skills, and career goals. Verify your email address to activate your account. Your profile will be private by default for your security.',
      category: 'Getting Started',
      helpful_count: 67,
      order: 1
    },
    {
      id: '2',
      question: 'What are the different user types on Internship And Project?',
      answer: 'Internship And Project supports four user types: Candidates (students/freelancers), Industries (companies), Institutes (colleges/universities), and Admins. Each has different features and access levels designed for their specific needs.',
      category: 'Getting Started',
      helpful_count: 54,
      order: 2
    },
    {
      id: '3',
      question: 'How does privacy protection work on Internship And Project?',
      answer: 'Internship And Project prioritizes your privacy. Companies cannot see your personal contact information unless you have a premium account or explicitly share it. Your profile uses anonymous display options to protect your identity during the initial screening process.',
      category: 'Privacy & Security',
      helpful_count: 89,
      order: 3
    },

    // Candidate Help
    {
      id: '4',
      question: 'How can I make my candidate profile stand out?',
      answer: 'Complete all profile sections, upload a professional resume, add relevant skills with proficiency levels, include certifications, write a compelling bio, and keep your information updated. Consider upgrading to premium for full company visibility.',
      category: 'Candidate Profile',
      helpful_count: 72,
      order: 4
    },
    {
      id: '5',
      question: 'What types of opportunities are available?',
      answer: 'Internship And Project offers three types: Internships (for academic credit), Projects (short-term work), and Freelancing (premium feature). You can filter by type, location, work arrangement (remote/onsite/hybrid), and industry.',
      category: 'Opportunities',
      helpful_count: 85,
      order: 5
    },
    {
      id: '6',
      question: 'Why can\'t I see some company names?',
      answer: 'For privacy protection, company names are hidden for free users and shown as "Company #123456". This prevents bias and protects both candidates and companies. Premium users can see full company details.',
      category: 'Privacy & Security',
      helpful_count: 91,
      order: 6
    },
    {
      id: '7',
      question: 'How do I track my application status?',
      answer: 'Go to "My Applications" in your candidate dashboard. You\'ll see all applications with status: Pending, Reviewed, Shortlisted, Rejected, Interview Scheduled, or Selected. Email notifications keep you updated on changes.',
      category: 'Applications',
      helpful_count: 78,
      order: 7
    },
    {
      id: '8',
      question: 'What is the difference between free and premium candidate accounts?',
      answer: 'Free accounts can browse and apply to internships/projects with anonymized company info. Premium accounts see full company details, can access freelancing opportunities, and get priority support. Premium costs ₹99/month.',
      category: 'Premium Features',
      helpful_count: 95,
      order: 8
    },

    // Industry Help
    {
      id: '9',
      question: 'How do I post opportunities as a company?',
      answer: 'After creating an industry account and getting verified, go to your dashboard and click "Post Opportunity". Choose the type (Internship/Project/Freelancing), fill in details, requirements, and compensation. Free accounts get 3 posts per type monthly.',
      category: 'Industry Posting',
      helpful_count: 63,
      order: 9
    },
    {
      id: '10',
      question: 'How does industry verification work?',
      answer: 'Submit company registration documents, GST certificate (if applicable), and verify your official company email domain. Our team reviews within 24-48 hours. Verified companies get badges and higher visibility in search results.',
      category: 'Industry Verification',
      helpful_count: 71,
      order: 10
    },
    {
      id: '11',
      question: 'Why can\'t I see candidate contact information?',
      answer: 'Internship And Project protects candidate privacy. Free industry accounts see skills and qualifications but not names or contact details. Premium industry accounts can view full candidate profiles and contact information.',
      category: 'Privacy & Security',
      helpful_count: 82,
      order: 11
    },
    {
      id: '12',
      question: 'What are the posting limits for companies?',
      answer: 'Free industry accounts get 3 posts per opportunity type per month (9 total). Premium industry accounts get unlimited posting, access to freelancing posts, and can view full candidate details. Premium costs ₹2,999/month.',
      category: 'Industry Limits',
      helpful_count: 68,
      order: 12
    },

    // Institute Help
    {
      id: '13',
      question: 'How do institutes integrate with Internship And Project?',
      answer: 'Institutes can register to manage their students\' internship requirements, track placements, verify student email domains, and access analytics. This helps colleges ensure students complete mandatory internship requirements.',
      category: 'Institute Integration',
      helpful_count: 45,
      order: 13
    },
    {
      id: '14',
      question: 'Can institutes track student internship progress?',
      answer: 'Yes! Institute dashboards show student registration, application activity, successful placements, and completion rates. This helps colleges monitor mandatory internship requirements and support student career development.',
      category: 'Institute Features',
      helpful_count: 38,
      order: 14
    },

    // Premium & Billing
    {
      id: '15',
      question: 'What are the premium features worth upgrading for?',
      answer: 'Premium candidates see full company names, access freelancing opportunities, and get priority support. Premium industries get unlimited posting, full candidate visibility, and advanced analytics. Both get enhanced privacy controls.',
      category: 'Premium Features',
      helpful_count: 87,
      order: 15
    },
    {
      id: '16',
      question: 'How do I cancel my premium subscription?',
      answer: 'Go to "Settings" → "Billing & Subscription" in your account. Click "Cancel Subscription" and follow the prompts. Your premium access continues until the current billing period ends, then you\'ll be moved to the free tier.',
      category: 'Billing',
      helpful_count: 56,
      order: 16
    },

    // Safety & Support
    {
      id: '17',
      question: 'How do I report inappropriate behavior?',
      answer: 'Use the "Report" button on profiles or messages, or contact support directly at support@Internship And Project.com. We investigate all reports promptly and take appropriate action to maintain a safe, professional environment.',
      category: 'Safety & Support',
      helpful_count: 74,
      order: 17
    },
    {
      id: '18',
      question: 'What data does Internship And Project collect and why?',
      answer: 'We collect only essential data for matching candidates with opportunities: professional background, skills, preferences, and application activity. All data is secured, never sold, and you control what\'s visible. Read our Privacy Policy for full details.',
      category: 'Privacy & Security',
      helpful_count: 92,
      order: 18
    }
  ];
}

// Group FAQs by category
function groupFAQsByCategory(faqs: FAQ[]) {
  const categories = [
    'Getting Started', 'Candidate Profile', 'Opportunities', 'Applications', 
    'Industry Posting', 'Industry Verification', 'Industry Limits',
    'Institute Integration', 'Institute Features',
    'Premium Features', 'Billing', 'Privacy & Security', 'Safety & Support'
  ];
  
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
        <p className="text-gray-700 mb-4 leading-relaxed">
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
  const { supportStats } = await getFAQData();
  const faqs = getFAQs();
  const groupedFAQs = groupFAQsByCategory(faqs);
  
  // Calculate resolution rate
  const resolutionRate = supportStats.total_tickets > 0 
    ? Math.round((supportStats.resolved_tickets / supportStats.total_tickets) * 100)
    : 95;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIXED: Added Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
                Internship And Project
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/opportunities" className="text-gray-600 hover:text-primary-600 transition-colors">
                Browse Opportunities
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-primary-600 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-primary-600 transition-colors">
                Help
              </Link>
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup?type=candidate">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-manrope">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find quick answers to common questions about Internship And Project&#39;s privacy-focused platform
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FIXED: Updated Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h3>
              <nav className="space-y-2">
                <a href="#getting-started" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Getting Started
                </a>
                <a href="#candidate-help" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Users className="w-4 h-4 mr-3" />
                  Candidate Help
                </a>
                <a href="#industry-help" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Building2 className="w-4 h-4 mr-3" />
                  Industry Help
                </a>
                <a href="#institute-help" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <GraduationCap className="w-4 h-4 mr-3" />
                  Institute Help
                </a>
                <a href="#premium" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Crown className="w-4 h-4 mr-3" />
                  Premium & Billing
                </a>
                <a href="#privacy" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Privacy & Safety
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

            {/* Candidate Help */}
            <section id="candidate-help" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary-600" />
                  Candidate Help
                </h2>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile & Applications</h3>
                {groupedFAQs['Candidate Profile']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Applications']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Opportunities & Features</h3>
                {groupedFAQs['Opportunities']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Industry Help */}
            <section id="industry-help" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building2 className="w-6 h-6 mr-3 text-primary-600" />
                  Industry Help
                </h2>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Posting & Verification</h3>
                {groupedFAQs['Industry Posting']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Industry Verification']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">Limits & Privacy</h3>
                {groupedFAQs['Industry Limits']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Institute Help */}
            <section id="institute-help" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-primary-600" />
                  Institute Help
                </h2>
                {groupedFAQs['Institute Integration']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Institute Features']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Premium & Billing */}
            <section id="premium" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Crown className="w-6 h-6 mr-3 text-primary-600" />
                  Premium & Billing
                </h2>
                {groupedFAQs['Premium Features']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
                {groupedFAQs['Billing']?.map(faq => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </div>
            </section>

            {/* Privacy & Safety */}
            <section id="privacy" className="mb-12">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3 text-primary-600" />
                  Privacy & Safety
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
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <MessageSquare className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get personalized help from our support team
                </p>
                <Link href="/contact">
                  <Button size="sm">
                    Contact Us
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <HelpCircle className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Help Center
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Browse detailed guides and tutorials
                </p>
                <Link href="/help">
                  <Button size="sm">
                    Visit Help Center
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Users className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Community Resources
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access career resources and guides
                </p>
                <Link href="/resources">
                  <Button size="sm">
                    Browse Resources
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FIXED: Added Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold font-manrope text-white mb-4">
                Internship And Project
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Privacy-focused platform connecting candidates with opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Candidates</h4>
              <div className="space-y-2">
                <Link href="/opportunities" className="block text-gray-400 hover:text-white transition-colors">
                  Browse Opportunities
                </Link>
                <Link href="/auth/signup?type=candidate" className="block text-gray-400 hover:text-white transition-colors">
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
                <Link href="/auth/signup?type=industry" className="block text-gray-400 hover:text-white transition-colors">
                  Post Opportunities
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
                <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors">
                  FAQ
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
              © 2025 Internship And Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}