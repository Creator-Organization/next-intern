// src/app/candidate/premium/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Crown, Check, X, Sparkles, Eye, Briefcase, MessageSquare, TrendingUp, Shield, Zap, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import Link from 'next/link';

interface Subscription {
  plan: string;
  status: string;
  endDate: Date | null;
}

const PremiumPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (session?.user?.userType !== 'CANDIDATE') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (status !== 'authenticated' || !session?.user?.id || hasFetchedData.current) return;
      hasFetchedData.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${session.user.id}/subscription`);
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Error:', error);
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, [status, session?.user?.id]);

  const handleUpgrade = (planName: string, price: number) => {
    toast.success(`🎉 ${planName} plan selected! Payment integration coming soon.`, { duration: 5000 });
    console.log(`Selected: ${planName} - ₹${price}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const user = session?.user;

  const features = [
    { icon: Eye, title: 'See Full Company Details', free: false, premium: true, description: 'View complete company names and contact info' },
    { icon: Briefcase, title: 'Access Freelancing Opportunities', free: false, premium: true, description: 'Apply to exclusive freelancing projects' },
    { icon: MessageSquare, title: 'Unlimited Messaging', free: true, premium: true, description: 'Connect with companies about opportunities' },
    { icon: TrendingUp, title: 'Priority in Search Results', free: false, premium: true, description: 'Your profile appears at the top' },
    { icon: Star, title: 'Featured Profile Badge', free: false, premium: true, description: 'Stand out with a premium badge' },
    { icon: Shield, title: 'Enhanced Privacy Controls', free: false, premium: true, description: 'Advanced privacy settings' },
    { icon: Zap, title: 'Early Access to New Features', free: false, premium: true, description: 'Be the first to try new features' },
    { icon: Sparkles, title: 'Dedicated Support', free: false, premium: true, description: 'Priority customer support' }
  ];

  const plans = [
    { name: 'Monthly', price: 299, period: 'month', popular: false, savings: null, features: ['All Premium Features', 'Cancel Anytime', 'Instant Activation'] },
    { name: 'Quarterly', price: 799, period: '3 months', popular: true, savings: '11% off', features: ['All Premium Features', 'Save ₹98', 'Best Value', 'Priority Support'] },
    { name: 'Annual', price: 2999, period: 'year', popular: false, savings: '17% off', features: ['All Premium Features', 'Save ₹589', 'Maximum Savings', 'VIP Support'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user ? { id: user.id, email: user.email || '', userType: user.userType, candidate: user.name ? { firstName: user.name.split(' ')[0] || '', lastName: user.name.split(' ')[1] || '' } : undefined } : undefined} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isPremium && subscription && (
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Crown className="h-8 w-8 text-purple-600 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-purple-900 mb-1">Premium Member</h3>
                    <p className="text-purple-700">You&#39;re enjoying all premium features. {subscription.endDate ? `Renews on ${formatDate(subscription.endDate)}` : 'Subscription is active'}.</p>
                    <p className="text-sm text-purple-600 mt-2">Plan: {subscription.plan} • Status: {subscription.status}</p>
                  </div>
                </div>
                <Link href="/candidate/settings"><Button variant="secondary">Manage Subscription</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-manrope">Unlock Your Full Potential</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get premium access to exclusive opportunities, see full company details, and stand out</p>
        </div>

        <Card className="mb-12">
          <CardHeader><CardTitle className="text-center">Compare Features</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Free</th>
                    <th className="text-center py-4 px-4"><div className="inline-flex items-center gap-2 text-purple-600 font-semibold"><Crown className="h-5 w-5" />Premium</div></th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <feature.icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{feature.title}</p>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">{feature.free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />}</td>
                      <td className="text-center py-4 px-4">{feature.premium ? <Check className="h-5 w-5 text-purple-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {!isPremium && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-manrope">Choose Your Plan</h2>
              <p className="text-gray-600">All plans include access to all premium features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? 'border-2 border-purple-500 shadow-xl scale-105' : 'border border-gray-200'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      {plan.savings && <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full mb-3">{plan.savings}</span>}
                      <div className="flex items-baseline justify-center gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                        <span className="text-gray-600">/ {plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-600">₹{Math.round(plan.price / (plan.period.includes('year') ? 12 : plan.period.includes('3') ? 3 : 1))}/month</p>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-700">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />{feature}
                        </li>
                      ))}
                    </ul>
                    <Button onClick={() => handleUpgrade(plan.name, plan.price)} className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}`}>
                      <Crown className="h-4 w-4 mr-2" />Get {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center font-manrope">What Premium Members Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', role: 'Software Engineer', feedback: 'Premium membership helped me land my dream internship!', rating: 5 },
              { name: 'Rahul Kumar', role: 'Data Science Student', feedback: 'Access to freelancing opportunities has been amazing!', rating: 5 },
              { name: 'Ananya Patel', role: 'Marketing Intern', feedback: 'The priority placement got me noticed by top companies!', rating: 5 }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.feedback}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4><p className="text-gray-600">Yes, you can cancel anytime. You&#39;ll have premium access until the end of your billing period.</p></div>
            <div><h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4><p className="text-gray-600">We accept all major credit/debit cards, UPI, net banking, and digital wallets.</p></div>
            <div><h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4><p className="text-gray-600">We offer a 7-day money-back guarantee. Contact support for a full refund if not satisfied.</p></div>
            <div><h4 className="font-semibold text-gray-900 mb-2">Can I switch plans?</h4><p className="text-gray-600">Yes, you can upgrade or downgrade anytime. Changes take effect at the next billing cycle.</p></div>
          </CardContent>
        </Card>

        {!isPremium && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Upgrade?</h3>
                <p className="text-purple-100 mb-6">Join thousands of premium members getting better opportunities</p>
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100" onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}>
                  <Crown className="h-5 w-5 mr-2" />Start Your Premium Journey
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumPage;