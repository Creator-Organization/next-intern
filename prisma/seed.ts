// prisma/seed.ts
// Internship And Project v2 Database Seed Script - Comprehensive Test Data
// Creates realistic data for all 28 tables with privacy and premium features

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to generate slugs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Seed data arrays
const categories = [
  { name: 'Software Development', icon: 'Code', color: '#3B82F6' },
  { name: 'Data Science', icon: 'BarChart3', color: '#10B981' },
  { name: 'Digital Marketing', icon: 'Megaphone', color: '#F59E0B' },
  { name: 'UI/UX Design', icon: 'Palette', color: '#EF4444' },
  { name: 'Business Development', icon: 'TrendingUp', color: '#8B5CF6' },
  { name: 'Content Writing', icon: 'PenTool', color: '#06B6D4' },
  { name: 'Finance & Accounting', icon: 'Calculator', color: '#84CC16' },
  { name: 'Human Resources', icon: 'Users', color: '#F97316' },
  { name: 'Operations', icon: 'Settings', color: '#6B7280' },
  { name: 'Research & Development', icon: 'Search', color: '#EC4899' }
]

const locations = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'Gurgaon', state: 'Haryana', country: 'India' },
  { city: 'Noida', state: 'Uttar Pradesh', country: 'India' }
]

const institutes = [
  {
    name: 'Indian Institute of Technology Delhi',
    type: 'UNIVERSITY',
    city: 'Delhi',
    state: 'Delhi',
    domains: ['iitd.ac.in', 'students.iitd.ac.in']
  },
  {
    name: 'Indian Institute of Science Bangalore',
    type: 'UNIVERSITY',
    city: 'Bangalore',
    state: 'Karnataka',
    domains: ['iisc.ac.in', 'students.iisc.ac.in']
  },
  {
    name: 'Delhi University',
    type: 'UNIVERSITY',
    city: 'Delhi',
    state: 'Delhi',
    domains: ['du.ac.in', 'students.du.ac.in']
  },
  {
    name: 'Mumbai University',
    type: 'UNIVERSITY',
    city: 'Mumbai',
    state: 'Maharashtra',
    domains: ['mu.ac.in', 'students.mu.ac.in']
  },
  {
    name: 'Pune Institute of Computer Technology',
    type: 'COLLEGE',
    city: 'Pune',
    state: 'Maharashtra',
    domains: ['pict.edu', 'students.pict.edu']
  },
  {
    name: 'Indian Institute of Technology Bombay',
    type: 'UNIVERSITY',
    city: 'Mumbai',
    state: 'Maharashtra',
    domains: ['iitb.ac.in', 'students.iitb.ac.in']
  },
  {
    name: 'Indian Institute of Technology Madras',
    type: 'UNIVERSITY',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domains: ['iitm.ac.in', 'students.iitm.ac.in']
  },
  {
    name: 'Indian Institute of Technology Kanpur',
    type: 'UNIVERSITY',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    domains: ['iitk.ac.in', 'students.iitk.ac.in']
  },
  {
    name: 'National Institute of Technology Trichy',
    type: 'TECHNICAL_INSTITUTE',
    city: 'Trichy',
    state: 'Tamil Nadu',
    domains: ['nitt.edu', 'students.nitt.edu']
  },
  {
    name: 'Birla Institute of Technology Pilani',
    type: 'UNIVERSITY',
    city: 'Pilani',
    state: 'Rajasthan',
    domains: ['bits-pilani.ac.in', 'students.bits-pilani.ac.in']
  },
  {
    name: 'Manipal Institute of Technology',
    type: 'UNIVERSITY',
    city: 'Manipal',
    state: 'Karnataka',
    domains: ['manipal.edu', 'students.manipal.edu']
  },
  {
    name: 'VIT University Vellore',
    type: 'UNIVERSITY',
    city: 'Vellore',
    state: 'Tamil Nadu',
    domains: ['vit.ac.in', 'students.vit.ac.in']
  },
  {
    name: 'Symbiosis Institute Pune',
    type: 'UNIVERSITY',
    city: 'Pune',
    state: 'Maharashtra',
    domains: ['siu.edu.in', 'students.siu.edu.in']
  },
  {
    name: 'Jadavpur University',
    type: 'UNIVERSITY',
    city: 'Kolkata',
    state: 'West Bengal',
    domains: ['jaduniv.edu.in', 'students.jaduniv.edu.in']
  },
  {
    name: 'Anna University',
    type: 'UNIVERSITY',
    city: 'Chennai',
    state: 'Tamil Nadu',
    domains: ['annauniv.edu', 'students.annauniv.edu']
  }
]

