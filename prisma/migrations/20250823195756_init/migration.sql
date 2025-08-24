-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."WorkType" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'ACCEPTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('APPLICATION_UPDATE', 'NEW_MESSAGE', 'INTERVIEW_SCHEDULED', 'INTERNSHIP_REMINDER', 'SYSTEM_UPDATE', 'MARKETING');

-- CreateEnum
CREATE TYPE "public"."InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'HR');

-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "public"."InterviewOutcome" AS ENUM ('SELECTED', 'REJECTED', 'ON_HOLD', 'FURTHER_ROUNDS');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "user_type" "public"."UserType" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "google_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "college" TEXT,
    "degree" TEXT,
    "field_of_study" TEXT,
    "graduation_year" INTEGER,
    "cgpa" DOUBLE PRECISION,
    "bio" TEXT,
    "resume_url" TEXT,
    "portfolio_url" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "company_size" "public"."CompanySize" NOT NULL,
    "founded_year" INTEGER,
    "email" TEXT,
    "phone" TEXT,
    "website_url" TEXT,
    "linkedin_url" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internships" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "work_type" "public"."WorkType" NOT NULL,
    "duration" INTEGER NOT NULL,
    "stipend" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "requirements" TEXT NOT NULL,
    "min_qualification" TEXT,
    "preferred_skills" TEXT,
    "application_deadline" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "cover_letter" TEXT,
    "resume_url" TEXT,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "company_notes" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internship_skills" (
    "id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "internship_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_skills" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "proficiency" "public"."SkillLevel" NOT NULL,
    "years_of_experience" INTEGER,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."saved_internships" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interviews" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "type" "public"."InterviewType" NOT NULL,
    "status" "public"."InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "rating" INTEGER,
    "outcome" "public"."InterviewOutcome",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certificates" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "credential_id" TEXT,
    "credential_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featured_image" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "author_name" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internship_views" (
    "id" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "viewer_ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "referer" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."search_queries" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "results_count" INTEGER NOT NULL,
    "user_ip" TEXT NOT NULL,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'teal',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "profileVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "show_contact_info" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "response" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "public"."users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "public"."users"("user_type");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "public"."students"("user_id");

-- CreateIndex
CREATE INDEX "students_user_id_idx" ON "public"."students"("user_id");

-- CreateIndex
CREATE INDEX "students_college_idx" ON "public"."students"("college");

-- CreateIndex
CREATE INDEX "students_city_idx" ON "public"."students"("city");

-- CreateIndex
CREATE UNIQUE INDEX "companies_user_id_key" ON "public"."companies"("user_id");

-- CreateIndex
CREATE INDEX "companies_user_id_idx" ON "public"."companies"("user_id");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "public"."companies"("industry");

-- CreateIndex
CREATE INDEX "companies_city_idx" ON "public"."companies"("city");

-- CreateIndex
CREATE INDEX "companies_is_verified_idx" ON "public"."companies"("is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "internships_slug_key" ON "public"."internships"("slug");

-- CreateIndex
CREATE INDEX "internships_company_id_idx" ON "public"."internships"("company_id");

-- CreateIndex
CREATE INDEX "internships_category_id_idx" ON "public"."internships"("category_id");

-- CreateIndex
CREATE INDEX "internships_location_id_idx" ON "public"."internships"("location_id");

-- CreateIndex
CREATE INDEX "internships_work_type_idx" ON "public"."internships"("work_type");

-- CreateIndex
CREATE INDEX "internships_is_active_idx" ON "public"."internships"("is_active");

-- CreateIndex
CREATE INDEX "internships_slug_idx" ON "public"."internships"("slug");

-- CreateIndex
CREATE INDEX "applications_student_id_idx" ON "public"."applications"("student_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "public"."applications"("status");

-- CreateIndex
CREATE INDEX "applications_applied_at_idx" ON "public"."applications"("applied_at");

-- CreateIndex
CREATE UNIQUE INDEX "applications_internship_id_student_id_key" ON "public"."applications"("internship_id", "student_id");

-- CreateIndex
CREATE INDEX "internship_skills_skill_name_idx" ON "public"."internship_skills"("skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "internship_skills_internship_id_skill_name_key" ON "public"."internship_skills"("internship_id", "skill_name");

-- CreateIndex
CREATE INDEX "student_skills_skill_name_idx" ON "public"."student_skills"("skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "student_skills_student_id_skill_name_key" ON "public"."student_skills"("student_id", "skill_name");

-- CreateIndex
CREATE INDEX "saved_internships_student_id_idx" ON "public"."saved_internships"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_internships_student_id_internship_id_key" ON "public"."saved_internships"("student_id", "internship_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "public"."messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_receiver_id_idx" ON "public"."messages"("receiver_id");

-- CreateIndex
CREATE INDEX "messages_is_read_idx" ON "public"."messages"("is_read");

-- CreateIndex
CREATE INDEX "messages_sent_at_idx" ON "public"."messages"("sent_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "public"."notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "public"."notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications"("created_at");

-- CreateIndex
CREATE INDEX "interviews_application_id_idx" ON "public"."interviews"("application_id");

-- CreateIndex
CREATE INDEX "interviews_student_id_idx" ON "public"."interviews"("student_id");

-- CreateIndex
CREATE INDEX "interviews_company_id_idx" ON "public"."interviews"("company_id");

-- CreateIndex
CREATE INDEX "interviews_scheduled_at_idx" ON "public"."interviews"("scheduled_at");

-- CreateIndex
CREATE INDEX "interviews_status_idx" ON "public"."interviews"("status");

-- CreateIndex
CREATE INDEX "certificates_student_id_idx" ON "public"."certificates"("student_id");

-- CreateIndex
CREATE INDEX "certificates_issuer_idx" ON "public"."certificates"("issuer");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "public"."blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "public"."blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "public"."blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_published_at_idx" ON "public"."blog_posts"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "public"."categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "public"."categories"("is_active");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "public"."categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "locations_slug_key" ON "public"."locations"("slug");

-- CreateIndex
CREATE INDEX "locations_slug_idx" ON "public"."locations"("slug");

-- CreateIndex
CREATE INDEX "locations_city_idx" ON "public"."locations"("city");

-- CreateIndex
CREATE INDEX "locations_is_active_idx" ON "public"."locations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "locations_city_state_country_key" ON "public"."locations"("city", "state", "country");

-- CreateIndex
CREATE INDEX "internship_views_internship_id_idx" ON "public"."internship_views"("internship_id");

-- CreateIndex
CREATE INDEX "internship_views_viewed_at_idx" ON "public"."internship_views"("viewed_at");

-- CreateIndex
CREATE INDEX "search_queries_query_idx" ON "public"."search_queries"("query");

-- CreateIndex
CREATE INDEX "search_queries_searched_at_idx" ON "public"."search_queries"("searched_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "public"."user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "public"."support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "public"."support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "public"."support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "public"."support_tickets"("category");

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internships" ADD CONSTRAINT "internships_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internships" ADD CONSTRAINT "internships_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internships" ADD CONSTRAINT "internships_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internship_skills" ADD CONSTRAINT "internship_skills_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_skills" ADD CONSTRAINT "student_skills_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_internships" ADD CONSTRAINT "saved_internships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."saved_internships" ADD CONSTRAINT "saved_internships_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certificates" ADD CONSTRAINT "certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."internship_views" ADD CONSTRAINT "internship_views_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
