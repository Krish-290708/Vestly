'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  Layers, 
  Calculator, 
  FileText, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  Settings, 
  Clock, 
  Plus, 
  SunMoon, 
  X,
  PieChart,
  CheckSquare
} from 'lucide-react';

interface PaletteItem {
  id: string;
  category: 'Pages' | 'Actions' | 'Grants' | 'Companies' | 'Learn';
  title: string;
  subtitle?: string;
  href?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

const STATIC_PAGES: PaletteItem[] = [
  { id: 'p-overview', category: 'Pages', title: 'Overview', subtitle: 'Portfolio metrics, vesting projection & upcoming vests', href: '/dashboard', icon: PieChart },
  { id: 'p-grants', category: 'Pages', title: 'Grants', subtitle: 'View, filter, and manage all equity grants', href: '/grants', icon: Layers },
  { id: 'p-calc', category: 'Pages', title: 'Calculator', subtitle: 'Model exercise costs, AMT liabilities & net proceeds', href: '/calculator', icon: Calculator },
  { id: 'p-scenarios', category: 'Pages', title: 'Scenarios & 83(b)', subtitle: 'Compare early exercise vs late exit strategies', href: '/scenarios', icon: FileText },
  { id: 'p-actions', category: 'Pages', title: 'Action center', subtitle: 'Pending deadlines, 83(b) elections & tax milestones', href: '/actions', icon: CheckSquare },
  { id: 'p-reports', category: 'Pages', title: 'Reports & statements', subtitle: 'Generate summaries for CPA and annual tax planning', href: '/reports', icon: FileText },
  { id: 'p-pool', category: 'Pages', title: 'Company ESOP pool', subtitle: 'Cap table pool reserve & dilution analysis', href: '/pool', icon: PieChart },
  { id: 'p-settings', category: 'Pages', title: 'Settings', subtitle: 'Profile, tax defaults, notifications & data export', href: '/settings', icon: Settings },
  { id: 'p-market', category: 'Pages', title: 'Market overview', subtitle: 'Public market indices and tech multiples', href: '/research/market', icon: TrendingUp },
  { id: 'p-companies', category: 'Pages', title: 'Company explorer', subtitle: 'Explore private tech valuations and public comps', href: '/research/companies', icon: Building2 },
  { id: 'p-learn', category: 'Pages', title: 'Learn hub', subtitle: 'Plain-language guides and equity glossary', href: '/learn', icon: BookOpen },
];

const STATIC_LEARN: PaletteItem[] = [
  { id: 'l-iso', category: 'Learn', title: 'Incentive Stock Options (ISO)', subtitle: 'Tax advantages, AMT spread & 1-year holding rules', href: '/learn#iso', icon: BookOpen },
  { id: 'l-nso', category: 'Learn', title: 'Non-Qualified Stock Options (NSO)', subtitle: 'Ordinary income tax withholding upon exercise', href: '/learn#nso', icon: BookOpen },
  { id: 'l-83b', category: 'Learn', title: 'Section 83(b) election', subtitle: 'Strict 30-day IRS filing deadline for early-exercised stock', href: '/learn#section-83b', icon: BookOpen },
  { id: 'l-amt', category: 'Learn', title: 'Alternative Minimum Tax (AMT)', subtitle: 'How ISO spread triggers AMT liability in the tax year of exercise', href: '/learn#amt', icon: BookOpen },
  { id: 'l-rsu', category: 'Learn', title: 'Restricted Stock Units (RSU)', subtitle: 'Vesting rules, supplemental tax withholding & net settlement', href: '/learn#rsu', icon: BookOpen },
  { id: 'l-espp', category: 'Learn', title: 'Employee Stock Purchase Plan (ESPP)', subtitle: 'Lookback provisions, 15% discount & qualified dispositions', href: '/learn#espp', icon: BookOpen },
];

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicGrants, setDynamicGrants] = useState<PaletteItem[]>([]);
  const [dynamicCompanies, setDynamicCompanies] = useState<PaletteItem[]>([]);
  const [recentItems, setRecentItems] = useState<PaletteItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vestly_recent_searches');
        if (stored) {
          const parsed = JSON.parse(stored);
          const reconstituted = parsed
            .map((id: string) => [...STATIC_PAGES, ...STATIC_LEARN].find((item) => item.id === id))
            .filter(Boolean) as PaletteItem[];
          setRecentItems(reconstituted.slice(0, 4));
        }
      } catch {
        // Ignore JSON errors
      }
    }
  }, [isOpen]);

  // Handle Ctrl+K / Cmd+K global keybind
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or custom event
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setDynamicGrants([]);
      setDynamicCompanies([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const grants: PaletteItem[] = (data.grants || []).map((g: any) => ({
            id: `g-${g.id}`,
            category: 'Grants',
            title: `${g.companyName} (${g.grantType})`,
            subtitle: `${g.sharesTotal.toLocaleString()} units · Strike $${g.strikePrice.toFixed(2)} · FMV $${g.currentFmv.toFixed(2)}`,
            href: `/grants?grant=${g.id}`,
            icon: Layers,
          }));

          const companies: PaletteItem[] = (data.companies || []).map((c: any) => ({
            id: `c-${c.id}`,
            category: 'Companies',
            title: c.name,
            subtitle: `${c.ticker || 'Private'} · ${c.industry || 'Technology'}`,
            href: `/research/companies`,
            icon: Building2,
          }));

          setDynamicGrants(grants);
          setDynamicCompanies(companies);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Define static action items
  const actionItems: PaletteItem[] = [
    {
      id: 'a-add-grant',
      category: 'Actions',
      title: 'Add a new grant',
      subtitle: 'Record stock options, RSUs, or ESPP allocation',
      href: '/grants',
      icon: Plus,
    },
    {
      id: 'a-calculator',
      category: 'Actions',
      title: 'Calculate exercise costs',
      subtitle: 'Open the deterministic equity calculator',
      href: '/calculator',
      icon: Calculator,
    },
    {
      id: 'a-export-data',
      category: 'Actions',
      title: 'Export equity data (JSON / CSV)',
      subtitle: 'Download complete statement records',
      href: '/settings#data',
      icon: FileText,
    },
    {
      id: 'a-toggle-theme',
      category: 'Actions',
      title: 'Toggle theme',
      subtitle: 'Switch between light paper and dark ledger palettes',
      action: () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('vestly_theme', next);
      },
      icon: SunMoon,
    },
  ];

  // Filter items based on query
  const filteredItems: PaletteItem[] = React.useMemo(() => {
    if (!query.trim()) {
      return [...actionItems, ...recentItems, ...STATIC_PAGES.slice(0, 5)];
    }

    const q = query.toLowerCase();
    const matchedPages = STATIC_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)
    );
    const matchedActions = actionItems.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q)
    );
    const matchedLearn = STATIC_LEARN.filter(
      (l) => l.title.toLowerCase().includes(q) || l.subtitle?.toLowerCase().includes(q)
    );

    return [
      ...matchedPages,
      ...dynamicGrants,
      ...matchedActions,
      ...dynamicCompanies,
      ...matchedLearn,
    ];
  }, [query, recentItems, dynamicGrants, dynamicCompanies]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, query]);

  const selectItem = useCallback(
    (item: PaletteItem) => {
      // Save to recent items
      try {
        const stored = localStorage.getItem('vestly_recent_searches');
        const ids = stored ? JSON.parse(stored) : [];
        const nextIds = [item.id, ...ids.filter((id: string) => id !== item.id)].slice(0, 6);
        localStorage.setItem('vestly_recent_searches', JSON.stringify(nextIds));
      } catch {
        // Non-blocking
      }

      onClose();

      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) selectItem(item);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedEl = list.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-rule rounded shadow-lg overflow-hidden flex flex-col max-h-[80vh] text-ink animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-rule bg-paper">
          <Search className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, grants, companies, or equity guides..."
            className="w-full bg-transparent border-0 text-sm text-ink placeholder:text-muted focus:outline-hidden font-sans"
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted hover:text-ink p-1 rounded-sm"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border border-rule rounded-xs bg-surface text-muted">
              ESC
            </kbd>
          )}
        </div>

        {/* Results list */}
        <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-rule/40 max-h-[420px]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted font-sans">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xs cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-sunk text-ink' : 'text-ink/90 hover:bg-sunk/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-xs border shrink-0 ${
                        isSelected
                          ? 'border-rule bg-surface text-accent'
                          : 'border-transparent text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.title}</span>
                        <span className="text-[10px] font-mono text-muted/70 uppercase tracking-wider shrink-0">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 text-muted transition-transform shrink-0 ml-2 ${
                      isSelected ? 'text-accent translate-x-0.5' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 border-t border-rule bg-paper/60 flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          {isSearching && <span className="text-accent animate-pulse">Searching...</span>}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;

