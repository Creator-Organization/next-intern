// src/app/candidate/saved/page.tsx
// Saved Opportunities Page - NextIntern 2.0

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bookmark, 
  BookmarkX,
  Briefcase,
  User,
  FileText,
  Clock, 
  Wallet,
  Building,
  MapPin,
  Crown,
  EyeOff,
  Check,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface SavedOpportunity {
  id: string;
  savedAt: Date;
  opportunity: {
    id: string;
    title: string;
    description: string;
    type: 'INTERNSHIP' | 'PROJECT' | 'FREELANCING';
    workType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    stipend?: number;
    currency: string;
    duration?: number;
    applicationCount: number;
    isPremiumOnly: boolean;
    showCompanyName: boolean;
    location: {
      city: string;
      state: string;
      country: string;
    };
    industry: {
      id: string;
      companyName: string;
      industry: string;
      isVerified: boolean;
      showCompanyName: boolean;
      anonymousId: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
    skills: Array<{
      skillName: string;
      isRequired: boolean;
    }>;
  };
}

const SavedPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchSavedOpportunities = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/candidate/saved');
        if (response.ok) {
          const data = await response.json();
          setSavedOpportunities(data.data || []);
        } else {
          // Fallback empty data
          setSavedOpportunities([]);
        }
      } catch (error) {
        console.error('Failed to fetch saved opportunities:', error);
        setSavedOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedOpportunities();
  }, [status]);

  const handleUnsave = async (opportunityId: string) => {
    try {
      const response = await fetch(`/api/candidates/saved/${opportunityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSavedOpportunities(prev => 
          prev.filter(saved => saved.opportunity.id !== opportunityId)
        );
      }
    } catch (error) {
      console.error('Failed to unsave opportunity:', error);
    }
  };

  const getCompanyDisplayName = (industry: SavedOpportunity['opportunity']['industry'], isPremium: boolean) => {
    if (industry.showCompanyName || isPremium) {
      return industry.companyName;
    }
    return `Company #${industry.anonymousId.slice(-3)}`;
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved opportunities...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = session?.user;
  const isPremium = user?.isPremium || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user ? {
        id: user.id,
        email: user.email || '',
        userType: user.userType,
        candidate: user.name ? {
          firstName: user.name.split(' ')[0] || '',
          lastName: user.name.split(' ')[1] || ''
        } : undefined
      } : undefined} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-manrope">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Link href="/candidate" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <Briefcase className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/candidate/applications" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <FileText className="h-5 w-5" />
                    <span>My Applications</span>
                  </Link>
                  <div className="flex items-center space-x-3 text-primary-600 font-semibold bg-primary-50 p-3 rounded-lg border-l-4 border-primary-500">
                    <Bookmark className="h-5 w-5" />
                    <span>Saved</span>
                  </div>
                  <Link href="/candidate/profile" className="flex items-center space-x-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-3 rounded-lg transition-colors">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">
                      Saved Opportunities
                    </h1>
                    <p className="text-gray-600">
                      Keep track of opportunities you&#39;re interested in applying to later.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{savedOpportunities.length}</p>
                    <p className="text-sm text-gray-500">Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Opportunities */}
            {savedOpportunities.length > 0 ? (
              <div className="space-y-4">
                {savedOpportunities.map((saved) => {
                  const opportunity = saved.opportunity;
                  const companyName = getCompanyDisplayName(opportunity.industry, isPremium);
                  const canApply = isPremium || opportunity.type !== 'FREELANCING';

                  return (
                    <Card key={saved.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 font-manrope">
                                {opportunity.title}
                              </h3>
                              {opportunity.isPremiumOnly && (
                                <Crown className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                            
                            <div className="flex items-center text-gray-600 mb-3">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{companyName}</span>
                              {opportunity.industry.isVerified && (
                                <Check className="h-4 w-4 ml-2 text-green-500" />
                              )}
                              {!opportunity.industry.showCompanyName && !isPremium && (
                                <EyeOff className="h-4 w-4 ml-2 text-gray-400" />
                              )}
                              <span className="mx-2 text-gray-400">•</span>
                              <span>{opportunity.industry.industry}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsave(opportunity.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Link href={`/candidate/apply/${opportunity.id}`}>
                              <Button size="sm" disabled={!canApply}>
                                {canApply ? 'Apply Now' : 'Premium Only'}
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {opportunity.description}
                        </p>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{opportunity.workType}</span>
                          </div>
                          {opportunity.duration && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{opportunity.duration} weeks</span>
                            </div>
                          )}
                          {opportunity.stipend && (
                            <div className="flex items-center text-green-600 font-medium">
                              <Wallet className="h-4 w-4 mr-2" />
                              <span>{opportunity.currency}{opportunity.stipend.toLocaleString()}/month</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-500">
                            <Bookmark className="h-4 w-4 mr-2" />
                            <span>Saved {getTimeSince(saved.savedAt)}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        {opportunity.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {opportunity.skills.slice(0, 5).map((skill, index) => (
                              <span 
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${
                                  skill.isRequired 
                                    ? 'bg-red-100 text-red-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {skill.skillName}
                                {skill.isRequired && ' *'}
                              </span>
                            ))}
                            {opportunity.skills.length > 5 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                                +{opportunity.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <BookmarkX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No saved opportunities yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start exploring and save opportunities that interest you to apply later.
                  </p>
                  <Link href="/candidate/browse">
                    <Button>
                      Browse Opportunities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;