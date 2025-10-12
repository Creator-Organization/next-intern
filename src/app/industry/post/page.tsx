// src/app/industry/post/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/header';
import PostOpportunityForm from '@/components/industry/PostOpportunityForm';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
}

interface PostingLimits {
  INTERNSHIP: number;
  PROJECT: number;
  FREELANCING: number;
}

export default function PostOpportunityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasFetchedData = useRef(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [postingLimits, setPostingLimits] = useState<PostingLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/industry');
    else if (status === 'authenticated' && session?.user?.userType !== 'INDUSTRY') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.industry?.id || hasFetchedData.current) return;
    hasFetchedData.current = true;

    const fetchData = async () => {
      try {
        const [categoriesRes, locationsRes, limitsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/locations'),
          fetch(`/api/industries/${session.user.industry.id}/posting-limits`)
        ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }

        if (locationsRes.ok) {
          const data = await locationsRes.json();
          setLocations(data.locations || []);
        }

        if (limitsRes.ok) {
          const data = await limitsRes.json();
          setPostingLimits(data.limits);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load form data');
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status, session?.user?.industry?.id]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  const isPremium = session?.user?.isPremium || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={session?.user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-manrope">
              Post New Opportunity
            </h1>
            <p className="text-gray-600">
              Create an internship, project, or freelancing opportunity for candidates
            </p>
          </div>

          {/* Premium Upgrade Notice for Free Users */}
          {!isPremium && postingLimits && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Free Account Posting Limits
                  </h3>
                  <div className="space-y-1 text-sm text-purple-700">
                    <p>✅ Internships: {postingLimits.INTERNSHIP} remaining this month</p>
                    <p>✅ Projects: {postingLimits.PROJECT} remaining this month</p>
                    <p>🔒 Freelancing: Premium only</p>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    Limits reset on the 1st of each month
                  </p>
                </div>
                <a href="/industry/billing">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upgrade to Premium
                  </button>
                </a>
              </div>
            </div>
          )}

          {/* Form Component */}
          <PostOpportunityForm
            categories={categories}
            locations={locations}
            isPremium={isPremium}
            postingLimits={postingLimits}
          />
        </div>
      </div>
    </div>
  );
}