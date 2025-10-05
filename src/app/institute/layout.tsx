import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/ui/header';

export default async function InstituteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not an institute user
  if (!session?.user || session.user.userType !== 'INSTITUTE') {
    redirect('/auth/signin?userType=institute');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={{
          id: session.user.id,
          email: session.user.email || '',
          userType: session.user.userType
        }} 
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}