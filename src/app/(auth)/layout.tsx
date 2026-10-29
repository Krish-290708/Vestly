import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans">
      <header className="h-14 border-b border-rule bg-paper px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" title="Vestly" className="focus:outline-hidden">
          <Logo size="sm" />
        </Link>
        <Link
          href="/"
          className="text-xs text-muted hover:text-ink font-medium transition-colors"
        >
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>

      <footer className="border-t border-rule py-4 px-4 text-center text-[11px] font-mono text-muted bg-paper">
        <span>Vestly is an educational modeling tool · Not tax or financial advice</span>
      </footer>
    </div>
  );
}

