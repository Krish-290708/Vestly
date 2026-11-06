'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  HelpCircle,
  Award
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { QUIZ_QUESTIONS, QuizQuestion } from '@/lib/learn/quiz';
import { LEARN_ARTICLES } from '@/lib/learn/articles';

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [id: number]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const isCurrentAnswered = selectedAnswers[currentQuestion.id] !== undefined;

  const handleSelectOption = (index: number) => {
    if (isCurrentAnswered) return; // Prevent changing answer once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Compute final score
  const score = useMemo(() => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  }, [selectedAnswers]);

  const scorePercent = Math.round((score / totalQuestions) * 100);

  // Score band assessment
  const assessment = useMemo(() => {
    if (score >= 9) {
      return {
        label: 'Advanced equity knowledge',
        description: 'You have a command of startup equity, Alternative Minimum Tax adjustments, secondary markets, and corporate governance.',
      };
    }
    if (score >= 7) {
      return {
        label: 'Proficient equity knowledge',
        description: 'You understand core equity mechanics well, with only a few blindspots around advanced tax planning or transfer restrictions.',
      };
    }
    return {
      label: 'Foundational stage',
      description: 'You are beginning to learn startup equity concepts. We recommend reading our foundation and tax planning guides to protect against costly pitfalls.',
    };
  }, [score]);

  // Lookup related article details
  const getRelatedArticle = (slug: string) => {
    return LEARN_ARTICLES.find((a) => a.slug === slug);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
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
        eyebrow="Self-assessment"
        title="Equity knowledge quiz"
        contextSentence="10 questions evaluating practical understanding of option grants, AMT calculations, post-termination windows, and dilution."
      />

      {!isCompleted ? (
        // Active Quiz Stepper
        <div className="space-y-6">
          {/* Progress Strip */}
          <div className="p-4 bg-surface border border-rule rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="font-mono text-[11px]">
                {Object.keys(selectedAnswers).length} answered
              </span>
            </div>
            <div className="w-full bg-rule/40 h-1 rounded-sm overflow-hidden">
              <div
                className="bg-ink h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 bg-surface border border-rule rounded-sm space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted px-2 py-0.5 border border-rule rounded-sm bg-canvas">
                  {currentQuestion.category}
                </span>
                <span className="text-[11px] font-mono text-muted">
                  ID #{currentQuestion.id}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-serif font-medium text-ink leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                const showFeedback = isCurrentAnswered;

                let buttonStyle = 'border-rule hover:border-ink/40 bg-surface text-ink';

                if (showFeedback) {
                  if (isCorrect) {
                    buttonStyle = 'border-accent bg-accent/5 text-ink font-medium';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'border-loss/40 bg-loss/5 text-ink';
                  } else {
                    buttonStyle = 'border-rule/40 bg-canvas text-muted opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 text-left text-xs sm:text-sm border rounded-sm transition-all flex items-start gap-3 ${buttonStyle}`}
                  >
                    <span className="font-mono text-[11px] text-muted shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="leading-relaxed flex-1">{option}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-loss shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Explanation Feedback */}
            {isCurrentAnswered && (
              <div className="p-4 bg-canvas border border-rule rounded-sm space-y-3 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex ? (
                    <span className="text-accent flex items-center gap-1.5 font-mono text-[11px] uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Correct answer
                    </span>
                  ) : (
                    <span className="text-loss flex items-center gap-1.5 font-mono text-[11px] uppercase">
                      <XCircle className="w-3.5 h-3.5" />
                      Incorrect
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  {currentQuestion.explanation}
                </p>

                {currentQuestion.relatedArticleSlug && (
                  <div className="pt-2 border-t border-rule/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted">Learn more about this concept:</span>
                    <Link
                      href={`/learn/${currentQuestion.relatedArticleSlug}`}
                      className="text-accent hover:underline font-medium inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Read reference guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-rule/60 text-xs">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-rule rounded-sm transition-colors ${
                  currentIndex === 0
                    ? 'text-muted/30 border-rule/30 cursor-not-allowed'
                    : 'text-muted hover:text-ink hover:border-ink/40'
                }`}
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={!isCurrentAnswered}
                onClick={handleNext}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm transition-colors ${
                  !isCurrentAnswered
                    ? 'bg-rule/40 text-muted/50 cursor-not-allowed'
                    : 'bg-ink text-canvas hover:bg-ink/90 font-medium'
                }`}
              >
                <span>{currentIndex === totalQuestions - 1 ? 'View final score' : 'Next question'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Final Score Summary
        <div className="space-y-8 animate-in fade-in-50 duration-300">
          <div className="p-6 bg-surface border border-rule rounded-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-5">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Assessment result
                </span>
                <h2 className="text-xl font-semibold text-ink">
                  {assessment.label}
                </h2>
                <p className="text-xs text-muted leading-relaxed max-w-xl">
                  {assessment.description}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-rule sm:pl-6 shrink-0">
                <span className="text-3xl font-mono font-medium text-ink tabular-nums block">
                  {score} / {totalQuestions}
                </span>
                <span className="text-[11px] font-mono text-muted uppercase block">
                  {scorePercent}% accuracy
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-rule rounded-sm bg-surface text-ink hover:border-ink/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted" />
                <span>Retake quiz</span>
              </button>

              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
              >
                <span>Explore all 24 guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted px-1">
              Question review breakdown
            </h3>

            {QUIZ_QUESTIONS.map((q, index) => {
              const isCorrect = selectedAnswers[q.id] === q.correctIndex;
              const relatedArticle = getRelatedArticle(q.relatedArticleSlug);

              return (
                <div
                  key={q.id}
                  className="p-4 bg-surface border border-rule rounded-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted">
                          Q{index + 1}.
                        </span>
                        <h4 className="text-xs font-medium text-ink leading-snug">
                          {q.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCorrect ? (
                        <span className="text-accent text-[11px] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="text-loss text-[11px] font-mono flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Missed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted leading-relaxed pl-6">
                    {q.explanation}
                  </p>

                  {relatedArticle && (
                    <div className="pt-2 pl-6 flex items-center justify-between text-[11px]">
                      <span className="text-muted">Recommended reading:</span>
                      <Link
                        href={`/learn/${relatedArticle.slug}`}
                        className="text-accent hover:underline inline-flex items-center gap-1"
                      >
                        <span>{relatedArticle.title}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
