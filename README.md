# NextIntern

A modern, full-stack internship platform connecting students with companies. Built with Next.js, TypeScript, and cutting‑edge web technologies.

## ✨ Features

### For Students
- 🔍 Smart Search & Filters — Find internships by skills, location, stipend, and more
- 📱 Responsive Dashboard — Manage applications, track progress, and save favorites
- 💼 Profile Management — Showcase skills, education, and upload resumes
- 📩 Direct Messaging — Communicate with companies through built‑in chat
- 🏆 Certificate Tracking — Document achievements and certifications
- 🎨 Theme Customization — Choose from 3 professional color schemes

### For Companies
- 📝 Easy Job Posting — Create detailed internship listings with requirements
- 👥 Application Management — Review, shortlist, and manage candidates
- 📊 Analytics Dashboard — Track posting performance and candidate metrics
- 🗓️ Interview Scheduling — Built‑in calendar and scheduling system
- 💬 Student Communication — Direct messaging with potential interns
- 🎯 Advanced Filtering — Find the perfect candidates efficiently

### For Admins
- 🛡️ Platform Management — Monitor users, companies, and content
- ✅ Company Verification — Approve and verify legitimate companies
- 📈 System Analytics — Comprehensive platform usage statistics
- 🎫 Support System — Handle user queries and technical issues

## 🛠️ Tech Stack

### Frontend
- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: Custom component library
- Icons: Lucide React
- Fonts: Inter + Manrope (Google Fonts)

### Backend
- API: Next.js API Routes
- Database: NeonDB (Serverless PostgreSQL)
- ORM: Prisma
- Authentication: NextAuth.js
- File Storage: Vercel Blob
- Email: Resend

### Deployment & Tools
- Hosting: Vercel
- Version Control: Git & GitHub
- Code Quality: ESLint + Prettier
- Package Manager: npm

## 🎨 Design System

### Color Themes
- 🌊 Teal‑Cyan Professional (Default) — Fresh and modern
- 🔵 Blue Professional — Classic and trustworthy
- 🟣 Purple‑Indigo Modern — Creative and trendy

### Typography
- Primary: Inter — Clean, readable UI font
- Secondary: Manrope — Distinctive headings and branding

### Design Philosophy
- Minimal and clean interface
- Card‑based information architecture
- Subtle animations and micro‑interactions
- Mobile‑first responsive design
- Accessibility‑focused development

## 📊 Platform Statistics
- 56 Pages — Complete user experience
- 19 Database Tables — Comprehensive data modeling
- 3 User Types — Students, Companies, Admins
- 10+ Core Features — From search to messaging
- 3 Theme Options — Personalized experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- NeonDB account (free tier available)

### Installation
1. Clone the repository  
   ```bash
   git clone https://github.com/YOUR_USERNAME/nextintern.git
   cd nextintern
   ```
2. Install dependencies  
   ```bash
   npm install
   ```
3. Set up environment variables  
   - Copy `.env.example` to `.env.local` and fill in the required values.
4. Set up database  
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Run development server  
   ```bash
   npm run dev
   ```
6. Open in browser  
   - Visit http://localhost:3000

## 📁 Project Structure
```
apps/
  web/                 # Next.js app (App Router)
src/
  app/                 # Routes & layouts
  components/          # UI components
  lib/                 # Utilities
  server/              # API handlers
  styles/              # Tailwind & globals
prisma/
  schema.prisma        # Database schema
  seed.ts              # Seed data
public/                # Static assets
docs/                  # Documentation
```

## 🎯 Key Pages & Routes

### Public Pages
- `/` — Landing page with platform overview
- `/internships` — Browse all internships (public view)
- `/companies` — Featured companies directory
- `/about` — About NextIntern platform

### Authentication
- `/auth/student` — Student login & registration
- `/auth/company` — Company login & registration
- `/auth/recovery` — Password recovery flow

### Student Portal
- `/student` — Dashboard with personalized recommendations
- `/student/browse` — Advanced internship search
- `/student/applications` — Application tracking
- `/student/profile` — Profile management

### Company Portal
- `/company` — Analytics dashboard
- `/company/post` — Create internship postings
- `/company/applications` — Review candidates
- `/company/interviews` — Schedule interviews

### Admin Panel
- `/admin` — Platform overview & metrics
- `/admin/users` — User management
- `/admin/companies` — Company verification

## 🌟 Development Phases
- Foundation (Days 1–3) — Project setup & theme system
- Authentication (Days 4–5) — User login & registration
- Core Pages (Days 6–8) — Main user interfaces
- Backend APIs (Days 9–11) — All server functionality
- Integration (Days 12–13) — Connect frontend & backend
- Advanced Features (Days 14–15) — Polish & remaining pages
- Testing & Polish (Days 16–17) — Optimization & bug fixes
- Deployment (Day 18) — Production launch

## 🔧 Available Scripts
- `dev` — Start the development server
- `build` — Build for production
- `start` — Run the production server
- `lint` — Lint code with ESLint
- `format` — Format code with Prettier
- `prisma:migrate` — Run Prisma migrations
- `prisma:studio` — Open Prisma Studio
- `db:seed` — Seed the database

## 📚 Documentation
- API Documentation: `./docs/api.md`
- Database Schema: `./docs/database.md`
- Component Library: `./docs/components.md`
- Deployment Guide: `./docs/deployment.md`
- Contributing Guidelines: `./CONTRIBUTING.md`

## 🤝 Contributing
We welcome contributions! Please see the Contributing Guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

## 📄 License
This project is licensed under the MIT License — see the `LICENSE` file for details.

## 🙏 Acknowledgments
- Next.js Team — For the amazing framework
- Vercel — For seamless deployment platform
- Tailwind CSS — For the utility‑first CSS framework
- Prisma — For the excellent database toolkit
- All Contributors — For making this project possible

## 📞 Contact & Support
- Website: nextintern.com
- Email: hello@nextintern.com
- GitHub Issues: Report bugs or request features — https://github.com/YOUR_USERNAME/nextintern/issues
- Discussions: Community discussions — https://github.com/YOUR_USERNAME/nextintern/discussions

Built with ❤️ for students and companies worldwide.  
NextIntern — Where careers begin ✨