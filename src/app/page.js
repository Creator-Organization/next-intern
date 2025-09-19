"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Briefcase, Building, Search, Zap, Users, BarChart } from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const featuredInternships = [
    { title: "Software Engineer Intern", location: "Remote" },
    { title: "Marketing Intern", location: "Remote" },
    { title: "Product Design Intern", location: "Remote" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Creator <span className="text-blue-600">Research</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#for-students" className="text-gray-600 hover:text-blue-600 transition-colors">For Students</Link>
            <Link href="#for-companies" className="text-gray-600 hover:text-blue-600 transition-colors">For Companies</Link>
          </nav>
          <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors hidden md:flex">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          Find Your Dream Internship.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Connect with top companies and kickstart your career with the perfect internship opportunity.
        </p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for internships (e.g., 'Software Engineer')"
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </main>

      {/* Featured Internships */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Internships</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredInternships.map((internship, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                <p className="text-gray-600 mb-1">{internship.company}</p>
                <p className="text-gray-500 text-sm mb-4">{internship.location}</p>
                <Link href="#" className="text-blue-600 font-semibold hover:underline flex items-center">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students & Companies */}
      <section className="py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div id="for-students" className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center text-blue-600 mb-4">
              <Users className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">For Students</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Browse thousands of internships, apply with one click, and manage all your applications in a personalized dashboard.
            </p>
            <Link href="/student" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Student Dashboard
            </Link>
          </div>
          <div id="for-companies" className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center text-gray-800 mb-4">
              <Building className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">For Companies</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Post internship opportunities, reach a vast pool of talented students, and manage your recruitment pipeline efficiently.
            </p>
            <Link href="/company" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
              Company Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Creator Research?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <Briefcase className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vast Opportunities</h3>
              <p className="text-gray-600">Access a wide range of internships from startups to Fortune 500 companies.</p>
            </div>
            <div className="p-4">
              <Zap className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
              <p className="text-gray-600">Apply to internships with a single click and track your progress effortlessly.</p>
            </div>
            <div className="p-4">
              <BarChart className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-gray-600">Gain valuable experience and build your professional network for future success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Creator Research. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
