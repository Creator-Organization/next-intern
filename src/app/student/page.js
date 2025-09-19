"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, Briefcase, FileText, User, Settings, Bell, MapPin, Filter, Bookmark, Clock, Wallet, Info, Code, BarChart2, Megaphone, PenTool, Bot, Palette, Building, Tag } from 'lucide-react';

export default function StudentDashboard() {
  const [filter, setFilter] = useState("");

  const internships = [
    { id: 1, title: "Web Development Intern", stipend: "₹8000/month", industry: "IT", location: "Remote", duration: "3 months", keywords: ["HTML", "CSS", "JavaScript", "React"] },
    { id: 2, title: "Data Science Intern", stipend: "₹10,000/month", industry: "Analytics", location: "Remote", duration: "6 months", keywords: ["Python", "Pandas", "NumPy", "SQL"] },
    { id: 3, title: "Marketing Intern", stipend: "₹5000/month", industry: "Marketing", location: "Remote", duration: "3 months", keywords: ["SEO", "Social Media", "Content Marketing"] },
    { id: 4, title: "AI/ML Intern", stipend: "₹12,000/month", industry: "AI", location: "Remote", duration: "6 months", keywords: ["Machine Learning", "TensorFlow", "PyTorch"] },
    { id: 5, title: "UI/UX Design Intern", stipend: "₹7000/month", industry: "Design", location: "Remote", duration: "3 months", keywords: ["Figma", "Adobe XD", "User Research"] },
    { id: 6, title: "Content Writing Intern", stipend: "₹4000/month", industry: "Content", location: "Remote", duration: "3 months", keywords: ["Blogging", "Copywriting", "Creative Writing"] },
    { id: 7, title: "Backend Developer Intern", stipend: "₹9000/month", industry: "IT", location: "Remote", duration: "4 months", keywords: ["Node.js", "Express", "MongoDB", "REST API"] },
    { id: 8, title: "Social Media Marketing", stipend: "₹6000/month", industry: "Marketing", location: "Remote", duration: "2 months", keywords: ["Instagram", "Facebook Ads", "Analytics"] },
    { id: 9, title: "Business Analyst Intern", stipend: "₹11,000/month", industry: "Business", location: "Remote", duration: "5 months", keywords: ["Excel", "Data Analysis", "Market Research"] },
    { id: 10, title: "Graphic Design Intern", stipend: "₹7500/month", industry: "Design", location: "Remote", duration: "3 months", keywords: ["Photoshop", "Illustrator", "Branding"] },
    { id: 11, title: "Cloud Computing Intern", stipend: "₹15,000/month", industry: "IT", location: "Remote", duration: "6 months", keywords: ["AWS", "Azure", "Docker", "Kubernetes"] },
    { id: 12, title: "Human Resources Intern", stipend: "₹5500/month", industry: "HR", location: "Remote", duration: "4 months", keywords: ["Recruitment", "Onboarding", "Employee Relations"] },
  ];

  const filteredInternships = internships.filter((i) => {
    const searchTerm = filter.toLowerCase();
    return (
      i.title.toLowerCase().includes(searchTerm) ||
      i.industry.toLowerCase().includes(searchTerm) ||
      i.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  });

  const getIndustryStyle = (industry) => {
    switch (industry.toLowerCase()) {
      case 'it': return { icon: <Code />, color: 'green' };
      case 'analytics': return { icon: <BarChart2 />, color: 'green' };
      case 'marketing': return { icon: <Megaphone />, color: 'green' };
      case 'ai': return { icon: <Bot />, color: 'green' };
      case 'design': return { icon: <Palette />, color: 'green' };
      case 'content': return { icon: <PenTool />, color: 'green' };
      case 'business': return { icon: <Briefcase />, color: 'green' };
      case 'hr': return { icon: <User />, color: 'green' };
      default: return { icon: <Briefcase />, color: 'green' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black">
            Creator<span className="text-blue-600"> Research</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/login" className="text-black hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-black">Menu</h2>
                <nav className="space-y-2">
                    <Link href="#" className="flex items-center space-x-3 text-blue-600 font-semibold border-l-4 border-blue-600 bg-blue-50 p-3 rounded-r-lg">
                        <Briefcase />
                        <span>All Internships</span>
                    </Link>
                    <Link href="/MyApplication" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                        <FileText />
                        <span>My Applications</span>
                    </Link>
                     <Link href="#" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                        <Bookmark />
                        <span>Saved</span>
                    </Link>
                    <Link href="#" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                        <User />
                        <span>My Profile</span>
                    </Link>
                </nav>
            </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4">
          {/* Welcome & Search */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black">Find Your Next Opportunity</h1>
            <p className="text-gray-700 mb-6">Search from {internships.length} open positions.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by title, industry, or keyword..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-black placeholder-gray-500"
                />
              </div>
              <button className="flex items-center justify-center bg-gray-100 text-black px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Internship Listings */}
          <div className="space-y-4">
            {filteredInternships.length > 0 ? (
              filteredInternships.map((internship) => {
                const industryStyle = getIndustryStyle(internship.industry);
                return (
                  <div key={internship.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                          <h2 className="text-xl font-bold text-black hover:text-blue-600 cursor-pointer">{internship.title}</h2>
                          <span className={`text-sm font-medium mt-1 sm:mt-0 text-${industryStyle.color}-600`}>{internship.industry}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-black my-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{internship.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{internship.duration}</span>
                          </div>
                          <div className="flex items-center font-medium text-green-600">
                            <Wallet className="h-4 w-4 mr-2" />
                            <span>{internship.stipend}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {internship.keywords.map(keyword => (
                            <span key={keyword} className="bg-gray-100 text-black text-xs font-medium px-2.5 py-1 rounded-full">{keyword}</span>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
                          <div className="flex items-center text-xs text-gray-600 mb-4 sm:mb-0">
                            <Info className="h-4 w-4 mr-2"/>
                            <span>Posted 2 days ago</span>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Link href={`/apply/${internship.id}`} className="w-full text-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Apply Now
                            </Link>
                            <button className="p-2 rounded-lg border hover:bg-gray-100">
                               <Bookmark className="text-gray-500 hover:text-blue-600"/>
                            </button>
                          </div>
                        </div>
                      </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <p className="text-black text-lg font-semibold">No internships found.</p>
                <p className="text-gray-700 mt-2">Try adjusting your search terms or removing filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
