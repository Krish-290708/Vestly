import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import DisclaimerBanner from '@/components/layout/DisclaimerBanner';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vestly - ESOP Management, Equity Calculator & Research Hub',
  description: 'Manage employee stock option plans, model AMT tax liabilities, track vesting milestones, and explore company valuation insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500 selection:text-slate-950`}>
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
