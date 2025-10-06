import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/ui/header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not an admin user
  if (!session?.user || session.user.userType !== 'ADMIN') {
    redirect('/');
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