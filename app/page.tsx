"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  MessageSquare,
  Upload,
  Users,
  Briefcase,
  Shield,
  Plus,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  Eye,
  Edit,
  Send,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  X,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
} from "lucide-react"

export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState<
    "overview" | "post-internship" | "post-project" | "applications" | "messages" | "analytics"
  >("overview")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [customDomains, setCustomDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [selectedResumeSections, setSelectedResumeSections] = useState<string[]>([])

  // Mock data for demonstration
  const jobPostings = [
    {
      id: 1,
      title: "Full Stack Developer Intern",
      domain: "Web Development",
      type: "internship",
      applications: 24,
      status: "Active",
      deadline: "2024-02-15",
      stipend: true,
      description:
        "Build modern web applications using React, Node.js, and MongoDB. Work on real-world projects with experienced developers.",
      skills: ["React", "Node.js", "MongoDB", "JavaScript", "Git"],
      duration: "3 months",
      positions: 2,
      benefits: ["Stipend", "Certificate", "Mentorship", "PPO Opportunity"],
      workType: ["Remote", "Flexible Hours"],
    },
    {
      id: 2,
      title: "E-commerce Platform Development",
      domain: "Web Development",
      type: "project",
      applications: 18,
      status: "Active",
      deadline: "2024-02-20",
      paid: true,
      studentsRequired: 3,
      description:
        "Build a complete e-commerce platform with payment integration, inventory management, and admin dashboard.",
      skills: ["React", "Node.js", "MongoDB", "Stripe API", "AWS"],
      duration: "2 months",
      benefits: ["Payment", "Portfolio Project", "Industry Experience"],
      workType: ["Remote", "Flexible Hours"],
    },
    {
      id: 3,
      title: "Mobile App Developer Intern",
      domain: "Mobile Development",
      type: "internship",
      applications: 31,
      status: "Closed",
      deadline: "2024-01-30",
      stipend: false,
      description: "Develop cross-platform mobile applications using Flutter and React Native for iOS and Android.",
      skills: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase"],
      duration: "4 months",
      positions: 3,
      benefits: ["Certificate", "Portfolio Projects"],
      workType: ["On-site", "Standard Hours"],
    },
  ]

  const applications = [
    {
      id: 1,
      candidateId: "Candidate 1",
      role: "Full Stack Developer Intern",
      skills: ["React", "Node.js", "MongoDB"],
      experience: "2 years",
      rating: 4.8,
      status: "Under Review",
      location: "Mumbai, India",
      education: "B.Tech Computer Science",
      portfolio: "github.com/candidate1",
      resumeSections: {
        research: "Published 2 papers on web security and performance optimization",
        achievements: "Winner of National Coding Championship 2023, Dean's List for 3 semesters",
        projects: "Built 5+ full-stack applications including a social media platform with 1000+ users",
        experience: "2 years of freelance web development, internship at tech startup",
        education: "B.Tech Computer Science, CGPA: 9.2/10",
      },
    },
    {
      id: 2,
      candidateId: "Candidate 2",
      role: "AI/ML Research Assistant",
      skills: ["Python", "TensorFlow", "PyTorch"],
      experience: "1.5 years",
      rating: 4.9,
      status: "Shortlisted",
      location: "Bangalore, India",
      education: "M.Tech AI & ML",
      portfolio: "linkedin.com/in/candidate2",
      resumeSections: {
        research: "Co-authored 3 research papers in computer vision, presented at IEEE conference",
        achievements: "Google Summer of Code participant, Best Project Award in ML course",
        projects: "Developed image recognition system with 95% accuracy, chatbot with NLP",
        experience: "Research assistant for 1.5 years, ML engineer intern at AI startup",
        education: "M.Tech AI & ML, CGPA: 9.5/10",
      },
    },
    {
      id: 3,
      candidateId: "Candidate 3",
      role: "Mobile App Developer",
      skills: ["Flutter", "React Native", "Kotlin"],
      experience: "3 years",
      rating: 4.7,
      status: "Interview Scheduled",
      location: "Delhi, India",
      education: "B.E. Software Engineering",
      portfolio: "candidate3.dev",
      resumeSections: {
        research: "Research on mobile app performance optimization techniques",
        achievements: "Published 2 mobile apps with 10K+ downloads, Hackathon winner",
        projects: "Built 8+ mobile applications, including fitness tracker and e-learning app",
        experience: "3 years mobile development experience, team lead at mobile app company",
        education: "B.E. Software Engineering, CGPA: 8.8/10",
      },
    },
  ]

  const notifications = [
    {
      id: 1,
      message: "New application received for Full Stack Developer position",
      time: "2 hours ago",
      type: "application",
    },
    { id: 2, message: "Interview scheduled with Candidate 3", time: "4 hours ago", type: "interview" },
    { id: 3, message: "Application deadline approaching for AI/ML position", time: "1 day ago", type: "deadline" },
  ]

  const engineeringDomains = [
    "Software Engineering",
    "Web Development",
    "Mobile App Development",
    "Data Science & Analytics",
    "AI/Machine Learning",
    "DevOps & Cloud",
    "Cybersecurity",
    "Blockchain Development",
    "Game Development",
    "Embedded Systems",
    "IoT Development",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Network Engineering",
    ...customDomains,
  ]

  const resumeSectionOptions = [
    "Research",
    "Achievements",
    "Prior Projects",
    "Work Experience",
    "Education",
    "Certifications",
    "Publications",
    "Skills Assessment",
    "Leadership Experience",
    "Extracurricular Activities",
  ]

  const handleQuickPostJob = () => {
    setActiveSection("post-internship")
  }

  const handleViewJob = (job: any) => {
    setSelectedJob(job)
    setShowJobDetails(true)
  }

  const handleEditJob = (job: any) => {
    setSelectedJob(job)
    if (job.type === "internship") {
      setActiveSection("post-internship")
    } else {
      setActiveSection("post-project")
    }
  }

  const addCustomDomain = () => {
    if (newDomain.trim() && !customDomains.includes(newDomain.trim())) {
      setCustomDomains([...customDomains, newDomain.trim()])
      setNewDomain("")
    }
  }

  const removeCustomDomain = (domain: string) => {
    setCustomDomains(customDomains.filter((d) => d !== domain))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-green-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Creators Research Pvt Ltd</h1>
                <p className="text-sm text-gray-600">Company Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>Recent updates and alerts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Company Settings</DialogTitle>
                    <DialogDescription>Manage your company profile and preferences</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      <TabsTrigger value="privacy">Privacy</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input defaultValue="Creators Research Pvt Ltd" />
                      </div>
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Input defaultValue="Technology & Research" />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input defaultValue="https://creatorsresearch.com" />
                      </div>
                    </TabsContent>
                    <TabsContent value="notifications" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Email notifications for new applications</Label>
                        <Checkbox defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>SMS alerts for urgent updates</Label>
                        <Checkbox />
                      </div>
                    </TabsContent>
                    <TabsContent value="privacy" className="space-y-4">
                      <p className="text-sm text-gray-600">
                        All communications with students must occur through the Creators Research platform for privacy
                        and security.
                      </p>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  <Button
                    variant={activeSection === "overview" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "overview" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("overview")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Overview
                  </Button>
                  <Button
                    variant={activeSection === "post-internship" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "post-internship" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("post-internship")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post Internship
                  </Button>
                  <Button
                    variant={activeSection === "post-project" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "post-project" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("post-project")}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Project
                  </Button>
                  <Button
                    variant={activeSection === "applications" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "applications" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("applications")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Applications
                  </Button>
                  <Button
                    variant={activeSection === "messages" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "messages" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("messages")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    variant={activeSection === "analytics" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeSection === "analytics" ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    onClick={() => setActiveSection("analytics")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </nav>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 bg-gradient-to-r from-teal-600 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">73</div>
                    <div className="text-sm opacity-90">Total Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm opacity-90">Active Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm opacity-90">Interviews Scheduled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-white/70 backdrop-blur-sm border-teal-100">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent hover:bg-teal-50"
                  onClick={() => setActiveSection("post-internship")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Internship
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent hover:bg-teal-50"
                  onClick={() => setActiveSection("post-project")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent hover:bg-teal-50"
                  onClick={() => setActiveSection("applications")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Review Applications
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent hover:bg-teal-50"
                  onClick={() => setActiveSection("messages")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check Messages
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <div className="flex gap-2">
                    <Button
                      className="bg-gradient-to-r from-teal-600 to-green-600"
                      onClick={() => setActiveSection("post-internship")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post Internship
                    </Button>
                    <Button variant="outline" onClick={() => setActiveSection("post-project")}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Post Project
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card
                    className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("post-internship")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Internships</p>
                          <p className="text-2xl font-bold text-gray-900">2</p>
                          <p className="text-xs text-green-600">+1 this week</p>
                        </div>
                        <Plus className="h-8 w-8 text-teal-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("post-project")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Active Projects</p>
                          <p className="text-2xl font-bold text-gray-900">1</p>
                          <p className="text-xs text-blue-600">New this week</p>
                        </div>
                        <Briefcase className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("applications")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">New Applications</p>
                          <p className="text-2xl font-bold text-gray-900">18</p>
                          <p className="text-xs text-teal-600">+5 today</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Job Postings */}
                <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                  <CardHeader>
                    <CardTitle>Your Opportunities</CardTitle>
                    <CardDescription>Manage and track your active internships and projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobPostings.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{job.title}</h3>
                              <Badge variant={job.type === "internship" ? "default" : "secondary"} className="text-xs">
                                {job.type === "internship" ? "Internship" : "Project"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{job.domain}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {job.applications} applications
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Deadline: {job.deadline}
                              </span>
                              {(job.stipend || job.paid) && (
                                <Badge variant="secondary" className="text-xs">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {job.type === "internship" ? "Stipend" : "Paid"}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.status === "Active" ? "default" : "secondary"}>{job.status}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleViewJob(job)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditJob(job)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm">New application from Candidate 1</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm">Interview scheduled with Candidate 3</p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                        <Zap className="h-5 w-5 text-teal-600" />
                        <div className="flex-1">
                          <p className="text-sm">E-commerce Platform Development project posted successfully</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "post-internship" && (
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-600" />
                    Post New Internship Opportunity
                  </CardTitle>
                  <CardDescription>
                    Create a detailed internship posting to attract talented engineering students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Manage Engineering Domains</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add custom engineering domain..."
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCustomDomain()}
                      />
                      <Button onClick={addCustomDomain} size="sm">
                        Add
                      </Button>
                    </div>
                    {customDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customDomains.map((domain) => (
                          <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                            {domain}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomDomain(domain)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internship-title">Internship Title *</Label>
                      <Input id="internship-title" placeholder="e.g., Full Stack Developer Intern" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Engineering Domain *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select engineering domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {engineeringDomains.map((domain) => (
                            <SelectItem key={domain} value={domain.toLowerCase().replace(/\s+/g, "-")}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Technical Skills *</Label>
                    <Input id="skills" placeholder="e.g., React, Node.js, Python, MongoDB, AWS, Docker" />
                    <p className="text-xs text-gray-500">Separate skills with commas</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="period">Internship Duration *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="2-months">2 Months</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="flexible">Flexible Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline *</Label>
                      <Input id="deadline" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="positions">Number of Positions</Label>
                      <Input id="positions" type="number" placeholder="1" min="1" />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold">Student Resume Sections to View</h3>
                    <p className="text-sm text-gray-600">
                      Select which sections of student resumes you want to see to maintain their privacy
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {resumeSectionOptions.map((section) => (
                        <div key={section} className="flex items-center space-x-2">
                          <Checkbox
                            id={section}
                            checked={selectedResumeSections.includes(section)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedResumeSections([...selectedResumeSections, section])
                              } else {
                                setSelectedResumeSections(selectedResumeSections.filter((s) => s !== section))
                              }
                            }}
                          />
                          <Label htmlFor={section} className="text-sm">
                            {section}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Internship Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the internship, key responsibilities, learning outcomes, and what makes this opportunity exciting for engineering students..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Compensation & Benefits</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="stipend" />
                          <Label htmlFor="stipend">Stipend Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ppo" />
                          <Label htmlFor="ppo">PPO/Full-time Offer Opportunity</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="certificate" />
                          <Label htmlFor="certificate">Completion Certificate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mentorship" />
                          <Label htmlFor="mentorship">1-on-1 Mentorship</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="offer-letter" />
                          <Label htmlFor="offer-letter">Offer Letter Provided</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Work Arrangement</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remote" />
                          <Label htmlFor="remote">Remote Work Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="hybrid" />
                          <Label htmlFor="hybrid">Hybrid Work Model</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="flexible-hours" />
                          <Label htmlFor="flexible-hours">Flexible Working Hours</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      Offer Letter & Social Sharing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="offer-conditions">Offer Letter Conditions</Label>
                        <Textarea
                          id="offer-conditions"
                          placeholder="Specify conditions for offer letter (e.g., completion requirements, performance criteria...)"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social-links">Social Media Links for Sharing</Label>
                        <Input id="social-links" placeholder="LinkedIn, Twitter, Company website..." />
                        <p className="text-xs text-gray-500">Links where students can share their offer letters</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nda-upload">NDA Document (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="nda-upload" type="file" accept=".pdf" className="flex-1" />
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Upload if students need to sign an NDA</p>
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-gradient-to-r from-teal-600 to-green-600" size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Internship Opportunity
                    </Button>
                    <Button variant="outline" size="lg">
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "post-project" && (
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Post New Project Opportunity
                  </CardTitle>
                  <CardDescription>
                    Create a project posting for students to work on real-world engineering challenges
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Manage Engineering Domains</h3>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add custom engineering domain..."
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCustomDomain()}
                      />
                      <Button onClick={addCustomDomain} size="sm">
                        Add
                      </Button>
                    </div>
                    {customDomains.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customDomains.map((domain) => (
                          <Badge key={domain} variant="secondary" className="flex items-center gap-1">
                            {domain}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeCustomDomain(domain)} />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-title">Project Title *</Label>
                      <Input id="project-title" placeholder="e.g., E-commerce Platform Development" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-domain">Engineering Domain *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select engineering domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {engineeringDomains.map((domain) => (
                            <SelectItem key={domain} value={domain.toLowerCase().replace(/\s+/g, "-")}>
                              {domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="students-required">Students Required *</Label>
                      <Input id="students-required" type="number" placeholder="3" min="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-duration">Project Duration *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2-weeks">2 Weeks</SelectItem>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="2-months">2 Months</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="flexible">Flexible Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-skills">Required Technical Skills *</Label>
                    <Input id="project-skills" placeholder="e.g., React, Node.js, MongoDB, Stripe API, AWS" />
                    <p className="text-xs text-gray-500">Separate skills with commas</p>
                  </div>

                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold">Student Resume Sections to View</h3>
                    <p className="text-sm text-gray-600">
                      Select which sections of student resumes you want to see to maintain their privacy
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {resumeSectionOptions.map((section) => (
                        <div key={section} className="flex items-center space-x-2">
                          <Checkbox
                            id={`project-${section}`}
                            checked={selectedResumeSections.includes(section)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedResumeSections([...selectedResumeSections, section])
                              } else {
                                setSelectedResumeSections(selectedResumeSections.filter((s) => s !== section))
                              }
                            }}
                          />
                          <Label htmlFor={`project-${section}`} className="text-sm">
                            {section}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">Project Description *</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe the project goals, deliverables, technologies to be used, and learning outcomes for students..."
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Project Compensation</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="paid-project" />
                          <Label htmlFor="paid-project">This is a Paid Project</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="project-certificate" />
                          <Label htmlFor="project-certificate">Completion Certificate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="project-mentorship" />
                          <Label htmlFor="project-mentorship">Technical Mentorship</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="project-recommendation" />
                          <Label htmlFor="project-recommendation">LinkedIn Recommendation</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Project Details</h3>
                      <div className="space-y-2">
                        <Label htmlFor="project-deadline">Project Deadline *</Label>
                        <Input id="project-deadline" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-budget">Budget (if paid)</Label>
                        <Input id="project-budget" placeholder="₹50,000" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-nda">NDA Document (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="project-nda" type="file" accept=".pdf" className="flex-1" />
                      <Upload className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Upload if students need to sign an NDA for this project</p>
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex-1 bg-gradient-to-r from-green-600 to-teal-600" size="lg">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Post Project Opportunity
                    </Button>
                    <Button variant="outline" size="lg">
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applications Section */}
            {activeSection === "applications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Student Applications</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card
                      key={application.id}
                      className="bg-white/70 backdrop-blur-sm border-teal-100 hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`/placeholder.svg?height=48&width=48&query=professional-avatar`} />
                              <AvatarFallback>{application.candidateId.split(" ").slice(-1)[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{application.candidateId}</h3>
                              <p className="text-sm text-gray-600">{application.role}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm">{application.rating}</span>
                                </div>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {application.location}
                                </span>
                                <span className="text-sm text-gray-500">• {application.experience} experience</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{application.education}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {application.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              {selectedResumeSections.length > 0 && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <h4 className="font-semibold text-sm mb-2">Selected Resume Information:</h4>
                                  <div className="space-y-2">
                                    {selectedResumeSections.map((section) => (
                                      <div key={section}>
                                        <span className="font-medium text-xs text-gray-700">{section}:</span>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {application.resumeSections[section.toLowerCase().replace(/\s+/g, "")] ||
                                            "Information not available"}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                application.status === "Shortlisted"
                                  ? "default"
                                  : application.status === "Interview Scheduled"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(application.candidateId)
                                setActiveSection("messages")
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Section */}
            {activeSection === "messages" && (
              <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-teal-600" />
                    Student Communications
                  </CardTitle>
                  <CardDescription>Secure messaging with interested students through our platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">Active Conversations</h3>
                      {applications.slice(0, 3).map((student) => (
                        <div
                          key={student.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedStudent === student.candidateId
                              ? "bg-teal-50 border-teal-200"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedStudent(student.candidateId)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {student.candidateId.split(" ").slice(-1)[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{student.candidateId}</p>
                              <p className="text-xs text-gray-500 truncate">{student.role}</p>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2">
                      {selectedStudent ? (
                        <div className="border border-teal-100 rounded-lg bg-white">
                          <div className="p-4 border-b border-teal-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {selectedStudent.split(" ").slice(-1)[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm">{selectedStudent}</p>
                                  <p className="text-xs text-gray-500">Online now</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 space-y-4 h-64 overflow-y-auto">
                            <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                              <p className="text-sm">
                                Hi! I'm very interested in the Full Stack Developer position. I have experience with
                                React and Node.js.
                              </p>
                              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                            </div>

                            <div className="bg-teal-100 p-3 rounded-lg max-w-xs ml-auto">
                              <p className="text-sm">
                                Hello! Thank you for your interest. Could you share some of your recent projects?
                              </p>
                              <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                            </div>

                            <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                              <p className="text-sm">
                                I've built an e-commerce platform and a task management app. I can share the GitHub
                                links if you'd like.
                              </p>
                              <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
                            </div>

                            <div className="bg-teal-100 p-3 rounded-lg max-w-xs ml-auto">
                              <p className="text-sm">
                                That sounds great! Please share your GitHub profile. Also, are you available for a quick
                                technical discussion this week?
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Just now</p>
                            </div>
                          </div>

                          <div className="p-4 border-t border-teal-100">
                            <div className="flex gap-2">
                              <Input placeholder="Type your message..." className="flex-1" />
                              <Button size="sm" className="bg-gradient-to-r from-teal-600 to-green-600">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-teal-100 rounded-lg bg-white p-8 text-center">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-teal-700">
                      <Shield className="h-4 w-4" />
                      <span>
                        <strong>Privacy Notice:</strong> All communications must occur through the Creators Research
                        platform. Direct contact outside this platform is prohibited to ensure student privacy and
                        security.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Section */}
            {activeSection === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Total Views</p>
                          <p className="text-2xl font-bold">1,247</p>
                        </div>
                        <Eye className="h-8 w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Applications</p>
                          <p className="text-2xl font-bold">73</p>
                        </div>
                        <Users className="h-8 w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Interviews</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                        <Calendar className="h-8 w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Hired</p>
                          <p className="text-2xl font-bold">8</p>
                        </div>
                        <CheckCircle className="h-8 w-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                    <CardHeader>
                      <CardTitle>Application Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>This Week</span>
                          <span className="font-bold text-green-600">+24 applications</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Response Rate</span>
                          <span className="font-bold">94%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Average Rating</span>
                          <span className="font-bold">4.7/5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Time to Hire</span>
                          <span className="font-bold">12 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/70 backdrop-blur-sm border-teal-100">
                    <CardHeader>
                      <CardTitle>Top Skills in Demand</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["React", "Python", "Node.js", "AWS", "MongoDB"].map((skill, index) => (
                          <div key={skill} className="flex items-center gap-3">
                            <span className="text-sm w-16">{skill}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-teal-600 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${90 - index * 15}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{90 - index * 15}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>{selectedJob?.domain}</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <p className="text-sm">{selectedJob.duration}</p>
                </div>
                <div>
                  <Label>{selectedJob.type === "internship" ? "Positions" : "Students Required"}</Label>
                  <p className="text-sm">{selectedJob.positions || selectedJob.studentsRequired}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">{selectedJob.description}</p>
              </div>
              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedJob.skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Benefits</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedJob.benefits?.map((benefit: string) => (
                    <Badge key={benefit} variant="outline">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
