'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function PublicHeader() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(current === 'dark' ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('vestly_theme', next);
  };

  const handleDemoLogin = async () => {
    try {
      setLoadingDemo(true);
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <header className="h-14 border-b border-rule bg-paper px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-6 sm:gap-8">
        <Link href="/" className="flex items-center gap-2 focus:outline-hidden" title="Vestly">
          <Logo size="sm" />
        </Link>

        <nav className="hidden sm:flex items-center gap-4 text-xs font-sans text-muted">
          <Link href="/learn" className="hover:text-ink transition-colors">
            Learn
          </Link>
          <Link href="/research/market" className="hover:text-ink transition-colors">
            Research
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2.5 text-xs font-sans">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light paper theme' : 'Switch to dark ledger theme'}
          title={theme === 'dark' ? 'Light paper theme' : 'Dark ledger theme'}
          className="p-1.5 rounded-xs text-muted hover:text-ink hover:bg-sunk transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warn" />
          ) : (
            <Moon className="w-4 h-4 text-muted" />
          )}
        </button>

        <Link
          href="/login"
          className="px-2.5 py-1.5 rounded-xs text-ink hover:bg-sunk transition-colors font-medium"
        >
          Sign in
        </Link>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loadingDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-accent text-paper font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-2xs"
        >
          <span>{loadingDemo ? 'Loading...' : 'Try with sample data'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

export default PublicHeader;