const industries = [
  {
    name: 'TechCorp Solutions',
    industry: 'Software Development',
    size: 'LARGE',
    city: 'Bangalore',
    state: 'Karnataka',
    isPremium: true
  },
  {
    name: 'DataMinds Analytics',
    industry: 'Data Science',
    size: 'MEDIUM',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPremium: false
  },
  {
    name: 'Creative Designs Studio',
    industry: 'UI/UX Design',
    size: 'SMALL',
    city: 'Delhi',
    state: 'Delhi',
    isPremium: true
  },
  {
    name: 'NextGen Marketing',
    industry: 'Digital Marketing',
    size: 'MEDIUM',
    city: 'Pune',
    state: 'Maharashtra',
    isPremium: false
  },
  {
    name: 'FinTech Innovations',
    industry: 'Finance & Accounting',
    size: 'STARTUP',
    city: 'Hyderabad',
    state: 'Telangana',
    isPremium: true
  },
  {
    name: 'CloudScale Technologies',
    industry: 'Software Development',
    size: 'LARGE',
    city: 'Chennai',
    state: 'Tamil Nadu',
    isPremium: true
  },
  {
    name: 'AI Dynamics',
    industry: 'Data Science',
    size: 'MEDIUM',
    city: 'Bangalore',
    state: 'Karnataka',
    isPremium: false
  },
  {
    name: 'BrandCraft Agency',
    industry: 'Digital Marketing',
    size: 'SMALL',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPremium: true
  },
  {
    name: 'InnovateUX',
    industry: 'UI/UX Design',
    size: 'STARTUP',
    city: 'Gurgaon',
    state: 'Haryana',
    isPremium: false
  },
  {
    name: 'WebFlow Studios',
    industry: 'Software Development',
    size: 'MEDIUM',
    city: 'Noida',
    state: 'Uttar Pradesh',
    isPremium: true
  },
  {
    name: 'ContentCraft Media',
    industry: 'Content Writing',
    size: 'SMALL',
    city: 'Delhi',
    state: 'Delhi',
    isPremium: false
  },
  {
    name: 'TalentHive HR',
    industry: 'Human Resources',
    size: 'MEDIUM',
    city: 'Pune',
    state: 'Maharashtra',
    isPremium: true
  },
  {
    name: 'OptiMax Solutions',
    industry: 'Operations',
    size: 'LARGE',
    city: 'Hyderabad',
    state: 'Telangana',
    isPremium: false
  },
  {
    name: 'ResearchPro Labs',
    industry: 'Research & Development',
    size: 'MEDIUM',
    city: 'Bangalore',
    state: 'Karnataka',
    isPremium: true
  },
  {
    name: 'CapitalGrow Partners',
    industry: 'Finance & Accounting',
    size: 'LARGE',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPremium: false
  }
]

const blogPosts = [
  {
    title: 'Top 10 Skills Every Intern Should Develop in 2025',
    excerpt: 'Discover the essential skills that will make you stand out as an intern in today\'s competitive job market.',
    content: 'The internship landscape is evolving rapidly. Here are the key skills you need to succeed...'
  },
  {
    title: 'How to Write a Winning Internship Application',
    excerpt: 'Learn the secrets to crafting applications that get noticed by top companies.',
    content: 'Your internship application is your first impression. Make it count with these proven strategies...'
  },
  {
    title: 'Remote vs On-site Internships: Which is Right for You?',
    excerpt: 'Explore the pros and cons of different internship formats to make the best choice for your career.',
    content: 'The future of work is hybrid. Here\'s how to choose the right internship format for your goals...'
  }
]

