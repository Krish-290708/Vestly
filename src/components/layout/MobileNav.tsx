'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PieChart,
  Layers,
  Calculator,
  CheckSquare,
  Menu,
  X,
  FileText,
  GitFork,
  TrendingUp,
  Building2,
  Newspaper,
  Bookmark,
  BookOpen,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useGrant } from '@/contexts/GrantContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function MobileNav({ isOpen, onClose, onOpen }: MobileNavProps) {
  const pathname = usePathname();
  const grantCtx = useGrant();

  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/actions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.reminders) {
          const pending = data.reminders.filter((rem: any) => rem.status === 'PENDING').length;
          setPendingCount(pending);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Close drawer on path change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const bottomTabs = [
    { label: 'Overview', href: '/dashboard', icon: PieChart },
    { label: 'Grants', href: '/grants', icon: Layers, carryGrant: true },
    { label: 'Calculator', href: '/calculator', icon: Calculator, carryGrant: true },
    {
      label: 'Actions',
      href: '/actions',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { label: 'More', isMore: true, icon: Menu },
  ];

  return (
    <>
      {/* Slide-over Drawer for Mobile */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          className="fixed inset-0 z-50 md:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer container */}
          <div className="relative w-4/5 max-w-xs bg-paper border-r border-rule h-full flex flex-col p-4 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-rule">
              <Logo size="sm" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="p-1 rounded-xs text-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold px-2">
                  Your equity
                </span>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <PieChart className="w-4 h-4 text-accent" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/grants"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <Layers className="w-4 h-4 text-muted" />
                    <span>Grants</span>
                  </Link>
                  <Link
                    href="/calculator"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <Calculator className="w-4 h-4 text-muted" />
                    <span>Calculator</span>
                  </Link>
                  <Link
                    href="/scenarios"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <GitFork className="w-4 h-4 text-muted" />
                    <span>Scenarios & 83(b)</span>
                  </Link>
                  <Link
                    href="/actions"
                    className="flex items-center justify-between px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-muted" />
                      <span>Actions</span>
                    </div>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-xs bg-warn/15 text-warn border border-warn/30">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <FileText className="w-4 h-4 text-muted" />
                    <span>Reports</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold px-2">
                  Research
                </span>
                <div className="space-y-0.5">
                  <Link
                    href="/research/market"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <TrendingUp className="w-4 h-4 text-muted" />
                    <span>Markets</span>
                  </Link>
                  <Link
                    href="/research/companies"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <Building2 className="w-4 h-4 text-muted" />
                    <span>Companies</span>
                  </Link>
                  <Link
                    href="/research/news"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <Newspaper className="w-4 h-4 text-muted" />
                    <span>News</span>
                  </Link>
                  <Link
                    href="/research/watchlist"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <Bookmark className="w-4 h-4 text-muted" />
                    <span>Watchlist</span>
                  </Link>
                  <Link
                    href="/pool"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <PieChart className="w-4 h-4 text-muted" />
                    <span>Company pool</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold px-2">
                  Learn
                </span>
                <div className="space-y-0.5">
                  <Link
                    href="/learn"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-muted" />
                    <span>Guides & Glossary</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-rule space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xs hover:bg-sunk text-ink font-medium text-xs"
              >
                <Settings className="w-4 h-4 text-muted" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-paper/95 backdrop-blur-xs border-t border-rule flex items-center justify-around z-30 select-none px-2"
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isMore) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={onOpen}
                aria-label="Open more navigation"
                className="flex flex-col items-center justify-center w-14 h-full text-[10px] font-sans text-muted hover:text-ink transition-colors"
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          }

          const isActive =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href!);

          const finalHref =
            tab.carryGrant && grantCtx?.selectedGrantId
              ? grantCtx.buildGrantUrl(tab.href!)
              : tab.href!;

          return (
            <Link
              key={tab.label}
              href={finalHref}
              className={`relative flex flex-col items-center justify-center w-14 h-full text-[10px] font-sans transition-colors ${
                isActive ? 'text-accent font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-mono rounded-2xs bg-warn text-paper font-bold leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default MobileNav;
