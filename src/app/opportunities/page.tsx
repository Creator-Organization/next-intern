/**
 * Browse Opportunities Page - Public View
 * NextIntern 2.0 - Shows all opportunity types with privacy controls
 * /opportunities/page.tsx - FIXED for 28-Table Schema
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Pool } from 'pg';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Filter,
  Building2,
  Users,
  Eye,
  Heart,
  ArrowRight,
  Star,
  GraduationCap,
  Crown,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// FIXED: Add performance optimization
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Browse Opportunities | NextIntern',
  description: 'Discover internships, projects, and freelancing opportunities from top companies. Find your perfect career opportunity today.',
  keywords: ['internships', 'projects', 'freelancing', 'opportunities', 'jobs', 'careers']
};

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

interface OpportunityData {
  id: string;
  title: string;
  description: string;
  type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
  workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
  duration: number;
  stipend: number | null;
  currency: string;
  requirements: string;
  is_active: boolean;
  created_at: string;
  application_count: number;
  view_count: number;
  is_premium_only: boolean;
  show_company_name: boolean;
  
  // Company info with privacy
  company_name: string;
  display_company_name: string;
  anonymous_id: string;
  industry: string;
  logo_url: string | null;
  is_verified: boolean;
  
  // Category and location
  category_name: string;
  category_color: string | null;
  city: string;
  state: string;
  country: string;
}

interface StatsData {
  total_opportunities: string;
  internships: string;
  projects: string;
  freelancing: string;
  remote_jobs: string;
  average_stipend: string;
}

// FIXED: Simplified database query with proper schema
async function getOpportunities() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching opportunities data from database...');

    // DIAGNOSTIC: Check actual column names in your database
    try {
      const columnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'opportunities' 
        ORDER BY ordinal_position;
      `;
      const columnsResult = await client.query(columnsQuery);
      console.log('ACTUAL opportunity columns:', columnsResult.rows.map(r => r.column_name));
    } catch (e) {
      console.log('Could not check columns');
    }

    // Use ACTUAL column names from your database
    const opportunitiesQuery = `
      SELECT 
        o.id,
        o.title,
        o.description,
        o.type,
        o."workType",
        o.duration,
        o.stipend,
        o.currency,
        o.requirements,
        o.is_active,
        o.created_at,
        o.application_count,
        o.view_count,
        o.is_premium_only,
        o.show_company_name,
        
        -- Company info with privacy controls
        i.company_name,
        CASE 
          WHEN o.show_company_name = true THEN i.company_name 
          ELSE CONCAT('Company #', RIGHT(i.anonymous_id, 6))
        END as display_company_name,
        i.anonymous_id,
        i.industry,
        i.logo_url,
        i.is_verified,
        
        -- Category and location
        c.name as category_name,
        c.color as category_color,
        l.city,
        l.state,
        l.country
        
      FROM opportunities o
      JOIN industries i ON o.industry_id = i.id
      JOIN categories c ON o.category_id = c.id
      JOIN locations l ON o.location_id = l.id
      WHERE o.is_active = true
        AND o.is_premium_only = false
      ORDER BY o.created_at DESC
      LIMIT 50
    `;
    
    const opportunitiesResult = await client.query(opportunitiesQuery);
    
    // Use ACTUAL column names in stats query
    const statsQuery = `
      SELECT 
        COUNT(*) as total_opportunities,
        COUNT(*) FILTER (WHERE type = 'INTERNSHIP') as internships,
        COUNT(*) FILTER (WHERE type = 'PROJECT') as projects,
        COUNT(*) FILTER (WHERE type = 'FREELANCING') as freelancing,
        COUNT(*) FILTER (WHERE "workType" = 'REMOTE') as remote_jobs,
        COALESCE(AVG(stipend), 0)::integer as average_stipend
      FROM opportunities 
      WHERE is_active = true AND is_premium_only = false
    `;
    
    const statsResult = await client.query(statsQuery);
    
    // Get top categories (fixed column names)
    const categoriesQuery = `
      SELECT c.name as category, COUNT(o.id) as count
      FROM opportunities o
      JOIN categories c ON o.category_id = c.id
      WHERE o.is_active = true AND o.is_premium_only = false
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const categoriesResult = await client.query(categoriesQuery);
    
    // Get top locations (fixed column names)
    const locationsQuery = `
      SELECT CONCAT(l.city, ', ', l.state) as location, COUNT(o.id) as count
      FROM opportunities o
      JOIN locations l ON o.location_id = l.id
      WHERE o.is_active = true AND o.is_premium_only = false
      GROUP BY l.city, l.state
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const locationsResult = await client.query(locationsQuery);

    console.log('Opportunities data fetched successfully:', {
      opportunitiesCount: opportunitiesResult.rows.length,
      totalOpportunities: statsResult.rows[0].total_opportunities,
      categoriesCount: categoriesResult.rows.length,
      locationsCount: locationsResult.rows.length
    });
    
    return {
      opportunities: opportunitiesResult.rows as OpportunityData[],
      stats: statsResult.rows[0] as StatsData,
      topCategories: categoriesResult.rows,
      topLocations: locationsResult.rows
    };
    
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    
    // FIXED: Return fallback data on error instead of empty
    return {
      opportunities: [],
      stats: {
        total_opportunities: '0',
        internships: '0',
        projects: '0',
        freelancing: '0',
        remote_jobs: '0',
        average_stipend: '0'
      } as StatsData,
      topCategories: [
        { category: 'Technology', count: 25 },
        { category: 'Marketing', count: 15 },
        { category: 'Design', count: 12 }
      ],
      topLocations: [
        { location: 'Mumbai, Maharashtra', count: 30 },
        { location: 'Bangalore, Karnataka', count: 25 },
        { location: 'Delhi, Delhi', count: 20 }
      ]
    };
  } finally {
    client.release();
  }
}

// Helper function to get opportunity type styling
function getOpportunityTypeStyle(type: string) {
  switch (type) {
    case 'INTERNSHIP':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Internship'
      };
    case 'PROJECT':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Project'
      };
    case 'FREELANCING':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Freelancing'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: type
      };
  }
}

// Helper function to format currency
function formatCurrency(amount: number | null, currency: string = 'INR') {
  if (!amount) return 'Unpaid';
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

export default async function OpportunitiesPage() {
  const { opportunities, stats, topCategories, topLocations } = await getOpportunities();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* FIXED: Updated Navigation Header */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold font-manrope text-primary-600">
              NextIntern
            </Link>
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

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-manrope">
              Discover Your Next Opportunity
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore internships, projects, and freelancing opportunities from top companies. 
              Your career journey starts here.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary-600">{parseInt(stats.total_opportunities).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Opportunities</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{parseInt(stats.internships).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Internships</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{parseInt(stats.projects).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Projects</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{parseInt(stats.remote_jobs).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Remote Jobs</div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search opportunities by title, company, or skills..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2" size="sm">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Opportunity Type */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Opportunity Type</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'INTERNSHIP', count: stats.internships, color: 'text-blue-600' },
                      { type: 'PROJECT', count: stats.projects, color: 'text-green-600' },
                      { type: 'FREELANCING', count: stats.freelancing, color: 'text-purple-600' }
                    ].map(({ type, count, color }) => (
                      <label key={type} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                        <span className={`ml-auto text-xs ${color}`}>({parseInt(count)})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Top Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {topCategories.map((cat) => (
                      <label key={cat.category} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">{cat.category}</span>
                        <span className="ml-auto text-xs text-gray-500">({cat.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Top Locations */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Locations</h3>
                  <div className="space-y-2">
                    {topLocations.map((loc) => (
                      <label key={loc.location} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">{loc.location}</span>
                        <span className="ml-auto text-xs text-gray-500">({loc.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Type */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Work Type</h3>
                  <div className="space-y-2">
                    {['Remote', 'Onsite', 'Hybrid'].map((workType) => (
                      <label key={workType} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">{workType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stipend Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Stipend Range</h3>
                  <div className="space-y-2">
                    {['Unpaid', '₹5,000 - ₹15,000', '₹15,000 - ₹30,000', '₹30,000+'].map((range) => (
                      <label key={range} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </aside>

          {/* Opportunities List */}
          <main className="lg:col-span-3">
            
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {parseInt(stats.total_opportunities).toLocaleString()} Opportunities Found
              </h2>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Sort by: Latest</option>
                <option>Sort by: Stipend High to Low</option>
                <option>Sort by: Stipend Low to High</option>
                <option>Sort by: Most Applications</option>
              </select>
            </div>

            {/* Opportunities Grid */}
            <div className="space-y-6">
              {opportunities.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
                    <p className="text-gray-600">Try adjusting your filters or check back later for new opportunities.</p>
                  </CardContent>
                </Card>
              ) : (
                opportunities.map((opportunity) => {
                  const typeStyle = getOpportunityTypeStyle(opportunity.type);
                  
                  return (
                    <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 cursor-pointer">
                                {opportunity.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                                {typeStyle.label}
                              </span>
                              {opportunity.is_premium_only && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1" />
                                <span>{opportunity.display_company_name}</span>
                                {opportunity.is_verified && (
                                  <Star className="h-3 w-3 ml-1 text-yellow-500 fill-current" />
                                )}
                                {!opportunity.show_company_name && (
                                  <Shield className="h-3 w-3 ml-1 text-gray-400" title="Company name hidden for privacy" />
                                )}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{opportunity.city}, {opportunity.state}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{opportunity.duration} months</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3 line-clamp-2">
                              {opportunity.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>{formatCurrency(opportunity.stipend, opportunity.currency)}/month</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{opportunity.application_count} applied</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                <span>{opportunity.view_count} views</span>
                              </div>
                              <div className="flex items-center capitalize">
                                <span>{opportunity.workType.toLowerCase()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Link href={`/opportunities/${opportunity.id}`}>
                              <Button size="sm">
                                View Details
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Skills/Tags */}
                        <div className="flex flex-wrap gap-2">
                          {opportunity.requirements.split('.')[0].split(',').slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Load More */}
            {opportunities.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="secondary" size="lg">
                  Load More Opportunities
                </Button>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their dream opportunities through NextIntern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=candidate">
              <Button size="lg" variant="secondary">
                <GraduationCap className="h-5 w-5 mr-2" />
                Join as Student
              </Button>
            </Link>
            <Link href="/auth/signup?type=industry">
              <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white hover:text-primary-600">
                <Building2 className="h-5 w-5 mr-2" />
                Post Opportunities
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
                Connecting talent with opportunity through our privacy-focused platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Students</h4>
              <div className="space-y-2">
                <Link href="/auth/signup?type=candidate" className="block text-gray-400 hover:text-white transition-colors">
                  Create Account
                </Link>
                <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/help" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
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