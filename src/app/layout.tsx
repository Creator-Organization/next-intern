import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, manrope } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'NextIntern - Where Careers Begin',
  description: 'A modern, full-stack internship platform connecting students with companies. Find your perfect internship opportunity today.',
  keywords: ['internships', 'students', 'companies', 'careers', 'jobs'],
  authors: [{ name: 'NextIntern Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className={inter.className}>
        <div id="root" className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}