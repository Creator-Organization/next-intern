// src/app/internships/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  MapPin,
  Building,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Star,
  Bookmark,
  Calendar,
  Globe
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

// Fetch internships and filter data from database
async function getInternshipsData() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching internships data from database...');

    // Get active internships with company and location info
    const internshipsQuery = `
      SELECT 
        i.id, i.title, i.description, i.stipend, i.slug, i.application_count,
        i.work_type, i.duration, i.application_deadline, i.created_at,
        c.company_name, c.industry, c.logo_url,
        cat.name as category_name, cat.color as category_color,
        l.city, l.state, l.country
      FROM internships i
      JOIN companies c ON i.company_id = c.id
      JOIN categories cat ON i.category_id = cat.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.is_active = true
      ORDER BY i.created_at DESC
      LIMIT 20
    `;
    const internshipsResult = await client.query(internshipsQuery);
    const internships = internshipsResult.rows;

    // Get categories for filters
    const categoriesQuery = `
      SELECT id, name, slug, color
      FROM categories 
      WHERE is_active = true 
      ORDER BY name ASC
    `;
    const categoriesResult = await client.query(categoriesQuery);
    const categories = categoriesResult.rows;

    // Get locations for filters
    const locationsQuery = `
      SELECT DISTINCT city, state, country
      FROM locations l
      JOIN internships i ON l.id = i.location_id
      WHERE i.is_active = true
      ORDER BY city ASC
      LIMIT 10
    `;
    const locationsResult = await client.query(locationsQuery);
    const locations = locationsResult.rows;

    // Get internship stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_internships,
        COUNT(CASE WHEN stipend IS NOT NULL THEN 1 END) as paid_internships,
        AVG(stipend) as avg_stipend,
        COUNT(CASE WHEN work_type = 'REMOTE' THEN 1 END) as remote_internships
      FROM internships 
      WHERE is_active = true
    `;
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    console.log('Internships data fetched successfully:', {
      internshipsCount: internships.length,
      categoriesCount: categories.length,
      locationsCount: locations.length,
      totalInternships: stats.total_internships,
      paidInternships: stats.paid_internships,
      avgStipend: stats.avg_stipend,
      remoteInternships: stats.remote_internships
    });

    return {
      internships,
      categories,
      locations,
      stats: {
        totalInternships: parseInt(stats.total_internships),
        paidInternships: parseInt(stats.paid_internships),
        avgStipend: Math.round(parseFloat(stats.avg_stipend) || 0),
        remoteInternships: parseInt(stats.remote_internships)
      }
    };

  } catch (error) {
    console.error('Browse internships database error:', error);
    throw new Error(`Failed to fetch internships data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    client.release();
  }
}

export default async function BrowseInternshipsPage() {
  const data = await getInternshipsData();

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
              <Link href="/internships" className="text-primary-600 font-medium">
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
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold font-manrope text-gray-900 mb-6">
              Browse Internships
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover {data.stats.totalInternships}+ internship opportunities from verified companies. 
              Find your perfect match and kickstart your career today.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search internships..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white">
                    <option value="">All Locations</option>
                    {data.locations.map((location, index) => (
                      <option key={index} value={`${location.city}, ${location.state}`}>
                        {location.city}, {location.state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white">
                    <option value="">All Categories</option>
                    {data.categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button size="lg" className="w-full md:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Search Internships
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
                {data.stats.totalInternships}+
              </div>
              <div className="text-gray-600 mt-1">Total Internships</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {data.stats.paidInternships}
              </div>
              <div className="text-gray-600 mt-1">Paid Opportunities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                ₹{data.stats.avgStipend.toLocaleString()}
              </div>
              <div className="text-gray-600 mt-1">Avg Monthly Stipend</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 font-manrope">
                {data.stats.remoteInternships}
              </div>
              <div className="text-gray-600 mt-1">Remote Options</div>
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
                  {/* Work Type Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Work Type</h3>
                    <div className="space-y-2">
                      {['Remote', 'On-site', 'Hybrid'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-600">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Duration</h3>
                    <div className="space-y-2">
                      {['1-3 months', '4-6 months', '6+ months'].map((duration) => (
                        <label key={duration} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-600">{duration}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stipend Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Stipend Range</h3>
                    <div className="space-y-2">
                      {['Unpaid', '₹5,000 - ₹15,000', '₹15,000 - ₹30,000', '₹30,000+'].map((range) => (
                        <label key={range} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-600">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categories Filter */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {data.categories.slice(0, 8).map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Internships List */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                    {data.internships.length} Internships Found
                  </h2>
                  <p className="text-gray-600">Showing latest opportunities</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Latest</option>
                    <option>Stipend: High to Low</option>
                    <option>Stipend: Low to High</option>
                    <option>Application Deadline</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {data.internships.map((internship) => (
                  <Card key={internship.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 font-manrope">
                              {internship.title}
                            </h3>
                            <span 
                              className="px-2 py-1 text-xs font-medium rounded-full text-white"
                              style={{ backgroundColor: internship.category_color || '#0891b2' }}
                            >
                              {internship.category_name}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 space-x-4 mb-3">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              <span className="text-sm">{internship.company_name}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{internship.city}, {internship.state}</span>
                            </div>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              <span className="text-sm capitalize">{internship.work_type.toLowerCase()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {internship.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {internship.stipend && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>₹{parseInt(internship.stipend).toLocaleString()}/month</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{internship.duration} weeks</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{internship.application_count} applications</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              Deadline: {new Date(internship.application_deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/internships/${internship.slug}`}>
                          <Button>
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="secondary" size="lg">
                  Load More Internships
                </Button>
              </div>
            </div>
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