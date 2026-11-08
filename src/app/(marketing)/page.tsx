import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import GrantLifecycleTimeline from '@/components/landing/GrantLifecycleTimeline';
import EquityComparisonTable from '@/components/landing/EquityComparisonTable';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WorkedExampleSection from '@/components/landing/WorkedExampleSection';
import ResearchLearnPreview from '@/components/landing/ResearchLearnPreview';
import BoundariesSection from '@/components/landing/BoundariesSection';
import FaqSection from '@/components/landing/FaqSection';

export const metadata = {
  title: 'Vestly · Personal Equity Statement and Option Modeler',
  description:
    'Work out what your stock options are worth, what exercising them will cost, and which statutory tax deadlines you cannot miss.',
};

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      {/* 3.1 Hero Section */}
      <HeroSection />

      {/* 3.2 How an option grant works */}
      <GrantLifecycleTimeline />

      {/* 3.3 Four kinds of equity comparison */}
      <EquityComparisonTable />

      {/* 3.4 What Vestly does */}
      <FeaturesSection />

      {/* 3.5 A worked example */}
      <WorkedExampleSection />

      {/* 3.6 Research and learn preview */}
      <ResearchLearnPreview />

      {/* 3.7 What Vestly does not do */}
      <BoundariesSection />

      {/* 3.8 FAQ Section */}
      <FaqSection />
    </div>
  );
}
