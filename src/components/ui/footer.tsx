'use client';

import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ArrowRight,
  Building,
  Users,
  Briefcase,
  HelpCircle,
  FileText,
  Shield,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-2xl font-bold font-manrope text-white">
                  Internship And Project
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                Connecting talented students with innovative companies. Build your career, 
                find top talent, and create meaningful internship experiences that shape the future.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <a href="mailto:hello@Internship And Project.com" 
                   className="text-gray-300 hover:text-white transition-colors">
                  hello@Internship And Project.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <a href="tel:+911234567890" 
                   className="text-gray-300 hover:text-white transition-colors">
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">
                  Bangalore, Karnataka, India
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Instagram, href: '#', label: 'Instagram' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* For Students */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-400" />
              <span>For Students</span>
            </h4>
            <nav className="space-y-3">
              {[
                { href: '/internships', label: 'Browse Internships' },
                { href: '/auth/student', label: 'Create Account' },
                { href: '/student/applications', label: 'Track Applications' },
                { href: '/resources', label: 'Career Resources' },
                { href: '/success-stories', label: 'Success Stories' },
                { href: '/help', label: 'Student Help Center' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-300 hover:text-primary-400 transition-colors group"
                >
                  <span className="flex items-center space-x-2">
                    <span>{link.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* For Companies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg flex items-center space-x-2">
              <Building className="w-5 h-5 text-primary-400" />
              <span>For Companies</span>
            </h4>
            <nav className="space-y-3">
              {[
                { href: '/auth/company', label: 'Post Internships' },
                { href: '/pricing', label: 'Pricing Plans' },
                { href: '/companies', label: 'Company Directory' },
                { href: '/company/reports', label: 'Analytics & Reports' },
                { href: '/contact', label: 'Enterprise Solutions' },
                { href: '/help', label: 'Employer Help Center' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-300 hover:text-primary-400 transition-colors group"
                >
                  <span className="flex items-center space-x-2">
                    <span>{link.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Company & Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-lg flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary-400" />
              <span>Company</span>
            </h4>
            <nav className="space-y-3">
              {[
                { href: '/about', label: 'About Internship And Project' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/blog', label: 'Blog & Insights' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/faq', label: 'FAQ' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-300 hover:text-primary-400 transition-colors group"
                >
                  <span className="flex items-center space-x-2">
                    <span>{link.label}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-semibold text-white text-xl mb-2">
                Stay Updated with Internship And Project
              </h4>
              <p className="text-gray-300">
                Get the latest internship opportunities, career tips, and platform updates 
                delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter your email address"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500"
              />
              <Button className="bg-primary-600 hover:bg-primary-700 whitespace-nowrap">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '10,000+', label: 'Active Internships', icon: Briefcase },
              { number: '5,000+', label: 'Verified Companies', icon: Building },
              { number: '100,000+', label: 'Students Registered', icon: Users },
              { number: '85%', label: 'Success Rate', icon: Heart }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white font-manrope">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                © 2025 Internship And Project. All rights reserved.
              </p>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Support
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Made in India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}