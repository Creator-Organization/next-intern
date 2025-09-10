// src/app/companies/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  MapPin,
  Building,
  Users,
  ArrowRight,
  Star,
  Badge,
  Globe,
  Calendar,
  Briefcase,
  Award,
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

// Fetch companies data from database
async function getCompaniesData() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching companies data from database...');

    // Get verified companies with their internship stats
    const companiesQuery = `
      SELECT 
        c.id, c.company_name, c.industry, c.company_size, c.founded_year,
        c.description, c.website_url, c.logo_url, c.is_verified,
        c.city, c.state, c.country,
        COUNT(i.id) as total_internships,
        COUNT(CASE WHEN i.is_active = true THEN 1 END) as active_internships,
        AVG(i.stipend) as avg_stipend,
        COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as successful_hires
      FROM companies c
      LEFT JOIN internships i ON c.id = i.company_id
      LEFT JOIN applications a ON i.id = a.internship_id
      WHERE c.is_verified = true
      GROUP BY c.id, c.company_name, c.industry, c.company_size, c.founded_year,
               c.description, c.website_url, c.logo_url, c.is_verified,
               c.city, c.state, c.country
      HAVING COUNT(i.id) > 0
      ORDER BY active_internships DESC, c.company_name ASC
      LIMIT 20
    `;
    const companiesResult = await client.query(companiesQuery);
    const companies = companiesResult.rows;

    // Get industry distribution
    const industriesQuery = `
      SELECT 
        industry, 
        COUNT(*) as company_count,
        COUNT(CASE WHEN i.is_active = true THEN 1 END) as active_internships
      FROM companies c
      LEFT JOIN internships i ON c.id = i.company_id
      WHERE c.is_verified = true
      GROUP BY industry
      HAVING COUNT(i.id) > 0
      ORDER BY company_count DESC
    `;
    const industriesResult = await client.query(industriesQuery);
    const industries = industriesResult.rows;

    // Get company size distribution
    const sizesQuery = `
      SELECT 
        company_size, 
        COUNT(*) as count
      FROM companies 
      WHERE is_verified = true
      GROUP BY company_size
      ORDER BY 
        CASE company_size 
          WHEN 'STARTUP' THEN 1
          WHEN 'SMALL' THEN 2
          WHEN 'MEDIUM' THEN 3
          WHEN 'LARGE' THEN 4
          ELSE 5
        END
    `;
    const sizesResult = await client.query(sizesQuery);
    const sizes = sizesResult.rows;

    // Get overall stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as total_companies,
        COUNT(DISTINCT CASE WHEN i.is_active = true THEN i.id END) as total_active_internships,
        AVG(i.stipend) as avg_stipend,
        COUNT(DISTINCT a.student_id) as students_hired
      FROM companies c
      LEFT JOIN internships i ON c.id = i.company_id
      LEFT JOIN applications a ON i.id = a.internship_id AND a.status = 'ACCEPTED'
      WHERE c.is_verified = true
    `;
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    console.log('Companies data fetched successfully:', {
      companiesCount: companies.length,
      industriesCount: industries.length,
      sizesCount: sizes.length,
      totalCompanies: stats.total_companies,
      totalActiveInternships: stats.total_active_internships,
      avgStipend: stats.avg_stipend,
      studentsHired: stats.students_hired
    });

    return {
      companies,
      industries,
      sizes,
      stats: {
        totalCompanies: parseInt(stats.total_companies),
        totalActiveInternships: parseInt(stats.total_active_internships),
        avgStipend: Math.round(parseFloat(stats.avg_stipend) || 0),
        studentsHired: parseInt(stats.students_hired)
      }
    };

  } catch (error) {
    console.error('Companies directory database error:', error);
    throw new Error(`Failed to fetch companies data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    client.release();
  }
}