async function main() {
  console.log('🌱 Starting Internship And Project v2 comprehensive database seed...')

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Clearing existing data...')
  
  await prisma.privacyAuditLog.deleteMany()
  await prisma.termsAcceptance.deleteMany()
  await prisma.termsVersion.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.savedOpportunity.deleteMany()
  await prisma.application.deleteMany()
  await prisma.opportunityView.deleteMany()
  await prisma.opportunitySkill.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.candidateSkill.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.instituteStudent.deleteMany()
  await prisma.instituteAnalytics.deleteMany()
  await prisma.instituteProgram.deleteMany()
  await prisma.instituteDomain.deleteMany()
  await prisma.userSubscription.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.industry.deleteMany()
  await prisma.institute.deleteMany()
  await prisma.user.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.searchQuery.deleteMany()
  await prisma.location.deleteMany()
  await prisma.category.deleteMany()

  // 1. Create Categories
  console.log('📁 Creating categories...')
  const createdCategories = await Promise.all(
    categories.map((category, index) =>
      prisma.category.create({
        data: {
          name: category.name,
          slug: generateSlug(category.name),
          description: `Opportunities related to ${category.name}`,
          icon: category.icon,
          color: category.color,
          sortOrder: index,
          opportunityCount: 0
        }
      })
    )
  )

  // 2. Create Locations
  console.log('📍 Creating locations...')
  const createdLocations = await Promise.all(
    locations.map(location =>
      prisma.location.create({
        data: {
          city: location.city,
          state: location.state,
          country: location.country,
          slug: generateSlug(`${location.city}-${location.state}`),
          timezone: 'Asia/Kolkata',
          opportunityCount: 0,
          candidateCount: 0,
          industryCount: 0
        }
      })
    )
  )

  // 3. Create Terms Versions
  console.log('⚖️ Creating terms versions...')
  const termsVersions = await Promise.all([
    prisma.termsVersion.create({
      data: {
        userType: 'CANDIDATE',
        version: '1.0',
        title: 'Candidate Terms and Conditions',
        content: 'These terms govern the use of Internship And Project platform by candidates...',
        isActive: true,
        isCurrent: true,
        effectiveFrom: new Date('2025-01-01'),
        createdBy: 'system',
        changeLog: 'Initial version for candidates'
      }
    }),
    prisma.termsVersion.create({
      data: {
        userType: 'INDUSTRY',
        version: '1.0',
        title: 'Industry Terms and Conditions',
        content: 'These terms govern the use of Internship And Project platform by industries...',
        isActive: true,
        isCurrent: true,
        effectiveFrom: new Date('2025-01-01'),
        createdBy: 'system',
        changeLog: 'Initial version for industries'
      }
    }),
    prisma.termsVersion.create({
      data: {
        userType: 'INSTITUTE',
        version: '1.0',
        title: 'Institute Terms and Conditions',
        content: 'These terms govern the use of Internship And Project platform by institutes...',
        isActive: true,
        isCurrent: true,
        effectiveFrom: new Date('2025-01-01'),
        createdBy: 'system',
        changeLog: 'Initial version for institutes'
      }
    })
  ])

  // 4. Create Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@Internship And Project.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      userType: 'ADMIN',
      isVerified: true,
      isActive: true,
      isPremium: true,
      currentTermsAccepted: true,
      termsAcceptedAt: new Date(),
      verifiedAt: new Date()
    }
  })

  // 5. Create Institute Users and Profiles
  console.log('🏫 Creating institutes...')
  const createdInstitutes = []
  
  for (const instituteData of institutes) {
    const user = await prisma.user.create({
      data: {
        email: `admin@${instituteData.domains[0]}`,
        passwordHash: await bcrypt.hash('institute123', 10),
        userType: 'INSTITUTE',
        isVerified: true,
        isActive: true,
        isPremium: false,
        currentTermsAccepted: true,
        termsAcceptedAt: new Date(),
        verifiedAt: new Date()
      }
    })

    const institute = await prisma.institute.create({
      data: {
        userId: user.id,
        instituteName: instituteData.name,
        instituteType: instituteData.type as 'UNIVERSITY' | 'COLLEGE' | 'TECHNICAL_INSTITUTE' | 'COMMUNITY_COLLEGE' | 'VOCATIONAL_SCHOOL',
        email: user.email,
        description: `${instituteData.name} is a premier educational institution.`,
        address: `${instituteData.name} Campus`,
        city: instituteData.city,
        state: instituteData.state,
        country: 'India',
        ugcApproved: true,
        aicteApproved: true,
        isVerified: true,
        verifiedAt: new Date(),
        totalStudents: Math.floor(Math.random() * 5000) + 1000,
        activeStudents: Math.floor(Math.random() * 3000) + 500
      }
    })

    // Create domains for institute
    for (const domain of instituteData.domains) {
      await prisma.instituteDomain.create({
        data: {
          instituteId: institute.id,
          domain: domain,
          isVerified: true,
          verifiedAt: new Date()
        }
      })
    }

    // Create programs
    const programs = [
      { name: 'Computer Science Engineering', type: 'BACHELORS', department: 'Engineering' },
      { name: 'Information Technology', type: 'BACHELORS', department: 'Engineering' },
      { name: 'Business Administration', type: 'MASTERS', department: 'Management' }
    ]

    for (const program of programs) {
      await prisma.instituteProgram.create({
        data: {
          instituteId: institute.id,
          programName: program.name,
          programType: program.type as any,
          department: program.department,
          internshipRequired: true,
          minimumDuration: 2,
          creditHours: 4,
          semester: 6,
          totalSeats: 60,
          currentStudents: Math.floor(Math.random() * 50) + 20
        }
      })
    }

    createdInstitutes.push(institute)
  }

  // 6. Create Industry Users and Profiles
  console.log('🏢 Creating industries...')
  const createdIndustries = []
  
  for (const industryData of industries) {
    const user = await prisma.user.create({
      data: {
        email: `hr@${generateSlug(industryData.name)}.com`,
        passwordHash: await bcrypt.hash('industry123', 10),
        userType: 'INDUSTRY',
        isVerified: true,
        isActive: true,
        isPremium: industryData.isPremium,
        premiumExpiresAt: industryData.isPremium ? new Date('2025-12-31') : null,
        currentTermsAccepted: true,
        termsAcceptedAt: new Date(),
        verifiedAt: new Date()
      }
    })

    const industry = await prisma.industry.create({
      data: {
        userId: user.id,
        companyName: industryData.name,
        industry: industryData.industry,
        companySize: industryData.size as 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE',
        foundedYear: 2015 + Math.floor(Math.random() * 8),
        email: user.email,
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        websiteUrl: `https://${generateSlug(industryData.name)}.com`,
        description: `${industryData.name} is a leading company in ${industryData.industry}.`,
        city: industryData.city,
        state: industryData.state,
        country: 'India',
        isVerified: true,
        verifiedAt: new Date(),
        monthlyPostLimit: industryData.isPremium ? 999 : 3,
        currentMonthPosts: 0,
        canViewCandidateContacts: industryData.isPremium,
        showCompanyName: industryData.isPremium
      }
    })

    // Create subscription for premium industries
    if (industryData.isPremium) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM_INDUSTRY',
          status: 'ACTIVE',
          priceAmount: 4999, // ₹49.99
          currency: 'INR',
          billingCycle: 'MONTHLY',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          nextBillingDate: new Date('2025-10-01')
        }
      })
    }

    createdIndustries.push(industry)
  }

  // 7. Create Candidate Users and Profiles
  console.log('👨‍🎓 Creating candidates...')
  // Extended candidate names for larger dataset
