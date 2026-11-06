import { describe, it, expect } from 'vitest';
import { LEARN_ARTICLES, LEARN_PATHS } from '../src/lib/learn/articles';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES } from '../src/lib/learn/glossary';
import { QUIZ_QUESTIONS } from '../src/lib/learn/quiz';

describe('Learn Hub Articles (LEARN_ARTICLES)', () => {
  it('contains exactly 24 educational articles across 5 learning paths', () => {
    expect(LEARN_ARTICLES.length).toBe(24);
    expect(LEARN_PATHS.length).toBe(5);
  });

  it('ensures each article has a unique non-empty id and slug', () => {
    const ids = new Set<string>();
    const slugs = new Set<string>();

    LEARN_ARTICLES.forEach((article) => {
      expect(article.id.trim()).not.toBe('');
      expect(article.slug.trim()).not.toBe('');
      expect(ids.has(article.id)).toBe(false);
      expect(slugs.has(article.slug)).toBe(false);
      ids.add(article.id);
      slugs.add(article.slug);
    });
  });

  it('validates all articles have required content, category, and takeaways', () => {
    const validCategories = new Set(LEARN_PATHS.map((p) => p.title.toLowerCase()));

    LEARN_ARTICLES.forEach((article) => {
      expect(article.title.trim()).not.toBe('');
      expect(article.summary.trim()).not.toBe('');
      expect(article.content.trim().length).toBeGreaterThan(100);
      expect(article.readTime).toMatch(/^\d+\s+min read$/);
      expect(article.keyTakeaways.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('verifies mathematical precision in worked calculation examples', () => {
    const articlesWithCalculations = LEARN_ARTICLES.filter((a) => a.workedCalculation);
    expect(articlesWithCalculations.length).toBeGreaterThan(0);

    articlesWithCalculations.forEach((article) => {
      const calc = article.workedCalculation!;
      const expectedSpread = calc.units * (calc.fmvAtExercise - calc.strikePrice);
      expect(calc.spread).toBeCloseTo(expectedSpread, 2);
      expect(calc.taxEstimate).toBeGreaterThan(0);
      expect(calc.taxEstimate).toBeLessThan(calc.spread);
    });
  });
});

describe('Equity Glossary (GLOSSARY_TERMS)', () => {
  it('contains at least 80 defined terms', () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(80);
  });

  it('ensures all terms have unique slugs and valid categories', () => {
    const slugs = new Set<string>();
    const validCategories = new Set(GLOSSARY_CATEGORIES.filter((c) => c !== 'All'));

    GLOSSARY_TERMS.forEach((term) => {
      expect(term.slug.trim()).not.toBe('');
      expect(slugs.has(term.slug)).toBe(false);
      slugs.add(term.slug);

      expect(validCategories.has(term.category)).toBe(true);
      expect(term.term.trim()).not.toBe('');
      expect(term.shortDefinition.trim()).not.toBe('');
      expect(term.detailedExplanation.trim()).not.toBe('');
    });
  });

  it('verifies terms include essential equity concepts', () => {
    const slugs = new Set(GLOSSARY_TERMS.map((t) => t.slug));
    expect(slugs.has('409a-valuation')).toBe(true);
    expect(slugs.has('incentive-stock-option')).toBe(true);
    expect(slugs.has('alternative-minimum-tax')).toBe(true);
    expect(slugs.has('section-83b-election')).toBe(true);
    expect(slugs.has('post-termination-exercise-window')).toBe(true);
    expect(slugs.has('vesting-cliff')).toBe(true);
  });
});

describe('Equity Knowledge Quiz (QUIZ_QUESTIONS)', () => {
  it('contains exactly 10 questions with 4 options each', () => {
    expect(QUIZ_QUESTIONS.length).toBe(10);
    QUIZ_QUESTIONS.forEach((q) => {
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.trim()).not.toBe('');
      expect(q.question.trim()).not.toBe('');
    });
  });

  it('verifies every question references a valid article slug in LEARN_ARTICLES', () => {
    const articleSlugs = new Set(LEARN_ARTICLES.map((a) => a.slug));
    QUIZ_QUESTIONS.forEach((q) => {
      expect(articleSlugs.has(q.relatedArticleSlug)).toBe(true);
    });
  });
});
