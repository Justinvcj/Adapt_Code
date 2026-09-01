import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import { ToastProvider } from '@/components/toast-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'AdaptCode',
  description: 'Master coding challenges, prepare for interviews, and level up your skills.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--tx)] font-[var(--font-sans)] antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
