import type { Metadata } from 'next';
import { inter, manrope } from '@/lib/fonts';
import { ThemeProvider } from '@/hooks/use-theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextIntern - Where Careers Begin',
  description: 'A modern internship platform connecting students with companies. Find your perfect internship opportunity today.',
  keywords: ['internships', 'students', 'companies', 'careers', 'jobs'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="teal"
          storageKey="nextintern-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}