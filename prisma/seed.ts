import 'dotenv/config'
/**
 * Comprehensive Database Seed Script
 * NextIntern - Internship Platform
 * 
 * This script creates realistic sample data for development:
 * - 50 Students, 10 Companies, 2 Admins
 * - 55 Internships (40 active, 15 expired)
 * - 300 Applications with realistic distribution
 * - Complete skills, categories, locations, and interactions
 */

import { PrismaClient, UserType, CompanySize, WorkType, ApplicationStatus, SkillLevel, PostStatus, NotificationType, InterviewType, InterviewStatus, TicketStatus, TicketPriority } from '@prisma/client'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()

// Utility Functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Sample Data Arrays
const categories = [
  { name: 'Technology', icon: 'Code', color: '#3B82F6' },
  { name: 'Marketing', icon: 'TrendingUp', color: '#EF4444' },
  { name: 'Design', icon: 'Palette', color: '#8B5CF6' },
  { name: 'Finance', icon: 'DollarSign', color: '#10B981' },
  { name: 'Human Resources', icon: 'Users', color: '#F59E0B' },
  { name: 'Operations', icon: 'Settings', color: '#6B7280' },
  { name: 'Sales', icon: 'Target', color: '#EC4899' },
  { name: 'Content Writing', icon: 'PenTool', color: '#14B8A6' }
]

const locations = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  { city: 'Surat', state: 'Gujarat', country: 'India' },
  { city: 'New York', state: 'New York', country: 'USA' },
  { city: 'London', state: 'England', country: 'UK' },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore' },
  { city: 'Toronto', state: 'Ontario', country: 'Canada' },
  { city: 'Sydney', state: 'New South Wales', country: 'Australia' }
]

const skills = [
  // Technical Skills
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML/CSS',
  'Next.js', 'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'GraphQL', 'REST APIs', 'Git',
  'Docker', 'AWS', 'Azure', 'Google Cloud', 'Kubernetes', 'Linux', 'Bash',
  
  // Design Skills
  'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Sketch', 'UI/UX Design',
  'Wireframing', 'Prototyping', 'User Research', 'Design Systems', 'Adobe XD',
  
  // Marketing Skills
  'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
  'Email Marketing', 'Google Analytics', 'Facebook Ads', 'LinkedIn Marketing',
  'Copywriting', 'Brand Management', 'Market Research',
  
  // Business Skills
  'Project Management', 'Data Analysis', 'Excel', 'PowerPoint', 'Salesforce',
  'Customer Service', 'Business Development', 'Financial Analysis', 'Accounting',
  'HR Management', 'Operations Management', 'Supply Chain',
  
  // Soft Skills
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Creativity', 'Public Speaking', 'Negotiation'
]

const companies = [
  { name: 'TechFlow Solutions', industry: 'Technology', size: 'STARTUP', founded: 2020, verified: true },
  { name: 'InnovateCorp', industry: 'Technology', size: 'SMALL', founded: 2018, verified: true },
  { name: 'DesignHub Studio', industry: 'Design', size: 'STARTUP', founded: 2021, verified: true },
  { name: 'MarketGrow Agency', industry: 'Marketing', size: 'SMALL', founded: 2017, verified: true },
  { name: 'FinanceFirst Solutions', industry: 'Finance', size: 'MEDIUM', founded: 2015, verified: true },
  { name: 'GlobalTech Industries', industry: 'Technology', size: 'LARGE', founded: 2010, verified: true },
  { name: 'CreativeMinds', industry: 'Design', size: 'SMALL', founded: 2019, verified: true },
  { name: 'DataDriven Analytics', industry: 'Technology', size: 'MEDIUM', founded: 2016, verified: false },
  { name: 'SalesBoost Inc', industry: 'Sales', size: 'SMALL', founded: 2020, verified: false },
  { name: 'ContentCrafters', industry: 'Content Writing', size: 'STARTUP', founded: 2022, verified: false }
]

const colleges = [
  'Indian Institute of Technology, Mumbai',
  'Indian Institute of Technology, Delhi', 
  'Indian Institute of Science, Bangalore',
  'Pune Institute of Computer Technology',
  'Delhi Technological University',
  'Birla Institute of Technology and Science',
  'National Institute of Technology, Trichy',
  'Vellore Institute of Technology',
  'Manipal Institute of Technology',
  'SRM Institute of Science and Technology',
  'Amity University',
  'Lovely Professional University',
  'MIT Academy of Engineering',
  'University of Mumbai',
  'Anna University'
]

