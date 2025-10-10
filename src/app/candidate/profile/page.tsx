// src/app/candidate/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  FileText,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: Date | null;
  college: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  cgpa: number | null;
  bio: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  emailVerified: boolean;
  createdAt: Date;
  skills: Array<{
    id: string;
    skillName: string;
    proficiency: string;
    yearsOfExperience: number | null;
  }>;
}

const CandidateProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [skillsInput, setSkillsInput] = useState('');
  const hasFetchedData = useRef(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    bio: '',
    city: '',
    state: '',
    country: '',
    college: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: '',
    cgpa: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (session?.user?.userType !== 'CANDIDATE') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (
        status !== 'authenticated' ||
        !session?.user?.candidate?.id ||
        hasFetchedData.current
      )
        return;
      hasFetchedData.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/candidates/${session.user.candidate.id}/profile`
        );
        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
          calculateCompletion(data.data);
        }
      } catch (error) {
        console.error('Error:', error);
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [status, session?.user?.candidate?.id]);

  const calculateCompletion = (prof: CandidateProfile) => {
    let score = 0;
    const total = 17;
    if (prof.firstName) score++;
    if (prof.lastName) score++;
    if (prof.phone) score++;
    if (prof.dateOfBirth) score++;
    if (prof.bio) score++;
    if (prof.city) score++;
    if (prof.state) score++;
    if (prof.country) score++;
    if (prof.college) score++;
    if (prof.degree) score++;
    if (prof.fieldOfStudy) score++;
    if (prof.graduationYear) score++;
    if (prof.cgpa) score++;
    if (prof.portfolioUrl) score++;
    if (prof.linkedinUrl) score++;
    if (prof.githubUrl) score++;
    if (prof.skills.length >= 3) score++;
    setCompletionPercentage(Math.round((score / total) * 100));
  };

  const handleEdit = () => {
    if (!profile) return;
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
        : '',
      bio: profile.bio || '',
      city: profile.city || '',
      state: profile.state || '',
      country: profile.country || '',
      college: profile.college || '',
      degree: profile.degree || '',
      fieldOfStudy: profile.fieldOfStudy || '',
      graduationYear: profile.graduationYear?.toString() || '',
      cgpa: profile.cgpa?.toString() || '',
      portfolioUrl: profile.portfolioUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
      githubUrl: profile.githubUrl || '',
    });
    setShowEditModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        bio: formData.bio.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        country: formData.country.trim() || null,
        college: formData.college.trim() || null,
        degree: formData.degree.trim() || null,
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        portfolioUrl: formData.portfolioUrl.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        githubUrl: formData.githubUrl.trim() || null,
      };
      const response = await fetch(
        `/api/candidates/${session?.user?.candidate?.id}/profile`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        calculateCompletion(data.data);
        toast.success('✅ Profile updated!', { duration: 4000 });
        setShowEditModal(false);
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSkills = async () => {
    if (!skillsInput.trim()) {
      toast.error('Please enter skills');
      return;
    }
    setIsSubmitting(true);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      const parsedSkills = skillsArray
        .map((skill) => {
          const parts = skill.split(':');
          const name = parts[0]?.trim();
          const level = parts[1] ? parseInt(parts[1].trim()) : 0;

          if (!name) return null;

          // Validate level (0-10)
          const validLevel = Math.min(Math.max(level, 0), 10);

          return {
            name,
            level: validLevel,
          };
        })
        .filter((s) => s !== null);

      if (parsedSkills.length === 0) {
        toast.error('Invalid skill format');
        return;
      }

      const response = await fetch(
        `/api/candidates/${session?.user?.candidate?.id}/skills`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: parsedSkills }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => (prev ? { ...prev, skills: data.data } : null));
        if (profile) calculateCompletion({ ...profile, skills: data.data });
        toast.success('🎉 Skills added successfully!', { duration: 4000 });
        setShowSkillsModal(false);
        setSkillsInput('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add skills');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSkill = async (skillId: string, skillName: string) => {
    if (!confirm(`Remove "${skillName}"?`)) return;
    try {
      const response = await fetch(
        `/api/candidates/${session?.user?.candidate?.id}/skills/${skillId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setProfile((prev) =>
          prev
            ? { ...prev, skills: prev.skills.filter((s) => s.id !== skillId) }
            : null
        );
        if (profile)
          calculateCompletion({
            ...profile,
            skills: profile.skills.filter((s) => s.id !== skillId),
          });
        toast.success('🗑️ Skill removed!');
      } else {
        toast.error('Failed to remove');
      }
    } catch {
      toast.error('Error occurred');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ADVANCED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'BEGINNER':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="text-primary-600 h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !profile) return null;

  const user = session?.user;
  const isPremium = user?.isPremium || false;
  const isComplete = completionPercentage >= 80;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header
          user={
            user
              ? {
                  id: user.id,
                  email: user.email || '',
                  userType: user.userType,
                  candidate: user.name
                    ? {
                        firstName: user.name.split(' ')[0] || '',
                        lastName: user.name.split(' ')[1] || '',
                      }
                    : undefined,
                }
              : undefined
          }
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-manrope mb-2 text-3xl font-bold text-gray-900">
                    My Profile
                  </h1>
                  <p className="text-gray-600">
                    Manage your personal and professional information
                  </p>
                </div>
                <Button onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`mb-6 border-2 ${isComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                {isComplete ? (
                  <CheckCircle className="mt-1 h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="mt-1 h-6 w-6 text-yellow-600" />
                )}
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    Profile Completion: {completionPercentage}%
                  </h3>
                  <p className="mb-3 text-sm text-gray-700">
                    {isComplete
                      ? 'Your profile is complete!'
                      : 'Complete your profile to increase visibility.'}
                  </p>
                  <div className="h-2 max-w-md overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        First Name
                      </label>
                      <p className="mt-1 text-gray-900">{profile.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Last Name
                      </label>
                      <p className="mt-1 text-gray-900">{profile.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-gray-900">{user?.email}</p>
                        {profile.emailVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone{' '}
                        {!isPremium && (
                          <Lock className="ml-1 inline h-3 w-3 text-yellow-600" />
                        )}
                      </label>
                      <p className="mt-1 text-gray-900">
                        {profile.phone || 'Not provided'}
                      </p>
                      {!isPremium && profile.phone && (
                        <p className="mt-1 text-xs text-yellow-600">
                          Premium required to change
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Date of Birth
                      </label>
                      <p className="mt-1 text-gray-900">
                        {formatDate(profile.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-600">
                        Bio
                      </label>
                      <p className="mt-1 whitespace-pre-line text-gray-700">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.city || profile.state || profile.country ? (
                    <div className="space-y-1">
                      {profile.city && (
                        <p className="text-gray-900">{profile.city}</p>
                      )}
                      {profile.state && (
                        <p className="text-gray-900">{profile.state}</p>
                      )}
                      {profile.country && (
                        <p className="text-gray-900">{profile.country}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Location not provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.college || profile.degree ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {profile.college && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            College
                          </label>
                          <p className="mt-1 text-gray-900">
                            {profile.college}
                          </p>
                        </div>
                      )}
                      {profile.degree && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Degree
                          </label>
                          <p className="mt-1 text-gray-900">{profile.degree}</p>
                        </div>
                      )}
                      {profile.fieldOfStudy && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Field
                          </label>
                          <p className="mt-1 text-gray-900">
                            {profile.fieldOfStudy}
                          </p>
                        </div>
                      )}
                      {profile.graduationYear && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Graduation
                          </label>
                          <p className="mt-1 text-gray-900">
                            {profile.graduationYear}
                          </p>
                        </div>
                      )}
                      {profile.cgpa && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            CGPA
                          </label>
                          <p className="mt-1 text-gray-900">
                            {profile.cgpa}/10.0
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Academic info not provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Skills
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowSkillsModal(true)}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add Skills
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {profile.skills.length > 0 ? (
                    <div className="space-y-3">
                      {profile.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {skill.skillName}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              Level: {skill.yearsOfExperience}/10
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-sm font-medium ${getSkillLevelColor(skill.proficiency)}`}
                            >
                              {skill.proficiency}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDeleteSkill(skill.id, skill.skillName)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-gray-500">
                      No skills added
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Professional Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.portfolioUrl && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Portfolio</p>
                        <a
                          href={profile.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 text-sm hover:underline"
                        >
                          {profile.portfolioUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {profile.linkedinUrl && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Linkedin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">LinkedIn</p>
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 text-sm hover:underline"
                        >
                          {profile.linkedinUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {profile.githubUrl && (
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <Github className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">GitHub</p>
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 text-sm hover:underline"
                        >
                          {profile.githubUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {!profile.portfolioUrl &&
                    !profile.linkedinUrl &&
                    !profile.githubUrl && (
                      <p className="py-8 text-center text-gray-500">
                        No links added
                      </p>
                    )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">
                      {isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    {profile.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/candidate/certificates">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Certificates
                    </Button>
                  </Link>
                  <Link href="/candidate/settings">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {!isPremium && (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-semibold text-purple-900">
                      Upgrade to Premium
                    </h3>
                    <p className="mb-4 text-sm text-purple-700">
                      Access freelancing & full company details
                    </p>
                    <Link href="/candidate/premium">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Upgrade Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-manrope text-3xl font-bold">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Phone{' '}
                      {!isPremium && <Lock className="ml-1 inline h-3 w-3" />}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSubmitting || !isPremium}
                      className="w-full rounded-lg border-2 px-4 py-3 disabled:opacity-50"
                      placeholder={!isPremium ? 'Premium required' : ''}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">Bio</label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border-2 px-4 py-3"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold">City</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      College
                    </label>
                    <input
                      type="text"
                      id="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Degree
                    </label>
                    <input
                      type="text"
                      id="degree"
                      value={formData.degree}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      id="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      id="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                      min="1950"
                      max="2030"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">CGPA</label>
                    <input
                      type="number"
                      id="cgpa"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                      min="0"
                      max="10"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      id="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border-2 px-4 py-3"
                    />
                  </div>
                </div>
                <div className="flex gap-4 border-t-2 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      '✅ Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showSkillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-manrope text-2xl font-bold">
                    Add Skills
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Add skills with proficiency levels (0-10)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSkillsModal(false);
                    setSkillsInput('');
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-2 text-sm font-semibold text-blue-900">
                  📊 Proficiency Levels:
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • <strong>Beginner (0-3):</strong> Learning the basics
                  </li>
                  <li>
                    • <strong>Intermediate (4-6):</strong> Comfortable with the
                    skill
                  </li>
                  <li>
                    • <strong>Advanced (7-8):</strong> Highly proficient
                  </li>
                  <li>
                    • <strong>Expert (9-10):</strong> Master level
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Enter Skills
                  </label>
                  <textarea
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    className="focus:border-primary-500 focus:ring-primary-200 w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:ring-2"
                    placeholder="e.g., JavaScript:8, React:7, Python:5, AWS:4"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Format: <strong>SkillName:Level</strong> separated by
                    commas. Level is 0-10.
                    <br />
                    Example: JavaScript:8, Python:6, React:7
                  </p>
                </div>
                <div className="flex gap-4 border-t pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowSkillsModal(false);
                      setSkillsInput('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSkills}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      '➕ Add Skills'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CandidateProfilePage;
