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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-emerald-600" />
          Education Center & Equity Glossary
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Institutional-grade equity guides and financial definitions written in clear, plain language
        </p>
      </div>

      {/* Main Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'guides'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Explainer Guides ({EDUCATIONAL_ARTICLES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'glossary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
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
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' 
                      : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-emerald-700 uppercase tracking-wider">{article.category}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug text-xs sm:text-sm">
                    {article.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Article Detail Viewer (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-10 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedArticle.readTime}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedArticle.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {selectedArticle.summary}
              </p>
            </div>

            {/* Key Takeaways Callout Box */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Key Takeaways
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedArticle.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Markdown-style Content */}
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 pt-2">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('#### ')) {
                  return (
                    <h4 key={index} className="text-sm font-bold text-slate-800 pt-1">
                      {paragraph.replace('#### ', '')}
                    </h4>
                  );
                }
                return (
                  <p key={index} className="leading-relaxed whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Want to calculate this for your own options?
              </span>
              <a
                href="/calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
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
                className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['All', 'Basics', 'Taxes', 'Legal', 'Market'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    glossaryCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{item.term}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs font-semibold text-emerald-800 leading-snug">
                  {item.shortDefinition}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detailedExplanation}
                </p>

                {item.example && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <strong>Practical Example:</strong> {item.example}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredGlossary.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              No matching glossary terms found.
            </div>
          )}

        </div>
      )}

    </div>
  );
}

