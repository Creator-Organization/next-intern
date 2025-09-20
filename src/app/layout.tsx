import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { inter, manrope } from '@/lib/fonts';
import { ThemeProvider } from '@/hooks/use-theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextIntern - Where Careers Begin',
  description: 'A modern internship platform connecting candidates with companies and institutes. Find your perfect opportunity today.',
  keywords: ['internships', 'candidates', 'companies', 'institutes', 'careers', 'jobs', 'opportunities'],
  openGraph: {
    title: 'NextIntern - Where Careers Begin',
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
            storageKey="nextintern-theme"
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}