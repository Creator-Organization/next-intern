// Theme Types
export type Theme = 'teal' | 'blue' | 'purple';

// User Types
export type UserRole = 'student' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  name: string;
  college?: string;
  graduationYear?: number;
  skills: string[];
  resumeUrl?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

// Company Types
export interface Company {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  description: string;
  website?: string;
  location: string;
  foundedYear?: number;
  companySize: string;
  logoUrl?: string;
  isVerified: boolean;
}

// Internship Types
export interface Internship {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  duration: string;
  stipend?: number;
  location: string;
  isRemote: boolean;
  applicationDeadline: Date;
  startDate: Date;
  isActive: boolean;
  createdAt: Date;
  company?: Company;
}

// Application Types
export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'hired';

export interface Application {
  id: string;
  internshipId: string;
  studentId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: Date;
  internship?: Internship;
  student?: Student;
}

// Common Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}