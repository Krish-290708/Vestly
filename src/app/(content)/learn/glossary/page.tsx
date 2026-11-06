'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES, GlossaryItem } from '@/lib/learn/glossary';

const ALPHABET = [
  'All', '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');

  // Compute available letters from all terms
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    GLOSSARY_TERMS.forEach((term) => {
      const firstChar = term.term.trim().charAt(0).toUpperCase();
      if (/[0-9]/.test(firstChar)) {
        letters.add('#');
      } else if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return letters;
  }, []);

  // Filter terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Letter filter
      if (selectedLetter !== 'All') {
        const firstChar = item.term.trim().charAt(0).toUpperCase();
        if (selectedLetter === '#') {
          if (!/[0-9]/.test(firstChar)) return false;
        } else if (firstChar !== selectedLetter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTerm = item.term.toLowerCase().includes(q);
        const matchesShort = item.shortDefinition.toLowerCase().includes(q);
        const matchesDetail = item.detailedExplanation.toLowerCase().includes(q);
        return matchesTerm || matchesShort || matchesDetail;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedLetter]);

  // Group filtered terms by first letter when in 'All' letter view and no search
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: GlossaryItem[] } = {};
    filteredTerms.forEach((item) => {
      const firstChar = item.term.trim().charAt(0).toUpperCase();
      const letter = /[0-9]/.test(firstChar) ? '#' : firstChar;
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    });
    return groups;
  }, [filteredTerms]);

  return (
    <div className="space-y-8 pb-20">
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learn</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Financial reference"
        title="Equity glossary"
        contextSentence="Definitive reference guide covering 80+ equity compensation, taxation, venture capital, and corporate governance terms."
      />

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equity terms (e.g. 409A, AMT, Cliff, PTEW)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-rule rounded-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {GLOSSARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'border-ink bg-ink text-canvas font-medium'
                    : 'border-rule bg-surface text-muted hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Alphabet Quick Jump Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-rule/60 text-[11px] font-mono">
          {ALPHABET.map((letter) => {
            const isAvailable = letter === 'All' || availableLetters.has(letter);
            const isSelected = selectedLetter === letter;

            return (
              <button
                key={letter}
                disabled={!isAvailable}
                onClick={() => setSelectedLetter(letter)}
                className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-ink text-canvas font-medium'
                    : isAvailable
                    ? 'text-muted hover:text-ink hover:bg-surface border border-transparent hover:border-rule'
                    : 'text-muted/30 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-muted font-mono">
        <span>
          Showing {filteredTerms.length} of {GLOSSARY_TERMS.length} terms
        </span>
        {(searchQuery || selectedCategory !== 'All' || selectedLetter !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLetter('All');
            }}
            className="text-accent hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Terms Display */}
      {selectedLetter === 'All' && searchQuery === '' ? (
        // Alphabetical Grouping
        <div className="space-y-10">
          {Object.keys(groupedTerms)
            .sort()
            .map((letter) => (
              <div key={letter} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-rule pb-1.5">
                  <span className="font-serif text-lg font-bold text-ink">
                    {letter}
                  </span>
                  <span className="text-[11px] font-mono text-muted">
                    {groupedTerms[letter].length} {groupedTerms[letter].length === 1 ? 'term' : 'terms'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedTerms[letter].map((item) => (
                    <GlossaryCard key={item.slug} item={item} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        // Flat filtered list
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((item) => (
            <GlossaryCard key={item.slug} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTerms.length === 0 && (
        <div className="p-12 text-center border border-rule rounded-sm bg-surface space-y-2">
          <HelpCircle className="w-6 h-6 text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-ink">No glossary terms found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            No terms matched your search query or filter criteria. Try searching for a broader term like &quot;tax&quot;, &quot;option&quot;, or &quot;cliff&quot;.
          </p>
        </div>
      )}
    </div>
  );
}

function GlossaryCard({ item }: { item: GlossaryItem }) {
  return (
    <div
      id={item.slug}
      className="p-5 bg-surface border border-rule rounded-sm space-y-3 scroll-mt-20 hover:border-ink/30 transition-colors flex flex-col justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink leading-snug">
            {item.term}
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted px-2 py-0.5 border border-rule rounded-sm bg-canvas shrink-0">
            {item.category}
          </span>
        </div>

        <p className="text-xs font-medium text-ink leading-relaxed">
          {item.shortDefinition}
        </p>

        <p className="text-xs text-muted leading-relaxed">
          {item.detailedExplanation}
        </p>
      </div>

      {item.example && (
        <div className="pt-3 border-t border-rule/50">
          <div className="p-2.5 bg-canvas border border-rule/60 rounded-sm text-[11px] text-muted space-y-1">
            <span className="font-semibold text-ink text-[10px] uppercase font-mono block">
              Practical example
            </span>
            <p className="leading-relaxed">{item.example}</p>
          </div>
        </div>
      )}
    </div>
  );
}
