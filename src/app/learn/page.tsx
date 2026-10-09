'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { EDUCATIONAL_ARTICLES, GLOSSARY_TERMS } from '@/lib/mockData';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'guides' | 'glossary'>('guides');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(EDUCATIONAL_ARTICLES[0].id);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<string>('All');

  const selectedArticle = EDUCATIONAL_ARTICLES.find(a => a.id === selectedArticleId) || EDUCATIONAL_ARTICLES[0];

  const filteredGlossary = GLOSSARY_TERMS.filter(item => {
    const matchesQuery = item.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
                         item.shortDefinition.toLowerCase().includes(glossaryQuery.toLowerCase());
    const matchesCategory = glossaryCategory === 'All' || item.category === glossaryCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-emerald-400" />
          Education Center & Equity Glossary
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Institutional-grade equity guides and financial definitions written in clear, plain language
        </p>
      </div>

      {/* Main Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'guides'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Explainer Guides ({EDUCATIONAL_ARTICLES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'glossary'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interactive Glossary ({GLOSSARY_TERMS.length})</span>
        </button>
      </div>

      {/* VIEW 1: Guides */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Article Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
              Curated Articles
            </span>

            {EDUCATIONAL_ARTICLES.map((article) => {
              const isSelected = article.id === selectedArticle.id;

              return (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticleId(article.id)}
                  className={`w-full text-left p-4 rounded-xl border text-xs transition-all ${
                    isSelected 
                      ? 'bg-slate-800 text-white border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg' 
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-emerald-400 uppercase tracking-wider">{article.category}</span>
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-white leading-snug text-xs sm:text-sm">
                    {article.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Article Detail Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedArticle.readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {selectedArticle.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {selectedArticle.summary}
              </p>
            </div>

            {/* Key Takeaways Callout Box */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Key Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedArticle.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Markdown-style Content */}
            <div className="max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 pt-2">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-base font-bold text-white pt-3 border-t border-slate-800">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={index} className="text-sm font-bold text-slate-200 pt-1">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                return (
                  <p key={index} className="leading-relaxed whitespace-pre-line text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Want to calculate this for your own options?
              </span>
              <a
                href="/calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                <span>Launch Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: Glossary */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                placeholder="Search equity terms (e.g. 409A, AMT, Cliff)..."
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Basics', 'Taxes', 'Legal', 'Market'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    glossaryCategory === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item) => (
              <div 
                key={item.term}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{item.term}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs font-semibold text-emerald-400 leading-snug">
                  {item.shortDefinition}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.detailedExplanation}
                </p>

                {item.example && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
                    <strong className="text-white">Practical Example:</strong> {item.example}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredGlossary.length === 0 && (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              No matching glossary terms found.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
