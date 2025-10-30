// Internship And Project v2 Types - 28 Table Database Schema
// src/types/index.ts

// ============================================================================
// THEME TYPES
// ============================================================================
export type Theme = 'teal' | 'blue' | 'purple';

// ============================================================================
// ENUMS (Matching Prisma Schema)
// ============================================================================

export enum UserType {
  CANDIDATE = 'CANDIDATE',
  INDUSTRY = 'INDUSTRY', 
  INSTITUTE = 'INSTITUTE',
  ADMIN = 'ADMIN'
}

export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  PROJECT = 'PROJECT',
  FREELANCING = 'FREELANCING'
}

export enum WorkType {
  REMOTE = 'REMOTE',
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID'
}

export enum CompanySize {
  STARTUP = 'STARTUP',         // 1-10
  SMALL = 'SMALL',             // 11-50
  MEDIUM = 'MEDIUM',           // 51-200
  LARGE = 'LARGE',             // 201-1000
  ENTERPRISE = 'ENTERPRISE'    // 1000+
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  SELECTED = 'SELECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum NotificationType {
  APPLICATION_UPDATE = 'APPLICATION_UPDATE',
  NEW_OPPORTUNITY = 'NEW_OPPORTUNITY',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  MARKETING = 'MARKETING'
}

export enum InterviewType {
  PHONE = 'PHONE',
  VIDEO = 'VIDEO',
  IN_PERSON = 'IN_PERSON',
  TECHNICAL = 'TECHNICAL',
  HR = 'HR'
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW'
}

export enum InterviewOutcome {
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
  NEXT_ROUND = 'NEXT_ROUND'
}

export enum BlogPostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM_CANDIDATE = 'PREMIUM_CANDIDATE',
  PREMIUM_INDUSTRY = 'PREMIUM_INDUSTRY',
  INSTITUTE_BASIC = 'INSTITUTE_BASIC',
  INSTITUTE_PREMIUM = 'INSTITUTE_PREMIUM'
}

export enum InstituteType {
  UNIVERSITY = 'UNIVERSITY',
  COLLEGE = 'COLLEGE',
  TECHNICAL_INSTITUTE = 'TECHNICAL_INSTITUTE',
  COMMUNITY_COLLEGE = 'COMMUNITY_COLLEGE',
  VOCATIONAL_SCHOOL = 'VOCATIONAL_SCHOOL'
}

export enum ProgramType {
  BACHELORS = 'BACHELORS',
  MASTERS = 'MASTERS',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATE = 'CERTIFICATE',
  PHD = 'PHD'
}

export enum AuditAction {
  VIEW_PROFILE = 'VIEW_PROFILE',
  VIEW_CONTACT = 'VIEW_CONTACT',
  DOWNLOAD_RESUME = 'DOWNLOAD_RESUME',
  VIEW_OPPORTUNITY = 'VIEW_OPPORTUNITY',
  SEND_MESSAGE = 'SEND_MESSAGE',
  ACCESS_PREMIUM_FEATURE = 'ACCESS_PREMIUM_FEATURE'
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Legacy type for backward compatibility - DEPRECATED, use UserType enum
export type UserRole = 'candidate' | 'industry' | 'institute' | 'admin';

// Legacy application status - DEPRECATED, use ApplicationStatus enum
export type LegacyApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'hired';

// ============================================================================
// CORE INTERFACES
// ============================================================================

// User Types (Updated for 28-table schema)
export interface User {
  id: string;
  email: string;
  userType: UserType; // Updated from 'role' to 'userType'
  isVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Candidate Types (Updated from Student)
export interface Candidate {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  
  // Academic Information
  college?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  cgpa?: number;
  
  // Professional Information
  bio?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  
  // Location
  city?: string;
  state?: string;
  country?: string;
  
  // Privacy & Availability
  isProfilePublic: boolean;
  isAvailable: boolean;
  privacyLevel: string;
  
  // Premium Features
  isPremium: boolean;
  premiumExpiresAt?: Date;
  profileViewsUsed: number;
  contactViewsUsed: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Industry Types (Updated from Company)
export interface Industry {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  companySize: CompanySize;
  foundedYear?: number;
  