export default async function CompaniesPage() {
  const data = await getCompaniesData();

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
              <Link href="/companies" className="text-primary-600 font-medium">
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
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold font-manrope text-gray-900 mb-6">
              Top Companies
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover {data.stats.totalCompanies}+ verified companies offering internships. 
              Connect with industry leaders and growing startups across various sectors.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white">
                    <option value="">All Industries</option>
                    {data.industries.map((industry, index) => (
                      <option key={index} value={industry.industry}>
                        {industry.industry} ({industry.company_count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button size="lg" className="w-full md:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Search Companies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {data.stats.totalCompanies}+
              </div>
              <div className="text-gray-600 mt-1">Verified Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {data.stats.totalActiveInternships}+
              </div>
              <div className="text-gray-600 mt-1">Open Positions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                ₹{data.stats.avgStipend.toLocaleString()}
              </div>
              <div className="text-gray-600 mt-1">Avg Monthly Stipend</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {data.stats.studentsHired}+
              </div>
              <div className="text-gray-600 mt-1">Students Hired</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="mr-2 h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Size Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Company Size</h3>
                    <div className="space-y-2">
                      {data.sizes.map((size) => (
                        <label key={size.company_size} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-2 text-sm text-gray-600 capitalize">
                              {size.company_size.toLowerCase()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">({size.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Industry Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Industry</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {data.industries.slice(0, 10).map((industry, index) => (
                        <label key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-2 text-sm text-gray-600">{industry.industry}</span>
                          </div>
                          <span className="text-xs text-gray-500">({industry.company_count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Active Internships Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Internship Status</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-600">Currently Hiring</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-600">High Response Rate</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Companies List */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                    {data.companies.length} Companies Found
                  </h2>
                  <p className="text-gray-600">Verified companies with active internships</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Most Active</option>
                    <option>Company Name</option>
                    <option>Industry</option>
                    <option>Recently Joined</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6">
                {data.companies.map((company) => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Company Logo Placeholder */}
                        <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="h-8 w-8 text-primary-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 font-manrope truncate">
                              {company.company_name}
                            </h3>
                            {company.is_verified && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                            <span className="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                              {company.industry}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 space-x-4 mb-3 text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{company.city}, {company.state}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="capitalize">{company.company_size?.toLowerCase()}</span>
                            </div>
                            {company.founded_year && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Founded {company.founded_year}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {company.description || `${company.company_name} is a leading company in the ${company.industry} industry, offering exciting internship opportunities for students.`}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center text-primary-600">
                                <Briefcase className="h-4 w-4 mr-1" />
                                <span className="font-medium">{company.active_internships} open positions</span>
                              </div>
                              {company.avg_stipend && (
                                <div className="flex items-center text-gray-600">
                                  <Award className="h-4 w-4 mr-1" />
                                  <span>Avg ₹{Math.round(company.avg_stipend).toLocaleString()}/month</span>
                                </div>
                              )}
                              <div className="flex items-center text-gray-600">
                                <Star className="h-4 w-4 mr-1" />
                                <span>{company.successful_hires} hires</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {company.website_url && (
                                <Button variant="secondary" size="sm">
                                  <Globe className="h-4 w-4 mr-1" />
                                  Visit Website
                                </Button>
                              )}
                              <Link href={`/companies/${company.id}`}>
                                <Button size="sm">
                                  View Profile
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="secondary" size="lg">
                  Load More Companies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-manrope mb-4">
              Industries on NextIntern
            </h2>
            <p className="text-lg text-gray-600">
              Explore opportunities across diverse sectors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.industries.slice(0, 6).map((industry, index) => (
              <Card key={index} className="text-center p-6 border-0 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-manrope">
                    {industry.industry}
                  </h3>
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {industry.company_count}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Companies</p>
                  <div className="text-sm text-gray-500">
                    {industry.active_internships} active internships
                  </div>
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
            Ready to Connect with Top Companies?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join {data.stats.studentsHired}+ students who found their career opportunities 
            through our verified company network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/student">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Student Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/internships">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                Browse All Internships
                <Briefcase className="ml-2 h-5 w-5" />
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