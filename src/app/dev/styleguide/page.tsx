'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import {
  Button,
  LinkButton,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
  Switch,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Callout,
  Dialog,
  Popover,
  Tooltip,
  Skeleton,
  EmptyState,
  Stat,
  Stepper,
  ProgressBar,
  KeyValueList,
  Section,
  PageHeader,
  Footnotes,
  Figure,
  Money,
  Units,
  DateText,
  Logo,
  ToastProvider,
  useToast,
} from '@/components/ui';

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <ToastProvider>
      <StyleguideContent />
    </ToastProvider>
  );
}

function StyleguideContent() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('tab1');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [progressVal, setProgressVal] = useState(45);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('vestly_theme', next);
    } catch {}
  };

  const contrastPairs = [
    { name: 'Paper / Ink', light: '14.2:1 (AAA)', dark: '14.5:1 (AAA)' },
    { name: 'Paper / Muted', light: '5.6:1 (AA)', dark: '7.2:1 (AA)' },
    { name: 'Surface / Ink', light: '16.5:1 (AAA)', dark: '13.8:1 (AAA)' },
    { name: 'Accent / Button Text', light: '6.8:1 (AA)', dark: '10.4:1 (AAA)' },
    { name: 'Gain / Paper', light: '5.4:1 (AA)', dark: '10.7:1 (AAA)' },
    { name: 'Loss / Paper', light: '5.1:1 (AA)', dark: '6.8:1 (AA)' },
    { name: 'Warn / Paper', light: '5.2:1 (AA)', dark: '8.9:1 (AAA)' },
    { name: 'Info / Paper', light: '7.3:1 (AA)', dark: '8.3:1 (AAA)' },
  ];

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        eyebrow="Internal Design System"
        title="Component Styleguide"
        contextSentence="Reference implementations of all Ledger primitives, contrast audits, and typography tokens."
        actions={
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            Toggle theme ({theme})
          </Button>
        }
      />

      {/* 1. Color Tokens & Contrast Audit */}
      <Section
        title="Color tokens and contrast audit"
        description="All background/foreground pairs satisfy WCAG AA or AAA requirements."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pairing</TableHead>
              <TableHead numeric>Light mode contrast</TableHead>
              <TableHead numeric>Dark mode contrast</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contrastPairs.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-mono text-xs">{p.name}</TableCell>
                <TableCell numeric className="font-mono text-xs text-gain">
                  {p.light}
                </TableCell>
                <TableCell numeric className="font-mono text-xs text-gain">
                  {p.dark}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      {/* 2. Brand & Logo */}
      <Section title="Logo and Brand Mark">
        <div className="flex items-center gap-8 p-4 bg-surface border border-rule rounded-sm">
          <Logo size="sm" />
          <Logo size="md" />
          <Logo size="lg" />
          <Logo showWordmark={false} size="lg" />
        </div>
      </Section>

      {/* 3. Typography */}
      <Section title="Typography">
        <div className="space-y-4 p-4 bg-surface border border-rule rounded-sm">
          <div>
            <p className="text-[11px] font-mono uppercase text-muted">Newsreader Serif (Headings & Large Figures)</p>
            <p className="font-serif text-3xl text-ink">Your equity at a glance</p>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-muted">IBM Plex Sans (Body, Labels, Controls)</p>
            <p className="font-sans text-sm text-ink max-w-xl">
              Vestly models your vesting schedule, early exercise options, and estimated AMT exposure.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-muted">IBM Plex Mono (Tabular Numbers & Data)</p>
            <p className="font-mono text-sm tabular-nums text-ink">
              12,000 units @ $8.50 / share = $102,000 total strike
            </p>
          </div>
        </div>
      </Section>

      {/* 4. Buttons */}
      <Section title="Buttons and LinkButtons">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary button</Button>
            <Button variant="secondary">Secondary button</Button>
            <Button variant="ghost">Ghost button</Button>
            <Button variant="danger">Danger button</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small (28px)</Button>
            <Button size="md">Medium (34px)</Button>
            <Button size="lg">Large (40px)</Button>
            <LinkButton href="#test" size="sm">LinkButton</LinkButton>
          </div>
        </div>
      </Section>

      {/* 5. Form Fields & Controls */}
      <Section title="Form inputs and fields">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface border border-rule rounded-sm">
          <Field label="Share strike price" hint="Exercise cost per option share in USD" required>
            <Input prefixNode="$" defaultValue="8.50" />
          </Field>

          <Field label="Vesting schedule type" required>
            <Select
              options={[
                { value: '4_YEAR_1_YEAR_CLIFF', label: '4 years with 1-year cliff' },
                { value: '3_YEAR_MONTHLY', label: '3 years monthly (no cliff)' },
              ]}
            />
          </Field>

          <Field label="Grant notes and conditions" error="Notes cannot exceed 500 characters">
            <Textarea defaultValue="Initial engineering grant." />
          </Field>

          <div className="space-y-4 pt-2">
            <Checkbox
              label="Early-exercisable grant"
              description="Check if company bylaws permit early exercise before vesting."
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
            />

            <Switch
              label="Email deadline notifications"
              description="Receive notice 14 days before exercise window expires."
              checked={switchChecked}
              onChange={setSwitchChecked}
            />
          </div>
        </div>
      </Section>

      {/* 6. Tabs & Steppers */}
      <Section title="Tabs and Stepper">
        <div className="space-y-6">
          <Tabs
            tabs={[
              { id: 'tab1', label: 'Summary' },
              { id: 'tab2', label: 'Vesting schedule', badge: '37' },
              { id: 'tab3', label: 'Tax scenarios' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <Stepper
            steps={[
              { id: 1, label: 'Company' },
              { id: 2, label: 'Terms' },
              { id: 3, label: 'Vesting' },
              { id: 4, label: 'Review' },
            ]}
            currentStep={stepperStep}
            onStepClick={setStepperStep}
          />
        </div>
      </Section>

      {/* 7. Badges, Callouts & Stats */}
      <Section title="Badges, Callouts and Stats">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Badge tone="neutral">Unvested</Badge>
            <Badge tone="gain">In the money (+$18.00)</Badge>
            <Badge tone="loss">Underwater (-$4.50)</Badge>
            <Badge tone="warn">Expiring in 30 days</Badge>
            <Badge tone="info">Section 83(b) eligible</Badge>
            <Badge tone="accent">Vesting active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Callout variant="info" title="Tax timing notice">
              ISO exercises only incur potential AMT preference items, not immediate ordinary income.
            </Callout>
            <Callout variant="warn" title="Filing deadline warning">
              Section 83(b) elections must be postmarked strictly within 30 days of share purchase.
            </Callout>
            <Callout variant="note" title="Assumed valuation">
              FMV is based on Stripe Series I valuation as of March 2024.
            </Callout>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface border border-rule rounded-sm">
            <Stat label="Estimated gross value" value="$318,000" footnoteMarker="[1]" />
            <Stat label="Total exercise cost" value="$102,000" />
            <Stat
              label="Estimated net spread"
              value="$216,000"
              change={{ value: '+112%', type: 'gain' }}
            />
            <Stat label="Vested units" value="6,250" note="of 12,000 total" />
          </div>
        </div>
      </Section>

      {/* 8. Progress and KeyValueList */}
      <Section title="Progress and KeyValueList">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-surface border border-rule rounded-sm">
          <div className="space-y-4">
            <ProgressBar label="Vesting progress" value={progressVal} showPercent />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setProgressVal(Math.max(0, progressVal - 10))}>-10%</Button>
              <Button size="sm" onClick={() => setProgressVal(Math.min(100, progressVal + 10))}>+10%</Button>
            </div>
            <Skeleton height={20} className="w-full" />
            <Skeleton height={34} className="w-3/4" />
          </div>

          <KeyValueList
            items={[
              { key: 'grant', label: 'Grant identifier', value: 'STRIPE-ISO-2022-A' },
              { key: 'type', label: 'Option type', value: 'ISO (Incentive Stock Option)' },
              { key: 'strike', label: 'Strike price', value: '$8.50', numeric: true },
              { key: 'fmv', label: 'Latest FMV', value: '$26.50', numeric: true },
            ]}
          />
        </div>
      </Section>

      {/* 9. Formatting & Figures */}
      <Section title="Figure popover and Format components">
        <div className="p-4 bg-surface border border-rule rounded-sm space-y-4">
          <p className="text-sm">
            Click this figure to inspect formula:{' '}
            <Figure
              value="$216,000"
              marker="[2]"
              calculation={{
                title: 'Estimated Net Spread Calculation',
                asOfDate: '18 Oct 2026',
                inputs: [
                  { name: 'Vested units', value: '12,000' },
                  { name: 'Fair market value per share', value: '$26.50' },
                  { name: 'Option strike price', value: '$8.50' },
                ],
                steps: [
                  'Spread per share = $26.50 - $8.50 = $18.00',
                  'Total pre-tax value = 12,000 units × $18.00 = $216,000',
                ],
                note: 'Taxes and transaction fees are not subtracted in this gross figure.',
              }}
            />
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <div>Money: <Money amount={1200} /></div>
            <div>Signed Money: <Money amount={-1200} signed /></div>
            <div>Compact: <Money amount={65000000000} compact /></div>
            <div>Units: <Units count={12000} suffix="shares" /></div>
            <div>DateText: <DateText value="2026-10-18T10:00:00Z" /></div>
            <div>Relative: <DateText value={Date.now() + 14 * 86400000} relative /></div>
          </div>
        </div>
      </Section>

      {/* 10. Modals & Dialogs */}
      <Section title="Dialog and Toasts">
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => toast.success('Grant record saved successfully', 'Success')}>
            Toast success
          </Button>
          <Button onClick={() => toast.warn('Approaching 30-day deadline', 'Warning')}>
            Toast warning
          </Button>
          <Button onClick={() => toast.error('Failed to update valuation', 'Error')}>
            Toast error
          </Button>
        </div>

        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Confirm action"
          description="Are you sure you want to record an early exercise for this grant?"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              Early exercising creates an immediate Section 83(b) reminder with a 30-day deadline.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsDialogOpen(false);
                  toast.success('Early exercise recorded');
                }}
              >
                Confirm exercise
              </Button>
            </div>
          </div>
        </Dialog>
      </Section>

      {/* 11. Empty State */}
      <Section title="Empty state">
        <div className="bg-surface border border-rule rounded-sm p-6">
          <EmptyState
            title="No grants recorded"
            description="Add your first stock option grant to track vesting milestones and exercise costs."
            action={<Button variant="primary" size="sm">Add a grant</Button>}
          />
        </div>
      </Section>

      {/* Footnotes */}
      <Footnotes
        notes={[
          { marker: '[1]', text: 'FMV based on the latest 409A or market price as of 18 Oct 2026.' },
          { marker: '[2]', text: 'Assumes federal ordinary rate of 32% and capital gains rate of 20%.' },
        ]}
      />
    </div>
  );
}
