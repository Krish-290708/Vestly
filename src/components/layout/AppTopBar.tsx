'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronRight,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface AppTopBarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export function AppTopBar({ onOpenSearch, onOpenMobileMenu }: AppTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync theme
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

  // Fetch current user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Non-blocking
    }
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') {
      return [{ label: 'Overview', href: '/dashboard' }];
    }

    const items: Array<{ label: string; href: string }> = [];

    if (
      ['grants', 'calculator', 'scenarios', 'actions', 'reports'].includes(segments[0])
    ) {
      items.push({ label: 'Your equity', href: '/dashboard' });
      const map: Record<string, string> = {
        grants: 'Grants',
        calculator: 'Calculator',
        scenarios: 'Scenarios & 83(b)',
        actions: 'Actions',
        reports: 'Reports',
      };
      items.push({ label: map[segments[0]] || segments[0], href: `/${segments[0]}` });
    } else if (segments[0] === 'research') {
      items.push({ label: 'Research', href: '/research/market' });
      const map: Record<string, string> = {
        market: 'Market overview',
        companies: 'Company explorer',
        news: 'Market news',
        watchlist: 'Watchlist',
      };
      if (segments[1]) {
        items.push({ label: map[segments[1]] || segments[1], href: pathname });
      }
    } else if (segments[0] === 'pool') {
      items.push({ label: 'Research', href: '/research/market' });
      items.push({ label: 'Company ESOP pool', href: '/pool' });
    } else if (segments[0] === 'learn') {
      items.push({ label: 'Learn', href: '/learn' });
    } else if (segments[0] === 'settings') {
      items.push({ label: 'Settings', href: '/settings' });
    } else {
      items.push({ label: segments[0], href: `/${segments[0]}` });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 border-b border-rule bg-paper px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-1.5 rounded-xs text-muted hover:text-ink hover:bg-sunk transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-sans">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted/60 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-ink truncate">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-muted hover:text-ink transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search + Theme + User Menu */}
      <div className="flex items-center gap-2">
        {/* Search trigger button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted hover:text-ink border border-rule rounded-xs bg-surface hover:bg-sunk/40 transition-colors shadow-2xs font-sans"
          aria-label="Search or jump to"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Search...</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 border border-rule/80 rounded-2xs bg-paper text-muted/80">
            Ctrl K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="sm:hidden p-2 text-muted hover:text-ink rounded-xs hover:bg-sunk transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
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

        {/* User Account Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            aria-label="User account menu"
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xs hover:bg-sunk transition-colors border border-transparent hover:border-rule"
          >
            <div className="w-6 h-6 rounded-xs bg-sunk border border-rule flex items-center justify-center text-[11px] font-mono font-semibold text-accent uppercase">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="hidden lg:inline-block text-xs font-medium text-ink max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-56 rounded-xs bg-surface border border-rule shadow-md p-1 space-y-1 text-xs text-ink z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-2 border-b border-rule/60">
                <p className="font-semibold text-ink truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-muted truncate">{user?.email || ''}</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                role="menuitem"
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xs text-muted hover:text-ink hover:bg-sunk transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-muted" />
                <span>Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-2xs text-loss hover:bg-loss/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppTopBar;

