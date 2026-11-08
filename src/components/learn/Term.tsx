'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { GLOSSARY_TERMS, GlossaryItem } from '@/lib/learn/glossary';

interface TermProps {
  term: string;
  children?: React.ReactNode;
}

export function Term({ term, children }: TermProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const normalized = term.toLowerCase().trim();
  const found: GlossaryItem | undefined = GLOSSARY_TERMS.find(
    (g) =>
      g.slug === normalized ||
      g.term.toLowerCase() === normalized ||
      g.term.toLowerCase().startsWith(normalized) ||
      normalized.startsWith(g.term.toLowerCase())
  );

  const displayText = children || (found ? found.term : term);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  if (!found) {
    return <span className="font-medium text-ink">{displayText}</span>;
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border-b border-dotted border-muted/80 hover:border-ink hover:text-ink cursor-help font-medium transition-colors text-left inline"
        title={found.shortDefinition}
      >
        {displayText}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-surface text-ink border border-rule rounded-sm shadow-popover text-xs space-y-1.5 animate-in fade-in-50 zoom-in-95 pointer-events-auto"
        >
          <span className="flex items-center justify-between border-b border-rule/60 pb-1 block">
            <span className="font-semibold text-ink text-[11px] block">{found.term}</span>
            <span className="text-[10px] text-muted font-mono uppercase tracking-wider block">
              {found.category}
            </span>
          </span>
          <span className="text-muted text-[11px] leading-relaxed block">
            {found.shortDefinition}
          </span>
          <span className="pt-1 block border-t border-rule/40">
            <Link
              href={`/learn/glossary#${found.slug}`}
              className="text-[10px] text-accent hover:underline font-medium block"
            >
              Full glossary definition →
            </Link>
          </span>
        </span>
      )}
    </span>
  );
}

export default Term;
