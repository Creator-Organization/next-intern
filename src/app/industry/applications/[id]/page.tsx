/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/ui/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Award,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Save,
  MessageSquare,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  userId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  college: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  cgpa: number | null;
  isAnonymous: boolean;
}

interface Skill {
  skillName: string;
  proficiency: string;
  yearsOfExperience: number | null;
}

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  expectedSalary: number | null;
  canJoinFrom: Date | null;
  appliedAt: Date;
  reviewedAt: Date | null;
  companyNotes: string | null;
  candidate: Candidate;
  opportunity: {
    id: string;
    title: string;
    type: string;
  };
}

interface ApplicationData {
  application: Application;
  skills: Skill[];
  isPremium: boolean;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.userType !== 'INDUSTRY') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchApplication = async () => {
      if (status !== 'authenticated' || !params.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/applications/${params.id}`);

        if (response.ok) {
          const result = await response.json();
          setData(result);
          setNotes(result.application.companyNotes || '');
          // Set default subject
          setMessageSubject(
            `Regarding: ${result.application.opportunity.title}`
          );
        } else {
          toast.error('Failed to load application');
          router.push('/industry/applications');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error loading application');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [status, params.id, router]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!data) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/applications/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(
          `Application ${newStatus.toLowerCase().replace('_', ' ')}!`
        );
        setData({
          ...data,
          application: { ...data.application, status: newStatus },
        });
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/applications/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Application rejected');
        setShowRejectModal(false);
        setData(
          data
            ? {
                ...data,
                application: { ...data.application, status: 'REJECTED' },
              }
            : null
        );
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const response = await fetch(`/api/applications/${params.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      if (response.ok) {
        toast.success('Notes saved!');
        if (data) {
          setData({
            ...data,
            application: { ...data.application, companyNotes: notes.trim() },
          });
        }
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!data || !application.candidate.userId) {
      toast.error('Unable to send message - candidate information missing');
      return;
    }

    const candidateUserId = application.candidate.userId;

    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/messages/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: params.id,
          content: messageContent.trim(),
          subject: messageSubject.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Message sent, redirecting to:', candidateUserId); // Debug log

        toast.success('Message sent successfully!');
        setShowMessageModal(false);
        setMessageContent('');

        // Wait a moment for state to update
        setTimeout(() => {
          router.push(`/industry/messages?conversation=${candidateUserId}`);
        }, 500);
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'SHORTLISTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-100 text-purple-800';
      case 'SELECTED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canSendMessage =
    data?.application.status === 'SHORTLISTED' ||
    data?.application.status === 'INTERVIEW_SCHEDULED';

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-600">Application not found</p>
      </div>
    );
  }

  const { application, skills, isPremium } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user as any} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Link href="/industry/applications">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-manrope text-2xl font-bold text-gray-900">
                Application Details
              </h1>
              <p className="text-gray-600">{application.opportunity.title}</p>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(application.status)}`}
            >
              {application.status.replace('_', ' ')}
            </span>
          </div>

          {/* Premium Upgrade Notice */}
          {!isPremium && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">
                      🔒 Upgrade to See Full Details
                    </h3>
                    <p className="text-sm text-purple-700">
                      Get candidate contact info, resume, and portfolio with
                      Premium
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

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Candidate Info */}
              <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Candidate Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.candidate.displayName}
                    </h3>
                    {application.candidate.isAnonymous && (
                      <p className="mt-1 text-sm text-gray-600">
                        🔒 Full details available with Premium membership
                      </p>
                    )}
                  </div>

                  {/* Contact Info - Premium Only */}
                  {isPremium && application.candidate.email && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-4 w-4" />
                        <span>{application.candidate.email}</span>
                      </div>
                      {application.candidate.city && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {application.candidate.city},{' '}
                            {application.candidate.state},{' '}
                            {application.candidate.country}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {application.candidate.bio && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">About</h4>
                      <p className="text-gray-700">
                        {application.candidate.bio}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium text-gray-900">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span
                            key={skill.skillName}
                            className="rounded-full bg-teal-100 px-3 py-1 text-sm text-teal-800"
                          >
                            {skill.skillName} - {skill.proficiency}
                            {skill.yearsOfExperience &&
                              ` (${skill.yearsOfExperience}y)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links - Premium Only */}
                  {isPremium && (
                    <div className="flex flex-wrap gap-3 border-t pt-4">
                      {application.candidate.resumeUrl && (
                        <Link
                          href={application.candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="secondary" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </Button>
                        </Link>
                      )}
                      {application.candidate.portfolioUrl && (
                        <Link
                          href={application.candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="secondary" size="sm">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Portfolio
                          </Button>
                        </Link>
                      )}
                      {application.candidate.linkedinUrl && (
                        <Link
                          href={application.candidate.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="secondary" size="sm">
                            LinkedIn
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {application.coverLetter && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700">
                      {application.coverLetter}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {application.candidate.college && (
                <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-700">
                      <strong>College:</strong> {application.candidate.college}
                    </p>
                    {application.candidate.degree && (
                      <p className="text-gray-700">
                        <strong>Degree:</strong> {application.candidate.degree}
                      </p>
                    )}
                    {application.candidate.fieldOfStudy && (
                      <p className="text-gray-700">
                        <strong>Field:</strong>{' '}
                        {application.candidate.fieldOfStudy}
                      </p>
                    )}
                    {application.candidate.graduationYear && (
                      <p className="text-gray-700">
                        <strong>Graduation:</strong>{' '}
                        {application.candidate.graduationYear}
                      </p>
                    )}
                    {isPremium && application.candidate.cgpa && (
                      <p className="text-gray-700">
                        <strong>CGPA:</strong> {application.candidate.cgpa}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Info */}
              <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Application Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Applied On</p>
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      <Calendar className="h-4 w-4" />
                      {formatDate(application.appliedAt)}
                    </p>
                  </div>

                  {application.expectedSalary && (
                    <div>
                      <p className="text-sm text-gray-600">Expected Salary</p>
                      <p className="flex items-center gap-2 font-medium text-gray-900">
                        <DollarSign className="h-4 w-4" />₹
                        {application.expectedSalary.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {application.canJoinFrom && (
                    <div>
                      <p className="text-sm text-gray-600">Can Join From</p>
                      <p className="flex items-center gap-2 font-medium text-gray-900">
                        <Clock className="h-4 w-4" />
                        {formatDate(application.canJoinFrom)}
                      </p>
                    </div>
                  )}

                  {application.reviewedAt && (
                    <div>
                      <p className="text-sm text-gray-600">Reviewed On</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(application.reviewedAt)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application.status === 'PENDING' && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate('SHORTLISTED')}
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Shortlist Candidate
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleStatusUpdate('REVIEWED')}
                        disabled={isUpdatingStatus}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowRejectModal(true)}
                        disabled={isUpdatingStatus}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  {application.status === 'REVIEWED' && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate('SHORTLISTED')}
                        disabled={isUpdatingStatus}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Shortlist Candidate
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowRejectModal(true)}
                        disabled={isUpdatingStatus}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  {application.status === 'SHORTLISTED' && (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleStatusUpdate('INTERVIEW_SCHEDULED')}
                      disabled={isUpdatingStatus}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                  )}

                  {/* Send Message Button - Only for Shortlisted/Interview Scheduled */}
                  {canSendMessage ? (
                    <Button
                      variant="secondary"
                      className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                      onClick={() => setShowMessageModal(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  ) : (
                    <div className="py-2 text-center text-xs text-gray-500">
                      💡 Shortlist candidate to send messages
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-teal-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    rows={4}
                    placeholder="Add private notes about this candidate (not visible to candidate)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Notes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Please provide a reason for rejection (required):
              </p>
              <textarea
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="e.g., Skills don't match requirements, overqualified, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={isUpdatingStatus || !rejectionReason.trim()}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Message to {application.candidate.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Platform Communication Only:</strong> All messages
                  must be sent through this platform. Do not share contact
                  information or ask candidates to communicate off-platform.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  rows={8}
                  placeholder="Write your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {messageContent.length} characters
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent('');
                  }}
                  disabled={isSendingMessage}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageContent.trim()}
                >
                  {isSendingMessage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
