'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  CheckSquare, 
  GraduationCap, 
  FileText,
  Compass
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LEARN_ARTICLES, LEARN_PATHS, LearnArticle } from '@/lib/learn/articles';
import { GLOSSARY_TERMS } from '@/lib/learn/glossary';

export default function LearnIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string>('all');

  // Filter articles by search query and path
  const filteredArticles = useMemo(() => {
    return LEARN_ARTICLES.filter((article) => {
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPath =
        selectedPath === 'all' ||
        article.category.toLowerCase() === selectedPath.toLowerCase();

      return matchesSearch && matchesPath;
    });
  }, [searchQuery, selectedPath]);

  // Matching glossary terms for live search preview
  const matchingTerms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return GLOSSARY_TERMS.filter(
      (term) =>
        term.term.toLowerCase().includes(q) ||
        term.shortDefinition.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery]);

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <PageHeader
        title="Learn"
        contextSentence="Factual guides, reference definitions, and calculation frameworks for startup equity."
      />

      {/* Quick Jump Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/learn/glossary"
          className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Reference
            </span>
            <HelpCircle className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
          </div>
          <h2 className="text-sm font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
            Equity glossary
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Over 80 defined terms across taxation, corporate governance, and secondary markets.
          </p>
        </Link>

        <Link
          href="/learn/checklist"
          className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Evaluation tool
            </span>
            <CheckSquare className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
          </div>
          <h2 className="text-sm font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
            Offer checklist
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            10-point diligence framework to evaluate startup option grants and employment contracts.
          </p>
        </Link>

        <Link
          href="/learn/quiz"
          className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors group"
        >
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Self-assessment
            </span>
            <GraduationCap className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
          </div>
          <h2 className="text-sm font-semibold text-ink mb-1 group-hover:text-accent transition-colors">
            Equity quiz
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            10 practical questions to test your understanding of AMT, exercise windows, and dilution.
          </p>
        </Link>
      </div>

      {/* Starter Guide Banner */}
      <div className="p-5 bg-surface border border-rule rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
              Recommended starting point
            </span>
          </div>
          <h2 className="text-sm font-semibold text-ink">
            New to startup stock options?
          </h2>
          <p className="text-xs text-muted max-w-2xl leading-relaxed">
            Start with our foundation guide covering strike prices, vesting cliffs, and how value is created before diving into tax planning or liquidation preferences.
          </p>
        </div>
        <Link
          href="/learn/esop-basics"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-ink text-canvas rounded-sm hover:bg-ink/90 transition-colors shrink-0 self-start md:self-center"
        >
          <span>Read foundation guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 24 guides and 80+ terms..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-rule rounded-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setSelectedPath('all')}
              className={`px-2.5 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                selectedPath === 'all'
                  ? 'border-ink bg-ink text-canvas font-medium'
                  : 'border-rule bg-surface text-muted hover:text-ink'
              }`}
            >
              All guides ({LEARN_ARTICLES.length})
            </button>
            {LEARN_PATHS.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className={`px-2.5 py-1.5 rounded-sm border transition-colors whitespace-nowrap capitalize ${
                  selectedPath === path.id
                    ? 'border-ink bg-ink text-canvas font-medium'
                    : 'border-rule bg-surface text-muted hover:text-ink'
                }`}
              >
                {path.id}
              </button>
            ))}
          </div>
        </div>

        {/* Live Search Glossary Preview (if search active) */}
        {searchQuery.trim() !== '' && matchingTerms.length > 0 && (
          <div className="p-3 bg-canvas border border-rule rounded-sm space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="font-mono uppercase tracking-wider">Matching glossary terms</span>
              <Link href="/learn/glossary" className="text-accent hover:underline">
                View all glossary terms →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {matchingTerms.map((term) => (
                <Link
                  key={term.slug}
                  href={`/learn/glossary#${term.slug}`}
                  className="p-2.5 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors text-left block"
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium text-ink">{term.term}</span>
                    <span className="text-[10px] font-mono text-muted uppercase">{term.category}</span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-1">{term.shortDefinition}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning Paths & Articles Grid */}
      {selectedPath === 'all' && searchQuery === '' ? (
        // Grouped by Learning Path
        <div className="space-y-12">
          {LEARN_PATHS.map((path) => {
            const pathArticles = LEARN_ARTICLES.filter(
              (a) => a.category.toLowerCase() === path.id.toLowerCase()
            );

            return (
              <section key={path.id} className="space-y-4">
                <div className="border-b border-rule pb-2">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-ink">
                      {path.title}
                    </h2>
                    <span className="text-xs font-mono text-muted">
                      {pathArticles.length} guides
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {path.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pathArticles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Flat filtered list
        <div className="space-y-4">
          <div className="text-xs text-muted font-mono">
            Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'guide' : 'guides'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="p-12 text-center border border-rule rounded-sm bg-surface">
              <p className="text-xs text-muted">
                No educational guides matched your filter criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: LearnArticle }) {
  return (
    <Link
      href={`/learn/${article.slug}`}
      className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors flex flex-col justify-between group"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span className="font-mono uppercase tracking-wider text-muted">
            {article.category}
          </span>
          <span className="flex items-center gap-1 font-mono text-muted">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </span>
        </div>

        <h3 className="text-xs sm:text-sm font-semibold text-ink group-hover:text-accent transition-colors leading-snug">
          {article.title}
        </h3>

        <p className="text-xs text-muted leading-relaxed line-clamp-3">
          {article.summary}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-rule/60 flex items-center justify-between text-xs text-muted">
        <span className="font-mono text-[11px]">
          {article.keyTakeaways.length} key takeaways
        </span>
        <span className="inline-flex items-center gap-1 text-accent group-hover:translate-x-0.5 transition-transform font-medium text-[11px]">
          <span>Read</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
