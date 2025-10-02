import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Star,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Award,
} from 'lucide-react';
import Link from 'next/link';

// Get shortlisted applications
async function getShortlistedCandidates(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { industry: true },
  });

  if (!user?.industry?.id) {
    throw new Error('Industry not found');
  }

  const isPremium = user.isPremium;

  // Get all shortlisted applications
  const applications = await db.application.findMany({
    where: {
      industryId: user.industry.id,
      status: 'SHORTLISTED',
    },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          city: true,
          state: true,
          country: true,
          bio: true,
          college: true,
          degree: true,
          graduationYear: true,
          cgpa: true,
          resumeUrl: true,
          linkedinUrl: true,
          anonymousId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
    orderBy: {
      reviewedAt: 'desc',
    },
  });

  // Get skills for all candidates
  const candidateIds = applications.map((app) => app.candidateId);
  const allSkills = await db.candidateSkill.findMany({
    where: {
      candidateId: { in: candidateIds },
    },
    select: {
      candidateId: true,
      skillName: true,
      proficiency: true,
    },
  });

  // Group skills by candidate
  const skillsByCandidate = allSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.candidateId]) {
        acc[skill.candidateId] = [];
      }
      acc[skill.candidateId].push(skill);
      return acc;
    },
    {} as Record<string, typeof allSkills>
  );

  // Apply privacy controls
  const processedApplications = applications.map((app) => ({
    ...app,
    candidate: isPremium
      ? {
          id: app.candidate.id,
          displayName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          email: app.candidate.user.email,
          phone: app.candidate.phone,
          city: app.candidate.city,
          state: app.candidate.state,
          country: app.candidate.country,
          bio: app.candidate.bio,
          college: app.candidate.college,
          degree: app.candidate.degree,
          graduationYear: app.candidate.graduationYear,
          cgpa: app.candidate.cgpa,
          resumeUrl: app.candidate.resumeUrl,
          linkedinUrl: app.candidate.linkedinUrl,
          isAnonymous: false,
        }
      : {
          id: app.candidate.id,
          displayName: `Candidate ${app.candidate.anonymousId}`,
          email: null,
          phone: null,
          city: null,
          state: null,
          country: null,
          bio: app.candidate.bio,
          college: app.candidate.college,
          degree: app.candidate.degree,
          graduationYear: app.candidate.graduationYear,
          cgpa: null,
          resumeUrl: null,
          linkedinUrl: null,
          isAnonymous: true,
        },
    skills: skillsByCandidate[app.candidateId] || [],
  }));

  return {
    applications: processedApplications,
    isPremium,
  };
}

export default async function ShortlistedPage() {
  const session = await auth();

  if (!session || session.user.userType !== 'INDUSTRY') {
    redirect('/auth/signin');
  }

  const { applications, isPremium } = await getShortlistedCandidates(
    session.user.id
  );

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-bold text-gray-900">
            Shortlisted Candidates
          </h1>
          <p className="text-gray-600">
            {applications.length}{' '}
            {applications.length === 1 ? 'candidate' : 'candidates'} shortlisted
          </p>
        </div>
      </div>

      {/* Premium Upgrade Notice */}
      {!isPremium && applications.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">
                  Unlock Full Candidate Details
                </h3>
                <p className="text-sm text-purple-700">
                  Upgrade to Premium to view contact information and download
                  resumes
                </p>
              </div>
              <Link href="/industry/billing">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                <Star className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No Shortlisted Candidates Yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Start reviewing applications and shortlist promising
                  candidates
                </p>
                <Link href="/industry/applications">
                  <Button>View Applications</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Candidates Grid */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="border-teal-100 bg-white/70 backdrop-blur-sm transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                      <User className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {application.candidate.displayName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Applied for: {application.opportunity.title}
                      </p>
                    </div>
                  </div>
                  {application.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">
                        {application.rating}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Education */}
                {application.candidate.college && (
                  <div className="flex items-start gap-2">
                    <Award className="mt-1 h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {application.candidate.college}
                      </p>
                      {application.candidate.degree && (
                        <p className="text-gray-600">
                          {application.candidate.degree}
                          {application.candidate.graduationYear &&
                            ` • ${application.candidate.graduationYear}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Location - Premium Only */}
                {isPremium && application.candidate.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      {application.candidate.city},{' '}
                      {application.candidate.state}
                    </span>
                  </div>
                )}

                {/* Contact - Premium Only */}
                {isPremium && (
                  <div className="space-y-2">
                    {application.candidate.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${application.candidate.email}`}
                          className="hover:text-teal-600"
                        >
                          {application.candidate.email}
                        </a>
                      </div>
                    )}
                    {application.candidate.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                          href={`tel:${application.candidate.phone}`}
                          className="hover:text-teal-600"
                        >
                          {application.candidate.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills */}
                {application.skills.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      Top Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill.skillName}
                          className="rounded-full bg-teal-100 px-2 py-1 text-xs text-teal-800"
                        >
                          {skill.skillName}
                        </span>
                      ))}
                      {application.skills.length > 4 && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          +{application.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio Preview */}
                {application.candidate.bio && (
                  <p className="line-clamp-2 text-sm text-gray-700">
                    {application.candidate.bio}
                  </p>
                )}

                {/* Shortlisted Date */}
                <div className="flex items-center gap-2 border-t pt-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Shortlisted on {formatDate(application.reviewedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/industry/applications/${application.id}`}
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                </div>

                {/* Links - Premium Only */}
                {isPremium && (
                  <div className="flex gap-2">
                    {application.candidate.resumeUrl && (
                      <Link
                        href={application.candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          Resume
                        </Button>
                      </Link>
                    )}
                    {application.candidate.linkedinUrl && (
                      <Link
                        href={application.candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          LinkedIn
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
