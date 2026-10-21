'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PieChart,
  Layers,
  Calculator,
  GitFork,
  CheckSquare,
  FileText,
  TrendingUp,
  Building2,
  Newspaper,
  Bookmark,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { useGrant } from '@/contexts/GrantContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  carryGrant?: boolean;
  badge?: React.ReactNode;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const grantCtx = useGrant();

  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);

  // Fetch pending action reminders count
  useEffect(() => {
    fetch('/api/actions')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.reminders) {
          const pending = data.reminders.filter((rem: any) => rem.status === 'PENDING').length;
          setPendingActionsCount(pending);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      name: 'Your equity',
      items: [
        { label: 'Overview', href: '/dashboard', icon: PieChart },
        { label: 'Grants', href: '/grants', icon: Layers, carryGrant: true },
        { label: 'Calculator', href: '/calculator', icon: Calculator, carryGrant: true },
        { label: 'Scenarios', href: '/scenarios', icon: GitFork, carryGrant: true },
        {
          label: 'Actions',
          href: '/actions',
          icon: CheckSquare,
          badge: pendingActionsCount > 0 ? (
            <span className="ml-auto inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono font-medium rounded-xs bg-warn/15 text-warn border border-warn/30">
              {pendingActionsCount}
            </span>
          ) : null,
        },
        { label: 'Reports', href: '/reports', icon: FileText, carryGrant: true },
      ],
    },
    {
      name: 'Research',
      items: [
        { label: 'Markets', href: '/research/market', icon: TrendingUp },
        { label: 'Companies', href: '/research/companies', icon: Building2 },
        { label: 'News', href: '/research/news', icon: Newspaper },
        { label: 'Watchlist', href: '/research/watchlist', icon: Bookmark },
        { label: 'Company pool', href: '/pool', icon: PieChart },
      ],
    },
    {
      name: 'Learn',
      items: [
        { label: 'Guides', href: '/learn', icon: BookOpen },
        { label: 'Glossary', href: '/learn#glossary', icon: BookOpen },
      ],
    },
  ];

  return (
    <aside
      aria-label="Main navigation"
      className={`hidden md:flex flex-col border-r border-rule bg-paper transition-all duration-200 shrink-0 z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Branding */}
      <div className="h-14 flex items-center px-4 border-b border-rule">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden focus:outline-hidden"
          title="Vestly Home"
        >
          <Logo size="sm" showWordmark={!collapsed} />
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.name} className="space-y-1">
            {!collapsed && (
              <h4 className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-muted font-semibold">
                {group.name}
              </h4>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href ||
                      (item.href !== '/dashboard' &&
                        !item.href.includes('#') &&
                        pathname.startsWith(item.href));

                const finalHref =
                  item.carryGrant && grantCtx?.selectedGrantId
                    ? grantCtx.buildGrantUrl(item.href)
                    : item.href;

                return (
                  <li key={item.label}>
                    <Link
                      href={finalHref}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-sunk text-ink font-semibold border border-rule/80'
                          : 'text-muted hover:text-ink hover:bg-sunk/50 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-accent' : 'text-muted'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                      {!collapsed && item.badge}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="p-2.5 border-t border-rule space-y-1">
        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs font-medium text-muted hover:text-ink hover:bg-sunk/50 transition-colors ${
            pathname === '/settings' ? 'bg-sunk text-ink font-semibold border border-rule/80' : ''
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate whitespace-nowrap">Settings</span>}
        </Link>

        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xs text-xs font-medium text-muted hover:text-ink hover:bg-sunk/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="truncate text-muted text-[11px]">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
