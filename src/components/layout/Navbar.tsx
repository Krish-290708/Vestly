'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  PieChart, 
  Layers, 
  Calculator, 
  GitFork, 
  CheckSquare, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Building2, 
  Newspaper, 
  Bookmark, 
  LogOut, 
  PlusCircle, 
  ChevronDown, 
  Menu, 
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResearchDropdownOpen, setIsResearchDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch current user and pending actions count
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          // Fetch actions count
          fetch('/api/actions')
            .then(r => r.ok ? r.json() : null)
            .then(aData => {
              if (aData?.reminders) {
                const pending = aData.reminders.filter((r: any) => r.status === 'PENDING').length;
                setPendingActionsCount(pending);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: PieChart },
    { label: 'My Grants', href: '/grants', icon: Layers },
    { label: 'Calculator', href: '/calculator', icon: Calculator },
    { label: 'Scenarios & 83(b)', href: '/scenarios', icon: GitFork },
    { 
      label: 'Action Center', 
      href: '/actions', 
      icon: CheckSquare,
      badge: pendingActionsCount > 0 ? pendingActionsCount : null 
    },
    { label: 'Reports', href: '/reports', icon: FileText },
  ];

  const researchLinks = [
    { label: 'Market Overview', href: '/research/market', icon: TrendingUp, desc: 'Major indices & sector trends' },
    { label: 'Company Explorer', href: '/research/companies', icon: Building2, desc: 'Valuations, 409As & profiles' },
    { label: 'Company ESOP Pool', href: '/pool', icon: PieChart, desc: 'Cap table & aggregate reserve (HR/Admin)' },
    { label: 'Market News', href: '/research/news', icon: Newspaper, desc: 'Live tech & IPO updates' },
    { label: 'Watchlist', href: '/research/watchlist', icon: Bookmark, desc: 'Tracked employer & target stocks' },
    { label: 'Learn & Glossary', href: '/learn', icon: BookOpen, desc: 'Plain-language equity guides' },
  ];

  const isResearchActive = pathname.startsWith('/research') || pathname.startsWith('/learn') || pathname.startsWith('/pool');

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:bg-emerald-400 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Vestly
                  <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ESOP Platform
                  </span>
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-slate-800 text-emerald-400' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}

              {/* Research & Learn Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsResearchDropdownOpen(!isResearchDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsResearchDropdownOpen(false), 200)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isResearchActive
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Research & Learn</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isResearchDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800">
                      Context & Market Hub
                    </div>
                    {researchLinks.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <a
                          key={subItem.href}
                          href={subItem.href}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors group"
                        >
                          <SubIcon className="w-4 h-4 mt-0.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-sm font-medium text-white group-hover:text-emerald-400">
                              {subItem.label}
                            </div>
                            <div className="text-xs text-slate-400">
                              {subItem.desc}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/grants"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm shadow-emerald-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Grant
            </a>

            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <span className="text-[11px] text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-slate-900 border-b border-slate-800 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}

          <div className="pt-3 pb-1 border-t border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
            Research & Learn
          </div>

          {researchLinks.map((subItem) => {
            const SubIcon = subItem.icon;
            return (
              <a
                key={subItem.href}
                href={subItem.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800"
              >
                <SubIcon className="w-4 h-4 text-emerald-400" />
                <span>{subItem.label}</span>
              </a>
            );
          })}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-slate-300">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-md"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="w-full text-center py-2 bg-emerald-500 text-slate-950 font-semibold rounded-md text-sm"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

