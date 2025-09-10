// src/app/page.tsx - Direct Database Connection
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Users, 
  Briefcase, 
  TrendingUp,
  Star,
  CheckCircle,
  Target,
  Globe,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Server Component - Fetch data directly from database
async function getStats() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching real data from database...');

    // Get basic counts
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM internships) as total_internships,
        (SELECT COUNT(*) FROM internships WHERE is_active = true) as active_internships,
        (SELECT COUNT(*) FROM companies) as total_companies,
        (SELECT COUNT(*) FROM companies WHERE is_verified = true) as verified_companies,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM applications WHERE status = 'ACCEPTED') as accepted_applications
    `;
    
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    // Get categories
    const categoriesQuery = `
      SELECT id, name, slug, description, color, icon
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order ASC 
      LIMIT 6
    `;
    const categoriesResult = await client.query(categoriesQuery);
    const categories = categoriesResult.rows;

    // Get recent internships with company and location info
    const internshipsQuery = `
      SELECT 
        i.id, i.title, i.description, i.stipend, i.slug, i.application_count,
        c.company_name,
        cat.name as category_name,
        l.city, l.state
      FROM internships i
      JOIN companies c ON i.company_id = c.id
      JOIN categories cat ON i.category_id = cat.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.is_active = true
      ORDER BY i.created_at DESC
      LIMIT 3
    `;
    const internshipsResult = await client.query(internshipsQuery);
    const recentInternships = internshipsResult.rows;

    // Calculate success rate
    const successRate = stats.total_students > 0 
      ? Math.round((stats.accepted_applications / stats.total_students) * 100) 
      : 0;

    console.log('Real data fetched successfully:', {
      totalInternships: stats.total_internships,
      activeInternships: stats.active_internships,
      totalCompanies: stats.total_companies,
      verifiedCompanies: stats.verified_companies,
      totalStudents: stats.total_students,
      totalApplications: stats.total_applications,
      successRate,
      categoriesCount: categories.length,
      recentInternshipsCount: recentInternships.length
    });

    return {
      totalInternships: parseInt(stats.total_internships),
      activeInternships: parseInt(stats.active_internships),
      totalCompanies: parseInt(stats.total_companies),
      verifiedCompanies: parseInt(stats.verified_companies),
      totalStudents: parseInt(stats.total_students),
      totalApplications: parseInt(stats.total_applications),
      successRate,
      categories,
      recentInternships
    };

  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error(`Failed to fetch data from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    client.release();
  }
}

export default async function LandingPage() {
  const stats = await getStats();

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold font-manrope text-gray-900 leading-tight">
                  Where 
                  <span className="text-primary-600"> Careers</span>
                  <br />
                  Begin
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connect with {stats.verifiedCompanies}+ verified companies and discover {stats.activeInternships}+ active internship opportunities. 
                  Start your career journey with NextIntern - the platform trusted by {stats.totalStudents}+ students.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/student">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Find Your Internship
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/company">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Hire Top Talent
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.9/5 rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">{stats.totalStudents}+ students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary-500" />
                  <span className="text-sm text-gray-600">{stats.verifiedCompanies} verified companies</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white font-medium ml-4">NextIntern Dashboard</span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="h-8 bg-primary-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </Card>
                    <Card className="p-4">
                      <div className="h-8 bg-primary-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </Card>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">+{stats.totalApplications} applications</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: `${stats.activeInternships}+`, label: "Active Internships", icon: Briefcase },
              { number: `${stats.verifiedCompanies}+`, label: "Partner Companies", icon: Users },
              { number: `${stats.totalStudents}+`, label: "Students Registered", icon: Target },
              { number: `${stats.successRate}%`, label: "Success Rate", icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 font-manrope">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
              Explore Top Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find internships across diverse fields and industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.categories.map((category) => (
              <Link href={`/categories/${category.slug}`} key={category.id}>
                <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white group cursor-pointer">
                  <CardHeader className="p-0 pb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: category.color ? `${category.color}15` : '#f0f9ff' }}
                    >
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: category.color || '#0891b2' }}
                      ></div>
                    </div>
                    <CardTitle className="text-xl font-manrope text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {category.description || `Explore exciting ${category.name.toLowerCase()} opportunities`}
                    </p>
                    <div className="flex items-center text-primary-600 font-medium">
                      View Opportunities
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Internships */}
      {stats.recentInternships.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 font-manrope mb-4">
                Latest Opportunities
              </h2>
              <p className="text-xl text-gray-600">
                Fresh internships posted by top companies
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {stats.recentInternships.map((internship) => (
                <Card key={internship.id} className="border-0 bg-gray-50 hover:bg-white hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        {internship.company_name}
                      </div>
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Active
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-manrope">
                      {internship.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        {internship.city}, {internship.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {internship.category_name}
                      </div>
                      {internship.stipend && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="h-4 w-4 mr-2" />
                          ₹{parseInt(internship.stipend).toLocaleString()}/month
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {internship.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {internship.application_count} applications
                      </span>
                      <Link href={`/internships/${internship.slug}`}>
                        <Button size="sm">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/internships">
                <Button size="lg" variant="secondary">
                  View All Internships
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-manrope mb-6">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join {stats.totalStudents}+ students who are building their careers with NextIntern. 
            Your next opportunity is just one click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/student">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Join as Student
              </Button>
            </Link>
            <Link href="/auth/company">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                Post Internships
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
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
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