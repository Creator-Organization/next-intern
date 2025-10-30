import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast'; // ✅ Add this import
import { inter, manrope } from '@/lib/fonts';
import { ThemeProvider } from '@/hooks/use-theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Internship And Project - Where Careers Begin',
  description: 'A modern internship platform connecting candidates with companies and institutes. Find your perfect opportunity today.',
  keywords: ['internships', 'candidates', 'companies', 'institutes', 'careers', 'jobs', 'opportunities'],
  openGraph: {
    title: 'Internship And Project - Where Careers Begin',
    description: 'Connect candidates with companies and educational institutes for internships, projects, and freelancing opportunities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            defaultTheme="teal"
            storageKey="Internship And Project-theme"
          >
            {children}
            
            {/* ✅ Add Toaster component here */}
            <Toaster 
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                // Default options
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#1f2937',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                // Success toast style
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#fff',
                    color: '#1f2937',
                  },
                },
                // Error toast style
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#fff',
                    color: '#1f2937',
                  },
                },
                // Loading toast style
                loading: {
                  iconTheme: {
                    primary: '#3B82F6',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}