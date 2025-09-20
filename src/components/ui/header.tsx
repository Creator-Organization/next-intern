'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Building, 
  School,
  ChevronDown, 
  LogOut, 
  Settings, 
  Briefcase, 
  Heart, 
  FileText,
  HelpCircle,
  Phone,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email: string;
  userType: 'CANDIDATE' | 'INDUSTRY' | 'INSTITUTE' | 'ADMIN';
  candidate?: { firstName: string; lastName: string; };
  industry?: { companyName: string; };
  institute?: { instituteName: string; };
}

interface HeaderProps {
  user?: User;
}

export function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  // Navigation items for different user types
  const getNavigationItems = () => {
    if (!user) {
      return [
        { href: '/', label: 'Home', active: pathname === '/' },
        { href: '/opportunities', label: 'Browse Opportunities', active: pathname === '/opportunities' },
        { href: '/industries', label: 'Companies', active: pathname === '/industries' },
        { href: '/institutes', label: 'Institutes', active: pathname === '/institutes' },
        { href: '/about', label: 'About', active: pathname === '/about' },
        { href: '/pricing', label: 'Pricing', active: pathname === '/pricing' },
        { href: '/contact', label: 'Contact', active: pathname === '/contact' }
      ];
    }

    if (user.userType === 'CANDIDATE') {
      return [
        { href: '/candidate', label: 'Dashboard', active: pathname === '/candidate' },
        { href: '/candidate/browse', label: 'Browse Opportunities', active: pathname.startsWith('/candidate/browse') },
        { href: '/candidate/applications', label: 'My Applications', active: pathname.startsWith('/candidate/applications') },
        { href: '/candidate/saved', label: 'Saved', active: pathname.startsWith('/candidate/saved') },
        { href: '/candidate/messages', label: 'Messages', active: pathname.startsWith('/candidate/messages') }
      ];
    }

    if (user.userType === 'INDUSTRY') {
      return [
        { href: '/industry', label: 'Dashboard', active: pathname === '/industry' },
        { href: '/industry/post', label: 'Post Opportunity', active: pathname === '/industry/post' },
        { href: '/industry/opportunities', label: 'Manage Opportunities', active: pathname.startsWith('/industry/opportunities') },
        { href: '/industry/applications', label: 'Applications', active: pathname.startsWith('/industry/applications') },
        { href: '/industry/messages', label: 'Messages', active: pathname.startsWith('/industry/messages') }
      ];
    }

    if (user.userType === 'INSTITUTE') {
      return [
        { href: '/institute', label: 'Dashboard', active: pathname === '/institute' },
        { href: '/institute/students', label: 'Students', active: pathname.startsWith('/institute/students') },
        { href: '/institute/programs', label: 'Programs', active: pathname.startsWith('/institute/programs') },
        { href: '/institute/reports', label: 'Reports', active: pathname.startsWith('/institute/reports') },
        { href: '/institute/messages', label: 'Messages', active: pathname.startsWith('/institute/messages') }
      ];
    }

    if (user.userType === 'ADMIN') {
      return [
        { href: '/admin', label: 'Dashboard', active: pathname === '/admin' },
        { href: '/admin/users', label: 'Users', active: pathname.startsWith('/admin/users') },
        { href: '/admin/opportunities', label: 'Opportunities', active: pathname.startsWith('/admin/opportunities') },
        { href: '/admin/analytics', label: 'Analytics', active: pathname.startsWith('/admin/analytics') },
        { href: '/admin/settings', label: 'Settings', active: pathname.startsWith('/admin/settings') }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  // User display name
  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.candidate) {
      return `${user.candidate.firstName} ${user.candidate.lastName}`;
    }
    if (user.industry) {
      return user.industry.companyName;
    }
    if (user.institute) {
      return user.institute.instituteName;
    }
    return user.email;
  };

  // User profile dropdown items
  const getProfileDropdownItems = () => {
    if (!user) return [];

    const profilePath = {
      'CANDIDATE': '/candidate/profile',
      'INDUSTRY': '/industry/profile',
      'INSTITUTE': '/institute/profile',
      'ADMIN': '/admin/profile'
    }[user.userType];

    const settingsPath = {
      'CANDIDATE': '/candidate/settings',
      'INDUSTRY': '/industry/settings',
      'INSTITUTE': '/institute/settings',
      'ADMIN': '/admin/settings'
    }[user.userType];

    const baseItems = [
      { 
        href: profilePath, 
        label: 'Profile', 
        icon: User 
      },
      { 
        href: settingsPath, 
        label: 'Settings', 
        icon: Settings 
      }
    ];

    // Add user type specific items
    if (user.userType === 'CANDIDATE') {
      baseItems.unshift(
        { href: '/candidate/certificates', label: 'Certificates', icon: FileText }
      );
    }

    if (user.userType === 'INDUSTRY') {
      baseItems.unshift(
        { href: '/industry/billing', label: 'Billing', icon: Briefcase },
        { href: '/industry/reports', label: 'Reports', icon: FileText }
      );
    }

    if (user.userType === 'INSTITUTE') {
      baseItems.unshift(
        { href: '/institute/billing', label: 'Subscription', icon: Briefcase },
        { href: '/institute/analytics', label: 'Analytics', icon: FileText }
      );
    }

    if (user.userType === 'ADMIN') {
      baseItems.unshift(
        { href: '/admin/system', label: 'System Health', icon: Shield }
      );
    }

    return baseItems;
  };

  // Get dashboard URL based on user type
  const getDashboardUrl = () => {
    if (!user) return '/';
    const dashboardMap = {
      'CANDIDATE': '/candidate',
      'INDUSTRY': '/industry',
      'INSTITUTE': '/institute',
      'ADMIN': '/admin'
    };
    return dashboardMap[user.userType] || '/';
  };

  // Get user type display label
  const getUserTypeLabel = () => {
    const labelMap = {
      'CANDIDATE': 'Candidate',
      'INDUSTRY': 'Company',
      'INSTITUTE': 'Institute',
      'ADMIN': 'Admin'
    };
    return user ? labelMap[user.userType] || 'User' : '';
  };

  // Get user avatar letter
  const getUserAvatarLetter = () => {
    if (!user) return 'U';
    if (user.candidate) return user.candidate.firstName[0];
    if (user.industry) return user.industry.companyName[0];
    if (user.institute) return user.institute.instituteName[0];
    return user.email[0].toUpperCase();
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-gray-200' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href={getDashboardUrl()} 
                  className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-2xl font-bold font-manrope text-primary-600 hover:text-primary-700 transition-colors">
                NextIntern
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-100 border border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Search (for authenticated users) */}
            {user && (
              <button className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-primary-200 transition-all group">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                <span className="text-sm text-gray-500 group-hover:text-primary-600">Search...</span>
              </button>
            )}

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-primary-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {getUserAvatarLetter()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getUserTypeLabel()}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>

                      {/* Menu Items */}
                      {getProfileDropdownItems().map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      
                      {/* Help & Support */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          href="/help"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center space-x-3">
                <Link href="/help">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 hover:bg-primary-50">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="secondary" size="sm" className="hover:border-primary-200 hover:bg-primary-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            {!user && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link href="/auth/signin" className="block">
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}