const degrees = ['B.Tech', 'B.E.', 'BCA', 'B.Sc', 'B.Com', 'BBA', 'M.Tech', 'MCA', 'MBA']
const fields = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Marketing', 'Finance', 'Design', 'Business Administration']

// Blog post content
const blogPosts = [
  {
    title: 'Top 10 Skills Every Software Engineering Intern Should Have',
    excerpt: 'Discover the essential technical and soft skills that will make you stand out as a software engineering intern in 2024.',
    content: 'In today\'s competitive tech landscape, software engineering interns need a diverse skill set to succeed...'
  },
  {
    title: 'How to Write a Compelling Cover Letter for Tech Internships',
    excerpt: 'Learn the art of crafting cover letters that grab attention and land you interviews at top tech companies.',
    content: 'A well-written cover letter can be the difference between getting an interview and being overlooked...'
  },
  {
    title: 'Remote Internships: Pros, Cons, and Best Practices',
    excerpt: 'Navigate the world of remote internships with our comprehensive guide covering everything from communication to productivity.',
    content: 'Remote work has become the new normal, and internships are no exception...'
  },
  {
    title: 'Building Your Personal Brand as a Student',
    excerpt: 'Establish your professional identity early with these proven strategies for personal branding.',
    content: 'In an increasingly connected world, your personal brand can set you apart from other candidates...'
  },
  {
    title: 'Interview Preparation: Technical and Behavioral Questions',
    excerpt: 'Master both technical challenges and behavioral interviews with our expert tips and practice questions.',
    content: 'Preparing for internship interviews requires a dual approach: technical competency and soft skills...'
  },
  {
    title: 'Networking for Introverts: Building Professional Connections',
    excerpt: 'Discover networking strategies that work for introverted personalities in the professional world.',
    content: 'Networking doesn\'t have to be overwhelming, even for introverts. Here are practical approaches...'
  },
  {
    title: 'From Intern to Full-Time: Making the Most of Your Internship',
    excerpt: 'Transform your internship experience into a full-time job offer with these actionable strategies.',
    content: 'Many successful careers start with great internships. Here\'s how to maximize your internship experience...'
  },
  {
    title: 'The Future of Work: Skills That Will Matter in 2025',
    excerpt: 'Stay ahead of the curve by developing skills that will be in high demand in the coming years.',
    content: 'The job market is evolving rapidly. Here are the skills that will define the next generation of professionals...'
  }
]

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Clearing existing data...')
  
  await prisma.supportTicket.deleteMany()
  await prisma.userPreference.deleteMany()
  await prisma.searchQuery.deleteMany()
  await prisma.internshipView.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.savedInternship.deleteMany()
  await prisma.studentSkill.deleteMany()
  await prisma.internshipSkill.deleteMany()
  await prisma.application.deleteMany()
  await prisma.internship.deleteMany()
  await prisma.student.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()
  await prisma.location.deleteMany()
  await prisma.category.deleteMany()

  // 1. Create Categories
  console.log('📁 Creating categories...')
  const createdCategories = await Promise.all(
    categories.map(category =>
      prisma.category.create({
        data: {
          name: category.name,
          slug: generateSlug(category.name),
          description: `Internships related to ${category.name}`,
          icon: category.icon,
          color: category.color,
          sortOrder: categories.indexOf(category)
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
          slug: generateSlug(`${location.city}-${location.country}`)
        }
      })
    )
  )

  // 3. Create Admin Users
  console.log('👨‍💼 Creating admin users...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@nextintern.com',
        passwordHash: hashedPassword,
        userType: UserType.ADMIN,
        isVerified: true,
        preferences: {
          create: {
            theme: 'teal',
            emailNotifications: true,
            pushNotifications: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'support@nextintern.com',
        passwordHash: hashedPassword,
        userType: UserType.ADMIN,
        isVerified: true,
        preferences: {
          create: {
            theme: 'blue',
            emailNotifications: true,
            pushNotifications: true
          }
        }
      }
    })
  ])

  // 4. Create Company Users & Profiles
  console.log('🏢 Creating companies...')
  const companyUsers = []
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i]
    const location = getRandomElement(createdLocations)
    const password = await bcrypt.hash('company123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: `contact@${generateSlug(company.name)}.com`,
        passwordHash: password,
        userType: UserType.COMPANY,
        isVerified: company.verified,
        company: {
          create: {
            companyName: company.name,
            industry: company.industry,
            companySize: company.size as CompanySize,
            foundedYear: company.founded,
            email: `hr@${generateSlug(company.name)}.com`,
            phone: `+91 ${randomBetween(70000, 99999)}${randomBetween(10000, 99999)}`,
            websiteUrl: `https://www.${generateSlug(company.name)}.com`,
            description: `${company.name} is a leading ${company.industry.toLowerCase()} company focused on innovation and excellence. We provide cutting-edge solutions and foster a collaborative work environment for our team members.`,
            city: location.city,
            state: location.state,
            country: location.country,
            address: `${randomBetween(1, 999)} ${getRandomElement(['Tech Park', 'Business Hub', 'Corporate Center', 'Innovation Square'])}`,
            isVerified: company.verified,
            logoUrl: `https://ui-avatars.com/api/?name=${company.name}&background=random`
          }
        },
        preferences: {
          create: {
            theme: getRandomElement(['teal', 'blue', 'purple']),
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: false
          }
        }
      },
      include: {
        company: true
      }
    })
    
    companyUsers.push(user)
  }

  // 5. Create Student Users & Profiles
  console.log('👨‍🎓 Creating students...')
  const studentUsers = []
  const firstNames = ['Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Karan', 'Pooja', 'Aditya', 'Riya', 'Siddharth', 'Kavya', 'Rohan', 'Ishika', 'Dev', 'Meera', 'Aarav', 'Tara', 'Nikhil', 'Asha', 'Varun', 'Diya', 'Aryan', 'Nisha', 'Akash', 'Shreya', 'Harsh', 'Tanvi', 'Yash', 'Sakshi', 'Gaurav', 'Ritika', 'Abhishek', 'Neha', 'Shubham', 'Ankita', 'Manish', 'Simran', 'Rajesh', 'Deepika', 'Suresh', 'Pallavi', 'Amit', 'Swati', 'Vishal', 'Preeti', 'Sandeep', 'Madhuri', 'Ajay', 'Sunita']
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain', 'Bansal', 'Mittal', 'Chopra', 'Malhotra', 'Aggarwal', 'Saxena', 'Joshi', 'Tiwari', 'Mishra', 'Srivastava', 'Pandey', 'Yadav', 'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Shah', 'Mehta', 'Desai', 'Gandhi', 'Thakur', 'Bhatia']

  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 99)}@gmail.com`
    const password = await bcrypt.hash('student123', 12)
    const location = getRandomElement(createdLocations)
    const graduationYear = randomBetween(2024, 2026)
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password,
        userType: UserType.STUDENT,
        isVerified: Math.random() > 0.1, // 90% verified
        student: {
          create: {
            firstName,
            lastName,
            phone: `+91 ${randomBetween(70000, 99999)}${randomBetween(10000, 99999)}`,
            dateOfBirth: randomDate(new Date(1998, 0, 1), new Date(2005, 11, 31)),
            college: getRandomElement(colleges),
            degree: getRandomElement(degrees),
            fieldOfStudy: getRandomElement(fields),
            graduationYear,
            cgpa: Math.round((Math.random() * 3 + 6) * 100) / 100, // 6.0 to 9.0
            bio: `Passionate ${getRandomElement(fields).toLowerCase()} student with strong academic background and enthusiasm for learning. Looking forward to gaining practical experience through internships.`,
            city: location.city,
            state: location.state,
            country: location.country,
            linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}${randomBetween(1, 99)}`,
            githubUrl: Math.random() > 0.6 ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}${randomBetween(1, 99)}` : null,
            resumeUrl: `https://example.com/resumes/${firstName.toLowerCase()}-${lastName.toLowerCase()}-resume.pdf`
          }
        },
        preferences: {
          create: {
            theme: getRandomElement(['teal', 'blue', 'purple']),
            emailNotifications: true,
            pushNotifications: Math.random() > 0.2,
            marketingEmails: Math.random() > 0.7
          }
        }
      },
      include: {
        student: true
      }
    })
    
    studentUsers.push(user)
  }

  // 6. Create Student Skills
  console.log('💪 Creating student skills...')
  for (const user of studentUsers) {
    const studentSkills = getRandomElements(skills, randomBetween(3, 7))
    
    for (const skill of studentSkills) {
      await prisma.studentSkill.create({
        data: {
          studentId: user.student!.id,
          skillName: skill,
          proficiency: getRandomElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as SkillLevel[]),
          yearsOfExperience: Math.random() > 0.3 ? randomBetween(0, 4) : null
        }
      })
    }
  }

  // 7. Create Internships
  console.log('💼 Creating internships...')
  const internshipTitles = [
    'Frontend Developer Intern', 'Backend Developer Intern', 'Full Stack Developer Intern',
    'Mobile App Developer Intern', 'UI/UX Design Intern', 'Graphic Design Intern',
    'Digital Marketing Intern', 'Social Media Marketing Intern', 'Content Writing Intern',
    'Data Analyst Intern', 'Business Analyst Intern', 'Finance Intern',
    'HR Intern', 'Operations Intern', 'Sales Intern', 'Product Management Intern',
    'Quality Assurance Intern', 'DevOps Intern', 'Machine Learning Intern',
    'Cybersecurity Intern', 'Brand Management Intern', 'Market Research Intern'
  ]

  const createdInternships = []
  
  for (let i = 0; i < 55; i++) {
    const company = getRandomElement(companyUsers)
    const category = getRandomElement(createdCategories)
    const location = getRandomElement(createdLocations)
    const title = getRandomElement(internshipTitles)
    const isActive = i < 40 // First 40 are active, rest are expired
    
    const internship = await prisma.internship.create({
      data: {
        companyId: company.company!.id,
        title,
        description: `We are looking for a motivated ${title} to join our dynamic team. This is an excellent opportunity to gain hands-on experience in ${category.name.toLowerCase()} while working on real-world projects.

Key Responsibilities:
• Collaborate with experienced professionals on ongoing projects
• Learn and apply industry best practices
• Contribute to team goals and objectives
• Participate in meetings and brainstorming sessions
• Complete assigned tasks within specified timelines

What You'll Gain:
• Practical experience in ${category.name.toLowerCase()}
• Mentorship from senior team members
• Exposure to modern tools and technologies
• Professional network building
• Certificate of completion`,
        categoryId: category.id,
        locationId: location.id,
        workType: getRandomElement(['REMOTE', 'ONSITE', 'HYBRID'] as WorkType[]),
        duration: randomBetween(8, 24), // 8-24 weeks
        stipend: Math.random() > 0.2 ? randomBetween(5000, 50000) : null,
        requirements: `• Currently pursuing ${getRandomElement(degrees)} in relevant field
• Strong communication skills
• Eagerness to learn and adapt
• Basic knowledge of ${getRandomElements(skills, 3).join(', ')}
• Minimum CGPA of ${(Math.random() * 2 + 6).toFixed(1)}`,
        minQualification: `${getRandomElement(degrees)} student in final or pre-final year`,
        preferredSkills: getRandomElements(skills, randomBetween(3, 6)).join(', '),
        applicationDeadline: isActive ? randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
        startDate: isActive ? randomDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)) : randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
        isActive,
        slug: `${generateSlug(title)}-${generateSlug(company.company!.companyName)}-${Date.now()}`,
        viewCount: randomBetween(5, 150),
        applicationCount: 0 // Will be updated after creating applications
      },
      select: {
        id: true,
        companyId: true,
        title: true,
        isActive: true,
        applicationDeadline: true,
        createdAt: true
      }
    })
    
    // Add skills for this internship
    const internshipSkills = getRandomElements(skills, randomBetween(3, 6))
    for (const skill of internshipSkills) {
      await prisma.internshipSkill.create({
        data: {
          internshipId: internship.id,
          skillName: skill,
          isRequired: Math.random() > 0.3
        }
      })
    }
    
    createdInternships.push(internship)
  }

  // 8. Create Applications
  console.log('📝 Creating applications...')
  type ApplicationRecord = {
    id: number
    internshipId: number
    studentId: number
    status: ApplicationStatus
  }
  const applications: ApplicationRecord[] = []
  
  for (let i = 0; i < 300; i++) {
    const student = getRandomElement(studentUsers)
    const internship = getRandomElement(createdInternships.filter(int => int.isActive || Math.random() > 0.7))
    
    // Check if student already applied to this internship
    const existingApplication = applications.find(app => 
      app.studentId === Number(student.student!.id) && app.internshipId === Number(internship.id)
    )
    
    if (existingApplication) continue // Skip if already applied
    
    const status = getRandomElement([
      'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', 'PENDING', // 60% pending
      'UNDER_REVIEW', 'UNDER_REVIEW', 'UNDER_REVIEW', 'UNDER_REVIEW', // 20% under review
      'ACCEPTED', 'SHORTLISTED', // 10% positive
      'REJECTED' // 10% rejected
    ] as ApplicationStatus[])
    
    const appliedAt = randomDate(
      new Date(internship.createdAt.getTime()),
      internship.isActive ? new Date() : internship.applicationDeadline || new Date()
    )
    
    const application = await prisma.application.create({
      data: {
        internshipId: internship.id,
        studentId: String(student.student!.id),
        coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${internship.title} position at ${companyUsers.find(c => c.company!.id === internship.companyId)?.company!.companyName}. As a ${student.student!.degree} student in ${student.student!.fieldOfStudy} at ${student.student!.college}, I am excited about the opportunity to contribute to your team while gaining valuable industry experience.

My academic background and personal projects have equipped me with relevant skills including ${getRandomElements(skills, 3).join(', ')}. I am particularly drawn to your company because of its reputation for innovation and commitment to professional development.

I am eager to learn from your experienced team and contribute meaningfully to your projects. Thank you for considering my application. I look forward to discussing how I can add value to your organization.

Best regards,
${student.student!.firstName} ${student.student!.lastName}`,
        status,
        appliedAt,
        reviewedAt: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'SHORTLISTED'].includes(status) ? 
          randomDate(appliedAt, new Date()) : null,
        companyNotes: ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'SHORTLISTED'].includes(status) && Math.random() > 0.5 ? 
          getRandomElement([
            'Strong technical background, good fit for the role',
            'Impressive academic record and relevant projects',
            'Good communication skills, potential for growth',
            'Need to assess technical skills further',
            'Excellent portfolio and github contributions'
          ]) : null,
        rejectionReason: status === 'REJECTED' && Math.random() > 0.5 ? 
          getRandomElement([
            'Position filled by another candidate',
            'Looking for more experienced candidates',
            'Skill set not aligned with current requirements',
            'High volume of applications received'
          ]) : null
      }
    })
    
    applications.push({
      ...application,
      id: Number(application.id),
      studentId: Number(student.student!.id),
      internshipId: Number(internship.id)
    })
  }

  // Update internship application counts
  for (const internship of createdInternships) {
    const appCount = applications.filter(app => app.internshipId === Number(internship.id)).length
    await prisma.internship.update({
      where: { id: internship.id },
      data: { applicationCount: appCount }
    })
  }

  console.log(`✅ Created ${applications.length} applications`)

  // 9. Create Saved Internships
  console.log('❤️ Creating saved internships...')
  for (let i = 0; i < 180; i++) {
    const student = getRandomElement(studentUsers)
    const internship = getRandomElement(createdInternships.filter(int => int.isActive))
    
    try {
      await prisma.savedInternship.create({
        data: {
          studentId: student.student!.id,
          internshipId: internship.id,
          savedAt: randomDate(new Date(internship.createdAt.getTime()), new Date())
        }
      })
    } catch {
      // Skip if already saved (unique constraint)
      continue
    }
  }

  // 10. Create Student Certificates
  console.log('🏆 Creating certificates...')
  const certificateIssuers = ['Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'AWS', 'Google', 'Microsoft', 'Oracle', 'IBM', 'Cisco']
  const certificateNames = [
    'Web Development Fundamentals', 'JavaScript Programming', 'React Development', 'Node.js Backend Development',
    'Python for Data Science', 'Machine Learning Basics', 'Digital Marketing', 'UI/UX Design Principles',
    'Project Management', 'Data Analysis with Excel', 'Cloud Computing Fundamentals', 'Cybersecurity Basics',
    'Mobile App Development', 'Database Management', 'API Development'
  ]
  
  for (let i = 0; i < 60; i++) {
    const student = getRandomElement(studentUsers)
    const issuer = getRandomElement(certificateIssuers)
    const certName = getRandomElement(certificateNames)
    const issueDate = randomDate(new Date(2022, 0, 1), new Date())
    
    await prisma.certificate.create({
      data: {
        studentId: student.student!.id,
        name: certName,
        issuer: issuer,
        issueDate: issueDate,
        expiryDate: Math.random() > 0.7 ? randomDate(issueDate, new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000 * 3)) : null,
        credentialId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        credentialUrl: `https://credentials.${issuer.toLowerCase().replace(/\s+/g, '')}.com/cert/${Math.random().toString(36).substr(2, 9)}`,
        description: `Certificate earned for completing ${certName} course with excellent performance.`
      }
    })
  }

  // 11. Create Messages
  console.log('💬 Creating messages...')
  for (let i = 0; i < 150; i++) {
    const isStudentToCompany = Math.random() > 0.5
    const sender = isStudentToCompany ? getRandomElement(studentUsers) : getRandomElement(companyUsers)
    const receiver = isStudentToCompany ? getRandomElement(companyUsers) : getRandomElement(studentUsers)
    
    const subjects = [
      'Internship Application Follow-up',
      'Question about Role Requirements',
      'Interview Scheduling',
      'Additional Information Request',
      'Thank you for the Opportunity',
      'Portfolio Submission',
      'Clarification on Job Description',
      'Next Steps in Application Process'
    ]
    
    const studentMessages = [
      'I hope this message finds you well. I recently applied for the internship position and wanted to follow up on the status of my application.',
      'Thank you for considering my application. I would love to learn more about the role and how I can contribute to your team.',
      'I am very interested in this opportunity and would appreciate any additional information about the interview process.',
      'I have attached my updated portfolio for your review. Please let me know if you need any additional documents.',
      'Could you please provide more details about the day-to-day responsibilities of this internship position?'
    ]
    
    const companyMessages = [
      'Thank you for your interest in our internship program. We have received your application and will review it shortly.',
      'We would like to schedule a preliminary interview to discuss your application further. Are you available next week?',
      'Your application caught our attention. Could you please provide some additional information about your project experience?',
      'We appreciate your enthusiasm for the role. We will get back to you with next steps within the next few days.',
      'Thank you for the follow-up. We are currently reviewing all applications and will contact shortlisted candidates soon.'
    ]
    
    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        subject: getRandomElement(subjects),
        content: isStudentToCompany ? getRandomElement(studentMessages) : getRandomElement(companyMessages),
        isRead: Math.random() > 0.3,
        sentAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  // 12. Create Interviews
  console.log('🎯 Creating interviews...')
  const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED' || app.status === 'SHORTLISTED')
  
  for (let i = 0; i < Math.min(40, acceptedApplications.length); i++) {
    const application = getRandomElement(acceptedApplications)
    const internship = createdInternships.find(int => Number(int.id) === Number(application.internshipId))
    const company = companyUsers.find(c => c.company!.id === internship?.companyId)
    const student = studentUsers.find(s => Number(s.student!.id) === Number(application.studentId))
    
    if (!company || !student || !internship) continue
    
    const scheduledAt = randomDate(new Date(), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
    const interviewTypes = ['PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'HR'] as InterviewType[]
    const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as InterviewStatus[]
    
    await prisma.interview.create({
      data: {
        applicationId: String(application.id),
        companyId: company.company!.id,
        studentId: student.student!.id,
        title: `${getRandomElement(interviewTypes)} Interview - ${internship.title}`,
        description: 'Technical and behavioral interview to assess candidate suitability for the internship position.',
        scheduledAt,
        duration: randomBetween(30, 90),
        location: getRandomElement(interviewTypes) === 'VIDEO' ? 'https://meet.google.com/abc-defg-hij' : 
                 getRandomElement(interviewTypes) === 'PHONE' ? 'Phone Call' :
                 `${company.company!.address}, ${company.company!.city}`,
        type: getRandomElement(interviewTypes),
        status: getRandomElement(statuses),
        feedback: Math.random() > 0.5 ? getRandomElement([
          'Candidate showed strong technical knowledge and enthusiasm',
          'Good communication skills, needs improvement in technical areas',
          'Excellent problem-solving approach and cultural fit',
          'Well-prepared candidate with relevant project experience'
        ]) : null,
        rating: Math.random() > 0.4 ? randomBetween(3, 5) : null
      }
    })
  }

  // 13. Create Notifications
  console.log('🔔 Creating notifications...')
  const allUsers = [...studentUsers, ...companyUsers, ...adminUsers]
  
  for (let i = 0; i < 400; i++) {
    const user = getRandomElement(allUsers)
    const notificationTypes = ['APPLICATION_UPDATE', 'NEW_MESSAGE', 'INTERVIEW_SCHEDULED', 'INTERNSHIP_REMINDER', 'SYSTEM_UPDATE'] as NotificationType[]
    const type = getRandomElement(notificationTypes)
    
    const notificationContent = {
      'APPLICATION_UPDATE': {
        title: 'Application Status Updated',
        message: 'Your application status has been updated. Please check your dashboard for details.'
      },
      'NEW_MESSAGE': {
        title: 'New Message Received',
        message: 'You have received a new message. Click to view and respond.'
      },
      'INTERVIEW_SCHEDULED': {
        title: 'Interview Scheduled',
        message: 'An interview has been scheduled for your application. Please check the details.'
      },
      'INTERNSHIP_REMINDER': {
        title: 'Application Deadline Approaching',
        message: 'Don\'t miss out! The application deadline is approaching for internships you saved.'
      },
      'SYSTEM_UPDATE': {
        title: 'Platform Update',
        message: 'We\'ve added new features to improve your experience. Check out what\'s new!'
      }
    }
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title: notificationContent[type as keyof typeof notificationContent].title,
        message: notificationContent[type as keyof typeof notificationContent].message,
        isRead: Math.random() > 0.4,
        data: JSON.stringify({ timestamp: new Date().toISOString() }),
        createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  // 14. Create Internship Views (Analytics)
  console.log('👀 Creating internship views...')
  for (let i = 0; i < 800; i++) {
    const internship = getRandomElement(createdInternships)
    const ipAddresses = ['192.168.1.', '203.110.245.', '157.240.12.', '172.217.16.', '13.107.42.']
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ]
    
    await prisma.internshipView.create({
      data: {
        internshipId: internship.id,
        viewerIp: `${getRandomElement(ipAddresses)}${randomBetween(1, 254)}`,
        userAgent: getRandomElement(userAgents),
        referer: Math.random() > 0.5 ? getRandomElement(['https://google.com', 'https://linkedin.com', 'https://facebook.com', null]) : null,
        viewedAt: randomDate(new Date(internship.createdAt.getTime()), new Date())
      }
    })
  }

  // 15. Create Search Queries (Analytics)
  console.log('🔍 Creating search queries...')
  const searchTerms = [
    'frontend developer', 'backend developer', 'full stack', 'react', 'node.js', 'python',
    'ui ux design', 'graphic design', 'digital marketing', 'content writing', 'data analyst',
    'machine learning', 'mobile app', 'flutter', 'android', 'ios', 'marketing intern',
    'finance intern', 'hr intern', 'business analyst', 'remote internship', 'mumbai internship',
    'bangalore jobs', 'startup internship', 'tech internship'
  ]
  
  for (let i = 0; i < 200; i++) {
    const query = getRandomElement(searchTerms)
    const ipAddresses = ['192.168.1.', '203.110.245.', '157.240.12.']
    
    await prisma.searchQuery.create({
      data: {
        query,
        filters: Math.random() > 0.5 ? JSON.stringify({
          category: getRandomElement(createdCategories).name,
          location: getRandomElement(createdLocations).city,
          workType: getRandomElement(['REMOTE', 'ONSITE', 'HYBRID'])
        }) : undefined,
        resultsCount: randomBetween(0, 50),
        userIp: `${getRandomElement(ipAddresses)}${randomBetween(1, 254)}`,
        searchedAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  // 16. Create Blog Posts
  console.log('📝 Creating blog posts...')
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i]
    
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: generateSlug(post.title),
        excerpt: post.excerpt,
        content: post.content + '\n\nThis is a comprehensive guide that covers all the essential aspects you need to know. We regularly update our content to provide the most current and relevant information for students and professionals alike.',
        featuredImage: `https://picsum.photos/800/400?random=${i}`,
        metaTitle: post.title,
        metaDescription: post.excerpt,
        status: PostStatus.PUBLISHED,
        publishedAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
        authorName: getRandomElement(['Admin Team', 'Career Counselor', 'Industry Expert', 'HR Specialist']),
        authorEmail: 'content@nextintern.com',
        viewCount: randomBetween(50, 500)
      }
    })
  }

  // 17. Create Support Tickets
  console.log('🎫 Creating support tickets...')
  const ticketCategories = ['Technical', 'Account', 'Application', 'Payment', 'General']
  const ticketSubjects = [
    'Unable to upload resume',
    'Application not showing up',
    'Password reset issue',
    'Profile information not saving',
    'Payment gateway error',
    'Company verification pending',
    'Interview link not working',
    'Email notifications not received',
    'Search filters not working',
    'Dashboard loading issues'
  ]
  
  for (let i = 0; i < 25; i++) {
    const user = getRandomElement([...studentUsers, ...companyUsers])
    const category = getRandomElement(ticketCategories)
    const subject = getRandomElement(ticketSubjects)
    const status = getRandomElement(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[])
    const priority = getRandomElement(['LOW', 'MEDIUM', 'HIGH'] as TicketPriority[])
    
    const createdAt = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        description: `I am experiencing an issue with ${subject.toLowerCase()}. This has been happening for the past few days and it's affecting my ability to use the platform effectively. Could you please help resolve this issue?

Steps I've tried:
1. Refreshed the page multiple times
2. Cleared browser cache and cookies
3. Tried using a different browser
4. Checked my internet connection

The issue persists and I would appreciate your assistance in resolving this matter.

Thank you for your time and support.`,
        status,
        priority,
        category,
        response: ['RESOLVED', 'CLOSED'].includes(status) ? `Thank you for reaching out to us regarding ${subject.toLowerCase()}. We have investigated the issue and implemented a fix. 

The problem was related to a recent system update that affected some user accounts. We have now resolved this and your account should be working normally.

If you continue to experience any issues, please don't hesitate to contact us again.

Best regards,
NextIntern Support Team` : null,
        resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? randomDate(createdAt, new Date()) : null,
        createdAt
      }
    })
  }

  console.log('✅ Comprehensive seed data creation completed!')
  console.log('\n📊 Summary:')
  console.log(`• Users: ${await prisma.user.count()}`)
  console.log(`• Students: ${await prisma.student.count()}`)
  console.log(`• Companies: ${await prisma.company.count()}`)
  console.log(`• Categories: ${await prisma.category.count()}`)
  console.log(`• Locations: ${await prisma.location.count()}`)
  console.log(`• Internships: ${await prisma.internship.count()}`)
  console.log(`• Applications: ${await prisma.application.count()}`)
  console.log(`• Skills: ${await prisma.studentSkill.count()} student skills, ${await prisma.internshipSkill.count()} internship skills`)
  console.log(`• Messages: ${await prisma.message.count()}`)
  console.log(`• Saved Internships: ${await prisma.savedInternship.count()}`)
  console.log(`• Certificates: ${await prisma.certificate.count()}`)
  console.log(`• Interviews: ${await prisma.interview.count()}`)
  console.log(`• Notifications: ${await prisma.notification.count()}`)
  console.log(`• Blog Posts: ${await prisma.blogPost.count()}`)
  console.log(`• Support Tickets: ${await prisma.supportTicket.count()}`)
  console.log(`• Internship Views: ${await prisma.internshipView.count()}`)
  console.log(`• Search Queries: ${await prisma.searchQuery.count()}`)
  
  console.log('\n🎉 Database successfully seeded with realistic data!')
  console.log('\nDefault login credentials:')
  console.log('• Admin: admin@nextintern.com / admin123')
  console.log('• Companies: contact@[company-name].com / company123')
  console.log('• Students: [firstname].[lastname][number]@gmail.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })