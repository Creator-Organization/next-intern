import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import {
  Briefcase,
  MapPin,
  Clock,
  Wallet,
  Building,
  Calendar,
  Users,
  CheckCircle,
  Crown,
  EyeOff,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { SaveOpportunityButton } from './save-button';

// Get opportunity details with privacy controls
async function getOpportunityDetails(opportunityId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidate: {
        select: { id: true },
      },
    },
  });

  if (!user?.candidate) {
    throw new Error('Candidate profile not found');
  }

  const isPremium = user.isPremium;

  // Get opportunity with all relations
  const opportunity = await db.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      industry: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          description: true,
          logoUrl: true,
          isVerified: true,
          showCompanyName: true,
          anonymousId: true,
          city: true,
          state: true,
          country: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
      location: {
        select: {
          id: true,
          city: true,
          state: true,
          country: true,
        },
      },
      skills: {
        select: {
          id: true,
          skillName: true,
          isRequired: true,
          minLevel: true,
        },
      },
    },
  });

  if (!opportunity) {
    notFound();
  }

  // Check if user has already applied
  const existingApplication = await db.application.findFirst({
    where: {
      candidateId: user.candidate.id,
      opportunityId: opportunityId,
    },
    select: {
      id: true,
      status: true,
      appliedAt: true,
    },
  });

  // Check if user has saved this opportunity
  const isSaved = await db.savedOpportunity.findFirst({
    where: {
      candidateId: user.candidate.id,
      opportunityId: opportunityId,
    },
  });

  // Get similar opportunities (same category, different company)
  const similarOpportunities = await db.opportunity.findMany({
    where: {
      categoryId: opportunity.categoryId,
      id: { not: opportunityId },
      isActive: true,
      ...(user.userType === 'INSTITUTE' && {
        type: { not: 'FREELANCING' },
      }),
      ...(!isPremium && {
        isPremiumOnly: false,
      }),
    },
    include: {
      industry: {
        select: {
          companyName: true,
          isVerified: true,
          showCompanyName: true,
          anonymousId: true,
        },
      },
      location: {
        select: {
          city: true,
          state: true,
        },
      },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  // Apply privacy controls
  const processedOpportunity = {
    ...opportunity,
    industry: {
      ...opportunity.industry,
      displayName:
        opportunity.industry.showCompanyName || isPremium
          ? opportunity.industry.companyName
          : `Company #${opportunity.industry.anonymousId.slice(-3)}`,
      showDetails: opportunity.industry.showCompanyName || isPremium,
    },
  };

  const processedSimilar = similarOpportunities.map((opp) => ({
    ...opp,
    industry: {
      ...opp.industry,
      displayName:
        opp.industry.showCompanyName || isPremium
          ? opp.industry.companyName
          : `Company #${opp.industry.anonymousId.slice(-3)}`,
    },
  }));

  return {
    opportunity: processedOpportunity,
    similarOpportunities: processedSimilar,
    existingApplication,
    isSaved: !!isSaved,
    isPremium,
    candidateId: user.candidate.id,
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || session.user.userType !== 'CANDIDATE') {
    redirect('/auth/signin');
  }

  const resolvedParams = await params;
  const {
    opportunity,
    similarOpportunities,
    existingApplication,
    isSaved,
    isPremium,
    candidateId,
  } = await getOpportunityDetails(resolvedParams.id, session.user.id);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canApply = isPremium || opportunity.type !== 'FREELANCING';
  const hasApplied = !!existingApplication;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        user={{
          id: session.user.id,
          email: session.user.email,
          userType: session.user.userType,
          candidate: session.user.candidate
            ? {
                firstName: session.user.candidate.firstName,
                lastName: session.user.candidate.lastName,
              }
            : undefined,
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/candidate/browse">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header Card */}
            <Card>
              <CardContent className="p-8">
                {/* Title & Type Badge */}
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h1 className="font-manrope text-3xl font-bold text-gray-900">
                        {opportunity.title}
                      </h1>
                      {opportunity.isPremiumOnly && (
                        <Crown className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        opportunity.type === 'INTERNSHIP'
                          ? 'bg-blue-100 text-blue-700'
                          : opportunity.type === 'PROJECT'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {opportunity.type}
                    </span>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mb-6 flex items-center gap-4 border-b pb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building className="h-5 w-5" />
                    <span className="text-lg font-medium">
                      {opportunity.industry.displayName}
                    </span>
                    {opportunity.industry.isVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {!opportunity.industry.showDetails && (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {opportunity.industry.industry}
                  </span>
                </div>

                {/* Key Stats Grid */}
                <div className="mb-6 grid grid-cols-2 gap-6 border-b pb-6 md:grid-cols-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">Work Type</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {opportunity.workType}
                    </p>
                  </div>

                  {opportunity.duration && (
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {opportunity.duration} months
                      </p>
                    </div>
                  )}

                  {opportunity.stipend && (
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-gray-500">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm">Stipend</span>
                      </div>
                      <p className="font-semibold text-green-600">
                        {opportunity.currency}
                        {opportunity.stipend.toLocaleString()}/mo
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center gap-2 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Applications</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {opportunity.applicationCount}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {opportunity.location.city}, {opportunity.location.state},{' '}
                    {opportunity.location.country}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            {!isPremium &&
              (opportunity.type === 'FREELANCING' ||
                !opportunity.industry.showDetails) && (
                <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Crown className="mt-0.5 h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="mb-1 font-semibold text-yellow-900">
                          Premium Feature
                        </h3>
                        <p className="text-sm text-yellow-700">
                          {opportunity.type === 'FREELANCING'
                            ? 'This freelancing opportunity requires a premium subscription to apply.'
                            : 'Upgrade to Premium to see full company details and contact information.'}
                        </p>
                        <Link href="/candidate/premium">
                          <Button
                            size="sm"
                            className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                          >
                            Upgrade to Premium
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>
                  About this {opportunity.type.toLowerCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {opportunity.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed whitespace-pre-line text-gray-700">
                  {opportunity.requirements}
                </p>
                {opportunity.minQualification && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-gray-900">
                      Minimum Qualification
                    </p>
                    <p className="text-sm text-gray-700">
                      {opportunity.minQualification}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Required */}
            {opportunity.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${
                          skill.isRequired
                            ? 'border border-red-200 bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill.skillName}
                        {skill.isRequired && ' *'}
                        {skill.minLevel && ` (${skill.minLevel})`}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    * Required skills
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Important Dates */}
            {(opportunity.applicationDeadline || opportunity.startDate) && (
              <Card>
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {opportunity.applicationDeadline && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Application Deadline
                          </span>
                        </div>
                        <p className="text-gray-900">
                          {formatDate(opportunity.applicationDeadline)}
                        </p>
                      </div>
                    )}
                    {opportunity.startDate && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Expected Start Date
                          </span>
                        </div>
                        <p className="text-gray-900">
                          {formatDate(opportunity.startDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Details - Premium Only */}
            {opportunity.industry.showDetails &&
              opportunity.industry.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      About {opportunity.industry.displayName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed whitespace-pre-line text-gray-700">
                      {opportunity.industry.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {opportunity.industry.city},{' '}
                        {opportunity.industry.state},{' '}
                        {opportunity.industry.country}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Similar Opportunities */}
            {similarOpportunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarOpportunities.map((similar) => (
                      <Link
                        key={similar.id}
                        href={`/candidate/opportunities/${similar.id}`}
                        className="hover:border-primary-300 hover:bg-primary-50 block rounded-lg border border-gray-200 p-4 transition-all"
                      >
                        <h4 className="mb-2 font-semibold text-gray-900">
                          {similar.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{similar.industry.displayName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{similar.location.city}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Apply Card */}
              <Card>
                <CardContent className="p-6">
                  {hasApplied ? (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Application Submitted
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Applied on {formatDate(existingApplication.appliedAt)}
                      </p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                          existingApplication.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : existingApplication.status === 'REVIEWED'
                              ? 'bg-blue-100 text-blue-800'
                              : existingApplication.status === 'SHORTLISTED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {existingApplication.status}
                      </span>
                      <Link href="/candidate/applications">
                        <Button variant="secondary" className="mt-4 w-full">
                          View Application
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Briefcase className="text-primary-600 mx-auto mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Apply for this {opportunity.type.toLowerCase()}
                      </h3>
                      <p className="mb-6 text-sm text-gray-600">
                        Submit your application to be considered for this role.
                      </p>

                      {canApply ? (
                        <Link href={`/candidate/apply/${opportunity.id}`}>
                          <Button className="w-full" size="lg">
                            Apply Now
                          </Button>
                        </Link>
                      ) : (
                        <div className="space-y-3">
                          <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                            Premium subscription required to apply for
                            freelancing opportunities.
                          </p>
                          <Link href="/candidate/premium">
                            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                              <Crown className="mr-2 h-4 w-4" />
                              Upgrade to Premium
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Save Button */}
                      <SaveOpportunityButton
                        opportunityId={opportunity.id}
                        candidateId={candidateId}
                        initialSaved={isSaved}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900">
                      {opportunity.category.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Posted</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(opportunity.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium text-gray-900">
                      {opportunity.viewCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium text-gray-900">
                      {opportunity.applicationCount}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardContent className="p-4">
                  <Button variant="ghost" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Opportunity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