  // Contact Information
  email?: string;
  phone?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  
  // Company Details
  description?: string;
  logoUrl?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  
  // Verification & Status
  isVerified: boolean;
  isActive: boolean;
  
  // Premium Features
  isPremium: boolean;
  premiumExpiresAt?: Date;
  profileViewsUsed: number;
  contactViewsUsed: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Institute Types (New)
export interface Institute {
  id: string;
  userId: string;
  instituteName: string;
  instituteType: InstituteType;
  
  // Contact Information
  email: string;
  phone?: string;
  websiteUrl?: string;
  
  // Institute Details
  description?: string;
  logoUrl?: string;
  establishedYear?: number;
  affiliatedUniversity?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  
  // Verification & Status
  isVerified: boolean;
  isActive: boolean;
  
  // Premium Features
  isPremium: boolean;
  premiumExpiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Opportunity Types (Updated from Internship)
export interface Opportunity {
  id: string;
  industryId: string;
  title: string;
  description: string;
  opportunityType: OpportunityType;
  workType: WorkType;
  
  // Location & Duration
  city?: string;
  state?: string;
  country?: string;
  duration?: number; // in weeks
  
  // Compensation
  stipend?: number;
  currency: string;
  
  // Requirements
  requirements: string;
  minQualification?: string;
  preferredSkills?: string;
  
  // Dates
  applicationDeadline?: Date;
  startDate?: Date;
  
  // Status & Metrics
  isActive: boolean;
  isPremium: boolean;
  slug: string;
  viewCount: number;
  applicationCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  industry?: Industry;
}

// Application Types (Updated)
export interface Application {
  id: string;
  opportunityId: string; // Updated from internshipId
  candidateId: string;   // Updated from studentId
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  companyNotes?: string;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  opportunity?: Opportunity;
  candidate?: Candidate;
}

// Skill Types
export interface CandidateSkill {
  id: string;
  candidateId: string;
  skillName: string;
  proficiency: SkillLevel;
  yearsOfExperience?: number;
  certificationUrl?: string;
  isEndorsed: boolean;
}

// Subscription Types (New)
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// Privacy Audit Types (New)
export interface PrivacyAudit {
  id: string;
  subjectUserId: string;
  viewerUserId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  auditedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  sentAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

// Interview Types
export interface Interview {
  id: string;
  applicationId: string;
  industryId: string;
  candidateId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  location?: string;
  type: InterviewType;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  outcome?: InterviewOutcome;
  createdAt: Date;
  updatedAt: Date;
}

// Certificate Types
export interface Certificate {
  id: string;
  candidateId: string;
  name: string;
  issuer: string;
  issueDate?: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  createdAt: Date;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: BlogPostStatus;
  publishedAt?: Date;
  authorName: string;
  authorEmail: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  response?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Preferences
export interface UserPreference {
  id: string;
  userId: string;
  theme: Theme;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: string;
  showContactInfo: boolean;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchFilters {
  query?: string;
  opportunityType?: OpportunityType[];
  workType?: WorkType[];
  location?: string[];
  stipendMin?: number;
  stipendMax?: number;
  skillLevel?: SkillLevel[];
  experienceLevel?: string[];
  sortBy?: 'relevance' | 'date' | 'stipend' | 'location';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface OpportunityFormData {
  title: string;
  description: string;
  opportunityType: OpportunityType;
  workType: WorkType;
  city?: string;
  state?: string;
  country?: string;
  duration?: number;
  stipend?: number;
  currency: string;
  requirements: string;
  minQualification?: string;
  preferredSkills?: string;
  applicationDeadline?: Date;
  startDate?: Date;
  isPremium: boolean;
}

export interface ApplicationFormData {
  coverLetter?: string;
  resumeUrl?: string;
}

// ============================================================================
// EXPORT LEGACY ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

// Legacy type aliases - DEPRECATED
export type Student = Candidate;
export type Company = Industry;
export type Internship = Opportunity;