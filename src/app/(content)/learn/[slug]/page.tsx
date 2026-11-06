import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Calculator, 
  CheckSquare, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { LEARN_ARTICLES, LearnArticle } from '@/lib/learn/articles';
import { Term } from '@/components/learn/Term';
import { money, units } from '@/lib/format';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return LEARN_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const articleIndex = LEARN_ARTICLES.findIndex((a) => a.slug === params.slug);
  if (articleIndex === -1) {
    notFound();
  }

  const article = LEARN_ARTICLES[articleIndex];
  const prevArticle = articleIndex > 0 ? LEARN_ARTICLES[articleIndex - 1] : null;
  const nextArticle = articleIndex < LEARN_ARTICLES.length - 1 ? LEARN_ARTICLES[articleIndex + 1] : null;

  return (
    <article className="max-w-3xl mx-auto space-y-10 pb-20">
      {/* Back to Learn Navigation */}
      <div className="flex items-center justify-between text-xs text-muted pt-2">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learn</span>
        </Link>
        <span className="font-mono uppercase tracking-wider text-[11px]">
          {article.category}
        </span>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-rule pb-6">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="font-mono uppercase tracking-wider text-[11px] px-2 py-0.5 border border-rule rounded-sm bg-surface">
            {article.category}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <span className="text-muted/60">•</span>
          <span className="font-mono text-[11px]">Ref 2026-Q1</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight leading-snug">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {article.summary}
        </p>
      </header>

      {/* Key Takeaways Callout */}
      <section
        aria-label="Key takeaways"
        className="p-5 bg-surface border border-rule rounded-sm space-y-3"
      >
        <div className="flex items-center justify-between border-b border-rule/60 pb-2">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            Key takeaways
          </span>
          <span className="text-[11px] font-mono text-muted">
            {article.keyTakeaways.length} points
          </span>
        </div>
        <ul className="space-y-2 text-xs text-muted">
          {article.keyTakeaways.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-accent font-mono text-[11px] shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <span className="leading-relaxed text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Article Content */}
      <div className="prose prose-sm max-w-none text-ink space-y-5 leading-relaxed text-xs sm:text-sm">
        {article.content.split('\n\n').map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('### ')) {
            return (
              <h2
                key={index}
                className="text-base sm:text-lg font-semibold text-ink pt-4 border-t border-rule/60"
              >
                {trimmed.replace('### ', '')}
              </h2>
            );
          }

          if (trimmed.startsWith('#### ')) {
            return (
              <h3
                key={index}
                className="text-sm font-semibold text-ink pt-2"
              >
                {trimmed.replace('#### ', '')}
              </h3>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const listItems = trimmed.split('\n').filter(Boolean);
            return (
              <ul key={index} className="space-y-1.5 list-disc pl-5 text-muted text-xs sm:text-sm">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx} className="leading-relaxed">
                    {renderFormattedText(li.replace(/^[-*]\s+/, ''))}
                  </li>
                ))}
              </ul>
            );
          }

          if (/^\d+\.\s+/.test(trimmed)) {
            const listItems = trimmed.split('\n').filter(Boolean);
            return (
              <ol key={index} className="space-y-1.5 list-decimal pl-5 text-muted text-xs sm:text-sm">
                {listItems.map((li, liIdx) => (
                  <li key={liIdx} className="leading-relaxed">
                    {renderFormattedText(li.replace(/^\d+\.\s+/, ''))}
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <p key={index} className="text-muted leading-relaxed">
              {renderFormattedText(trimmed)}
            </p>
          );
        })}
      </div>

      {/* Worked Calculation Box (if defined) */}
      {article.workedCalculation && (
        <section
          aria-label="Worked financial calculation"
          className="p-5 bg-surface border border-rule rounded-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-rule/60 pb-2">
            <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-accent" />
              Worked calculation
            </span>
            <span className="text-[11px] font-mono text-muted">Formula breakdown</span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {article.workedCalculation.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-canvas border border-rule rounded-sm">
              <span className="text-[10px] font-mono text-muted uppercase block">Units</span>
              <span className="text-sm font-mono font-medium text-ink tabular-nums block mt-1">
                {units(article.workedCalculation.units)}
              </span>
            </div>

            <div className="p-3 bg-canvas border border-rule rounded-sm">
              <span className="text-[10px] font-mono text-muted uppercase block">Strike price</span>
              <span className="text-sm font-mono font-medium text-ink tabular-nums block mt-1">
                {money(article.workedCalculation.strikePrice)}
              </span>
            </div>

            <div className="p-3 bg-canvas border border-rule rounded-sm">
              <span className="text-[10px] font-mono text-muted uppercase block">Exercise FMV</span>
              <span className="text-sm font-mono font-medium text-ink tabular-nums block mt-1">
                {money(article.workedCalculation.fmvAtExercise)}
              </span>
            </div>

            <div className="p-3 bg-canvas border border-rule rounded-sm">
              <span className="text-[10px] font-mono text-muted uppercase block">Pre-tax spread</span>
              <span className="text-sm font-mono font-medium text-ink tabular-nums block mt-1 text-accent">
                {money(article.workedCalculation.spread)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-rule/40 text-xs">
            <span className="text-muted">Estimated tax liability:</span>
            <span className="font-mono font-medium text-ink tabular-nums">
              {money(article.workedCalculation.taxEstimate)}
            </span>
          </div>
        </section>
      )}

      {/* Related Interactive Tool Banner */}
      {article.relatedTool && (
        <section
          aria-label="Interactive tool"
          className="p-5 bg-surface border border-rule rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Interactive scenario modeler
            </span>
            <h3 className="text-sm font-semibold text-ink">
              Model this with your own numbers
            </h3>
            <p className="text-xs text-muted">
              Apply these principles to your specific option grants, strike prices, and tax filing status.
            </p>
          </div>

          <Link
            href={article.relatedTool.href}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-ink text-canvas rounded-sm hover:bg-ink/90 transition-colors shrink-0"
          >
            <span>{article.relatedTool.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}

      {/* Regulatory & Disclaimer Footnote */}
      <footer className="pt-6 border-t border-rule text-[11px] text-muted space-y-2">
        <div className="flex items-center gap-1.5 font-medium text-ink">
          <HelpCircle className="w-3.5 h-3.5 text-muted" />
          <span>Educational disclaimer</span>
        </div>
        <p className="leading-relaxed">
          This article is published strictly for educational reference and financial literacy. Federal and state tax laws, Alternative Minimum Tax thresholds, and corporate securities regulations are subject to revision and vary according to personal filing status. This does not constitute legal, tax, or investment advice. Consult a certified financial planner or CPA for filing determinations.
        </p>
      </footer>

      {/* Prev / Next Article Navigation */}
      <nav aria-label="Previous and next guides" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {prevArticle ? (
          <Link
            href={`/learn/${prevArticle.slug}`}
            className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors text-left space-y-1 group"
          >
            <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Previous guide
            </span>
            <span className="text-xs font-medium text-ink block line-clamp-1 group-hover:text-accent transition-colors">
              {prevArticle.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextArticle ? (
          <Link
            href={`/learn/${nextArticle.slug}`}
            className="p-4 bg-surface border border-rule rounded-sm hover:border-ink/40 transition-colors text-right space-y-1 group"
          >
            <span className="text-[10px] font-mono text-muted uppercase flex items-center justify-end gap-1">
              Next guide
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="text-xs font-medium text-ink block line-clamp-1 group-hover:text-accent transition-colors">
              {nextArticle.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}

/**
 * Helper to render bold markdown and key terms with inline definition tooltips
 */
function renderFormattedText(text: string): React.ReactNode {
  // Simple parser for **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          // Check if this term matches a common equity term for tooltip
          const lower = inner.toLowerCase();
          if (
            lower.includes('409a') ||
            lower.includes('iso') ||
            lower.includes('nso') ||
            lower.includes('rsu') ||
            lower.includes('amt') ||
            lower.includes('83(b)') ||
            lower.includes('ptew') ||
            lower.includes('cliff') ||
            lower.includes('strike price')
          ) {
            return (
              <strong key={i} className="font-semibold text-ink">
                <Term term={inner}>{inner}</Term>
              </strong>
            );
          }
          return (
            <strong key={i} className="font-semibold text-ink">
              {inner}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
