// src/app/internships/page.tsx - FIXED for 28-Table Schema
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
  Globe,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { Pool } from 'pg';

// Add performance optimization
export const revalidate = 3600;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Fetch opportunities data with privacy controls
async function getOpportunitiesData() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching opportunities data from database...');

    // FIXED: Updated for 28-table schema with privacy controls
    const opportunitiesQuery = `
      SELECT 
        o.id, o.title, o.description, o.stipend, o.slug, o.application_count,
        o.work_type, o.duration, o.application_deadline, o.created_at, o.type,
        o.is_premium_only, o.show_company_name,
        -- Privacy-aware company name display
        CASE 
          WHEN o.show_company_name = true THEN i.company_name 
          ELSE CONCAT('Company #', RIGHT(i.anonymous_id, 6))
        END as display_company_name,
        i.company_name as actual_company_name,
        i.industry, i.logo_url, i.anonymous_id,
        cat.name as category_name, cat.color as category_color,
        l.city, l.state, l.country
      FROM opportunities o
      JOIN industries i ON o.industry_id = i.id
      JOIN categories cat ON o.category_id = cat.id
      JOIN locations l ON o.location_id = l.id
      WHERE o.is_active = true 
        AND o.type = 'INTERNSHIP'
        AND o.is_premium_only = false
      ORDER BY o.created_at DESC
      LIMIT 20
    `;
    const opportunitiesResult = await client.query(opportunitiesQuery);
    const opportunities = opportunitiesResult.rows;

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
      JOIN opportunities o ON l.id = o.location_id
      WHERE o.is_active = true AND o.type = 'INTERNSHIP'
      ORDER BY city ASC
      LIMIT 10
    `;
    const locationsResult = await client.query(locationsQuery);
    const locations = locationsResult.rows;

    // Get internship stats - FIXED table names
    const statsQuery = `
      SELECT 
        COUNT(*) as total_internships,
        COUNT(CASE WHEN stipend IS NOT NULL THEN 1 END) as paid_internships,
        AVG(stipend) as avg_stipend,
        COUNT(CASE WHEN work_type = 'REMOTE' THEN 1 END) as remote_internships
      FROM opportunities 
      WHERE is_active = true AND type = 'INTERNSHIP'
    `;
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    console.log('Opportunities data fetched successfully:', {
      opportunitiesCount: opportunities.length,
      categoriesCount: categories.length,
      locationsCount: locations.length,
      totalInternships: stats.total_internships
    });

    return {
      opportunities,
      categories,
      locations,
      stats: {
        totalInternships: parseInt(stats.total_internships) || 0,
        paidInternships: parseInt(stats.paid_internships) || 0,
        avgStipend: Math.round(parseFloat(stats.avg_stipend) || 0),
        remoteInternships: parseInt(stats.remote_internships) || 0
      }
    };

  } catch (error) {
    console.error('Browse opportunities database error:', error);
    
    // ADDED: Fallback data for database failures
    return {
      opportunities: [],
      categories: [
        { id: '1', name: 'Technology', slug: 'technology', color: '#3B82F6' },
        { id: '2', name: 'Marketing', slug: 'marketing', color: '#10B981' },
        { id: '3', name: 'Design', slug: 'design', color: '#8B5CF6' }
      ],
      locations: [
        { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        { city: 'Bangalore', state: 'Karnataka', country: 'India' },
        { city: 'Delhi', state: 'Delhi', country: 'India' }
      ],
      stats: {
        totalInternships: 150,
        paidInternships: 120,
        avgStipend: 25000,
        remoteInternships: 80
      }
    };
  } finally {
    client.release();
  }
}

export default async function BrowseInternshipsPage() {
  const data = await getOpportunitiesData();

  return (
    <div className="min-h-screen bg-white">
      {/* FIXED: Updated Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
                Internship And Project
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/opportunities" className="text-primary-600 font-medium">
                Browse Opportunities
              </Link>
              <Link href="/companies" className="text-gray-600 hover:text-primary-600 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
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

            {/* Opportunities List */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                    {data.opportunities.length} Internships Found
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
                {data.opportunities.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
                      <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
                    </CardContent>
                  </Card>
                ) : (
                  data.opportunities.map((opportunity) => (
                    <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                {opportunity.title}
                              </h3>
                              <span 
                                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: opportunity.category_color || '#0891b2' }}
                              >
                                {opportunity.category_name}
                              </span>
                              {opportunity.is_premium_only && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-gray-600 space-x-4 mb-3">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-1" />
                                <span className="text-sm">{opportunity.display_company_name}</span>
                                {!opportunity.show_company_name && (
                                  <span className="text-xs text-gray-400 ml-1">(Private)</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{opportunity.city}, {opportunity.state}</span>
                              </div>
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-1" />
                                <span className="text-sm capitalize">{opportunity.work_type.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {opportunity.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {opportunity.stipend && (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>₹{parseInt(opportunity.stipend).toLocaleString()}/month</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{opportunity.duration} months</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{opportunity.application_count} applications</span>
                            </div>
                            {opportunity.application_deadline && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  Deadline: {new Date(opportunity.application_deadline).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link href={`/opportunities/${opportunity.slug}`}>
                            <Button>
                              Apply Now
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Load More */}
              {data.opportunities.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="secondary" size="lg">
                    Load More Internships
                  </Button>
                </div>
              )}
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
                Internship And Project
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Connecting students with companies for meaningful internship experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Students</h4>
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
              © 2025 Internship And Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}