const candidateNames = [
    { first: 'Rahul', last: 'Sharma' }, { first: 'Priya', last: 'Singh' }, { first: 'Amit', last: 'Patel' },
    { first: 'Sneha', last: 'Gupta' }, { first: 'Arjun', last: 'Kumar' }, { first: 'Kavya', last: 'Reddy' },
    { first: 'Vikram', last: 'Joshi' }, { first: 'Ananya', last: 'Nair' }, { first: 'Rohit', last: 'Verma' },
    { first: 'Sakshi', last: 'Agarwal' }, { first: 'Aditya', last: 'Shah' }, { first: 'Ishita', last: 'Bansal' },
    { first: 'Karan', last: 'Malhotra' }, { first: 'Divya', last: 'Srinivasan' }, { first: 'Harsh', last: 'Goel' },
    { first: 'Nisha', last: 'Chopra' }, { first: 'Siddharth', last: 'Rao' }, { first: 'Pooja', last: 'Mehta' },
    { first: 'Varun', last: 'Kapoor' }, { first: 'Riya', last: 'Jain' }, { first: 'Akash', last: 'Tiwari' },
    { first: 'Shreya', last: 'Pandey' }, { first: 'Nikhil', last: 'Saxena' }, { first: 'Tanvi', last: 'Khanna' },
    { first: 'Dev', last: 'Mittal' }, { first: 'Anjali', last: 'Sinha' }, { first: 'Yash', last: 'Gupta' },
    { first: 'Kritika', last: 'Sharma' }, { first: 'Aryan', last: 'Agrawal' }, { first: 'Muskan', last: 'Jindal' },
    { first: 'Shubham', last: 'Singh' }, { first: 'Pallavi', last: 'Mishra' }, { first: 'Rishabh', last: 'Goyal' },
    { first: 'Simran', last: 'Sethi' }, { first: 'Aniket', last: 'Dubey' }, { first: 'Mahima', last: 'Arora' },
    { first: 'Gaurav', last: 'Bhatt' }, { first: 'Tanya', last: 'Rastogi' }, { first: 'Manav', last: 'Singhal' },
    { first: 'Deepika', last: 'Khurana' }, { first: 'Pranav', last: 'Chandra' }, { first: 'Swati', last: 'Bajaj' },
    { first: 'Ayush', last: 'Tyagi' }, { first: 'Neha', last: 'Bhatnagar' }, { first: 'Kunal', last: 'Kohli' },
    { first: 'Aditi', last: 'Mathur' }, { first: 'Tushar', last: 'Garg' }, { first: 'Preeti', last: 'Chauhan' },
    { first: 'Abhishek', last: 'Jha' }, { first: 'Komal', last: 'Thakur' }
  ]

  const createdCandidates = []
  
  for (let i = 0; i < candidateNames.length; i++) {
    const name = candidateNames[i]
    const isPremium = i < 3 // First 3 candidates are premium
    
    const user = await prisma.user.create({
      data: {
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@example.com`,
        passwordHash: await bcrypt.hash('candidate123', 10),
        userType: 'CANDIDATE',
        isVerified: true,
        isActive: true,
        isPremium: isPremium,
        premiumExpiresAt: isPremium ? new Date('2025-12-31') : null,
        currentTermsAccepted: true,
        termsAcceptedAt: new Date(),
        verifiedAt: new Date()
      }
    })

    const randomInstitute = createdInstitutes[Math.floor(Math.random() * createdInstitutes.length)]
    const randomLocation = createdLocations[Math.floor(Math.random() * createdLocations.length)]
    
    const candidate = await prisma.candidate.create({
      data: {
        userId: user.id,
        firstName: name.first,
        lastName: name.last,
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dateOfBirth: randomDate(new Date('2000-01-01'), new Date('2005-12-31')),
        college: randomInstitute.instituteName,
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2025 + Math.floor(Math.random() * 2),
        cgpa: 7.5 + Math.random() * 2.5,
        bio: `Passionate ${name.first} pursuing Computer Science with interests in software development and innovation.`,
        city: randomLocation.city,
        state: randomLocation.state,
        country: 'India',
        showFullName: isPremium,
        showContact: isPremium,
        instituteId: randomInstitute.id,
        studentId: `CS${2021 + i}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        profileComplete: true,
        emailVerified: true,
        phoneVerified: isPremium
      }
    })

    // Create subscription for premium candidates
    if (isPremium) {
      await prisma.userSubscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM_CANDIDATE',
          status: 'ACTIVE',
          priceAmount: 1999, // ₹19.99
          currency: 'INR',
          billingCycle: 'MONTHLY',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          nextBillingDate: new Date('2025-10-01')
        }
      })
    }

    // Create candidate skills (Fixed - no duplicates with proper typing)
    const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'HTML', 'CSS', 'TypeScript', 'MongoDB']
    const selectedSkills: string[] = []
    
    // Select 4 unique skills for this candidate
    while (selectedSkills.length < 4 && selectedSkills.length < skills.length) {
      const skill = skills[Math.floor(Math.random() * skills.length)]
      if (!selectedSkills.includes(skill)) {
        selectedSkills.push(skill)
      }
    }
    
    // Create skills for candidate
    for (const skill of selectedSkills) {
      await prisma.candidateSkill.create({
        data: {
          candidateId: candidate.id,
          skillName: skill,
          proficiency: (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const)[Math.floor(Math.random() * 3)],
          yearsOfExperience: Math.floor(Math.random() * 3),
          isEndorsed: Math.random() > 0.5
        }
      })
    }

    // Create institute student mapping
    const randomProgram = await prisma.instituteProgram.findFirst({
      where: { instituteId: randomInstitute.id }
    })
    
    if (randomProgram) {
      await prisma.instituteStudent.create({
        data: {
          instituteId: randomInstitute.id,
          candidateId: candidate.id,
          studentId: candidate.studentId || `STD${i + 1}`,
          programId: randomProgram.id,
          semester: 6,
          year: 3,
          cgpa: candidate.cgpa
        }
      })
    }

    createdCandidates.push(candidate)
  }

  // 8. Create User Preferences for all users
  console.log('⚙️ Creating user preferences...')
  const allUsers = await prisma.user.findMany()
  const themes = ['teal', 'blue', 'purple']
  
  for (const user of allUsers) {
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        theme: themes[Math.floor(Math.random() * themes.length)],
        language: 'en',
        timezone: 'Asia/Kolkata',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: user.userType === 'CANDIDATE',
        profileVisibility: user.isPremium ? 'PUBLIC' : 'VERIFIED_ONLY',
        showContactInfo: user.isPremium,
        jobAlertEnabled: user.userType === 'CANDIDATE'
      }
    })
  }

  // 9. Create Opportunities
  console.log('💼 Creating opportunities...')
  const opportunityTitles = [
    'Software Development Intern',
    'Data Science Intern',
    'UI/UX Design Intern',
    'Digital Marketing Intern',
    'Business Development Intern',
    'Content Writing Intern',
    'Finance Intern',
    'HR Intern',
    'Operations Intern',
    'Research Intern',
    'Full Stack Developer Intern',
    'Machine Learning Intern',
    'Frontend Developer Intern',
    'Backend Developer Intern',
    'Product Manager Intern',
    'Graphic Designer Intern',
    'Social Media Marketing Intern',
    'SEO Specialist Intern',
    'Sales Development Intern',
    'Customer Success Intern',
    'Quality Assurance Intern',
    'DevOps Intern',
    'Business Analyst Intern',
    'Technical Writer Intern',
    'Market Research Intern',
    'Financial Analyst Intern',
    'Recruitment Intern',
    'Supply Chain Intern',
    'Project Management Intern',
    'Cybersecurity Intern',
    'Mobile App Developer Intern',
    'Cloud Engineer Intern',
    'Data Analyst Intern',
    'Brand Manager Intern',
    'Event Management Intern'
  ]

  const createdOpportunities = []
  
  for (let i = 0; i < opportunityTitles.length; i++) {
    const title = opportunityTitles[i]
    const industry = createdIndustries[i % createdIndustries.length]
    const category = createdCategories[i % createdCategories.length]
    const location = createdLocations[i % createdLocations.length]
    
    const opportunity = await prisma.opportunity.create({
      data: {
        industryId: industry.id,
        title: title,
        description: `We are looking for a motivated ${title.toLowerCase()} to join our team and contribute to exciting projects.`,
        type: i >= 8 ? 'FREELANCING' : i >= 6 ? 'PROJECT' : 'INTERNSHIP',
        categoryId: category.id,
        locationId: location.id,
        workType: ['REMOTE', 'ONSITE', 'HYBRID'][Math.floor(Math.random() * 3)] as any,
        duration: 2 + Math.floor(Math.random() * 4), // 2-6 months
        stipend: 10000 + Math.floor(Math.random() * 40000), // ₹10k-50k
        requirements: `Strong foundation in ${category.name.toLowerCase()}. Excellent communication skills. Team player.`,
        minQualification: 'Pursuing Bachelor\'s degree in relevant field',
        preferredSkills: 'Programming, Problem-solving, Communication',
        experienceRequired: 0,
        applicationDeadline: new Date('2025-11-30'),
        startDate: new Date('2025-12-01'),
        isPremiumOnly: i >= 8, // Freelancing projects are premium only
        showCompanyName: industry.showCompanyName,
        slug: generateSlug(`${title}-${industry.companyName}-${i + 1}`)
      }
    })

    // Create opportunity skills
    const requiredSkills = ['Communication', 'Teamwork', 'Problem Solving']
    if (i < 3) requiredSkills.push('Programming')
    if (i >= 3 && i < 6) requiredSkills.push('Creativity')
    
    for (const skill of requiredSkills) {
      await prisma.opportunitySkill.create({
        data: {
          opportunityId: opportunity.id,
          skillName: skill,
          isRequired: true,
          minLevel: 'INTERMEDIATE'
        }
      })
    }

    createdOpportunities.push(opportunity)
  }

  // 10. Create Applications (Increased to 150)
  console.log('📝 Creating applications...')
  
  for (let i = 0; i < 150; i++) {
    const candidate = createdCandidates[Math.floor(Math.random() * createdCandidates.length)]
    const opportunity = createdOpportunities[Math.floor(Math.random() * createdOpportunities.length)]
    
    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        opportunityId_candidateId: {
          opportunityId: opportunity.id,
          candidateId: candidate.id
        }
      }
    })
    
    if (!existing) {
      await prisma.application.create({
        data: {
          opportunityId: opportunity.id,
          candidateId: candidate.id,
          industryId: opportunity.industryId,
          coverLetter: 'I am very interested in this position and believe my skills would be valuable to your team.',
          expectedSalary: opportunity.stipend ? opportunity.stipend + Math.floor(Math.random() * 10000) : null,
          canJoinFrom: new Date('2025-12-01'),
          status: ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED'][Math.floor(Math.random() * 4)] as any,
          candidateViewed: Math.random() > 0.5,
          contactViewed: Math.random() > 0.3
        }
      })
    }
  }

  // 11. Create Blog Posts (Increased to 12)
  console.log('📝 Creating blog posts...')
  const extendedBlogPosts = [
    ...blogPosts,
    {
      title: 'The Ultimate Guide to Remote Internships in 2025',
      excerpt: 'Everything you need to know about succeeding in remote internships.',
      content: 'Remote work is here to stay. Here\'s how to make the most of remote internship opportunities...'
    },
    {
      title: 'Building Your Personal Brand as an Intern',
      excerpt: 'Stand out from the crowd by developing a strong personal brand.',
      content: 'Your personal brand is your professional identity. Here\'s how to build it during your internship...'
    },
    {
      title: 'Networking Tips for Introverted Students',
      excerpt: 'Practical networking strategies for students who prefer quiet approaches.',
      content: 'Networking doesn\'t have to be overwhelming. Here are gentle approaches that work...'
    },
    {
      title: 'Tech Skills That Will Get You Hired in 2025',
      excerpt: 'The most in-demand technical skills across industries.',
      content: 'Stay ahead of the curve with these essential technical skills...'
    },
    {
      title: 'How to Negotiate Your Internship Stipend',
      excerpt: 'Professional tips for discussing compensation with potential employers.',
      content: 'Yes, you can negotiate your internship compensation. Here\'s how to do it professionally...'
    },
    {
      title: 'Converting Your Internship into a Full-Time Job Offer',
      excerpt: 'Proven strategies to turn your internship into a permanent position.',
      content: 'Many successful careers start with internships. Here\'s how to secure that full-time offer...'
    },
    {
      title: 'The Psychology of First Impressions in Interviews',
      excerpt: 'Understanding how to make a lasting positive impression.',
      content: 'First impressions matter more than you think. Here\'s the science behind making great ones...'
    },
    {
      title: 'Industry Insights: What Recruiters Really Look For',
      excerpt: 'Behind-the-scenes look at what catches a recruiter\'s attention.',
      content: 'We interviewed top recruiters to understand what they really want to see...'
    },
    {
      title: 'Balancing Internships with Academic Commitments',
      excerpt: 'Time management strategies for successful student professionals.',
      content: 'Juggling internships and studies can be challenging. Here\'s how to excel at both...'
    }
  ]
  
  for (let i = 0; i < extendedBlogPosts.length; i++) {
    const post = extendedBlogPosts[i]
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: generateSlug(post.title),
        excerpt: post.excerpt,
        content: post.content,
        status: 'PUBLISHED',
        publishedAt: randomDate(new Date('2025-01-01'), new Date()),
        authorName: 'Internship And Project Team',
        authorEmail: 'team@Internship And Project.com',
        category: ['Career Advice', 'Industry Insights', 'Skill Development', 'Interview Tips'][Math.floor(Math.random() * 4)],
        tags: ['internship', 'career', 'skills', 'advice', 'professional development'],
        viewCount: Math.floor(Math.random() * 2000) + 100,
        likeCount: Math.floor(Math.random() * 200) + 10,
        shareCount: Math.floor(Math.random() * 100) + 5
      }
    })
  }

  // 12. Create Search Queries (Analytics) - Increased to 50
  console.log('🔍 Creating search analytics...')
  const searchTerms = [
    'software intern', 'data science', 'remote internship', 'marketing intern', 'ui ux design',
    'full stack developer', 'machine learning', 'frontend developer', 'backend developer', 'product manager',
    'graphic designer', 'social media marketing', 'seo specialist', 'sales development', 'customer success',
    'quality assurance', 'devops intern', 'business analyst', 'technical writer', 'market research',
    'financial analyst', 'recruitment intern', 'supply chain', 'project management', 'cybersecurity',
    'mobile app developer', 'cloud engineer', 'data analyst', 'brand manager', 'event management'
  ]
  
  for (let i = 0; i < 50; i++) {
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)]
    await prisma.searchQuery.create({
      data: {
        query: term,
        userType: ['CANDIDATE', 'INDUSTRY'][Math.floor(Math.random() * 2)] as any,
        isPremium: Math.random() > 0.5,
        filters: {
          category: categories[Math.floor(Math.random() * categories.length)].name,
          location: locations[Math.floor(Math.random() * locations.length)].city,
          workType: ['REMOTE', 'ONSITE', 'HYBRID'][Math.floor(Math.random() * 3)]
        },
        resultsCount: Math.floor(Math.random() * 50) + 5,
        clickedResults: Math.floor(Math.random() * 10),
        userIp: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`
📊 Seed Summary:
- 👤 Users: ${await prisma.user.count()}
- 🎓 Candidates: ${await prisma.candidate.count()}
- 🏢 Industries: ${await prisma.industry.count()}
- 🏫 Institutes: ${await prisma.institute.count()}
- 💼 Opportunities: ${await prisma.opportunity.count()}
- 📝 Applications: ${await prisma.application.count()}
- 📁 Categories: ${await prisma.category.count()}
- 📍 Locations: ${await prisma.location.count()}
- 📰 Blog Posts: ${await prisma.blogPost.count()}
- 💳 Subscriptions: ${await prisma.userSubscription.count()}
`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })