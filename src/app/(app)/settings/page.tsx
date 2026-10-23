'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Calculator,
  Bell,
  SunMoon,
  Database,
  Download,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Dialog } from '@/components/ui/Dialog';
import { Section } from '@/components/ui/Section';
import { useToast } from '@/components/ui/Toast';
import { NextSteps } from '@/components/layout/NextSteps';

const US_STATES = [
  { value: 'AL', label: 'Alabama (AL)' },
  { value: 'AK', label: 'Alaska (AK - 0% state income tax)' },
  { value: 'AZ', label: 'Arizona (AZ)' },
  { value: 'AR', label: 'Arkansas (AR)' },
  { value: 'CA', label: 'California (CA - up to 13.3%)' },
  { value: 'CO', label: 'Colorado (CO - 4.4%)' },
  { value: 'CT', label: 'Connecticut (CT)' },
  { value: 'DE', label: 'Delaware (DE)' },
  { value: 'DC', label: 'District of Columbia (DC)' },
  { value: 'FL', label: 'Florida (FL - 0% state income tax)' },
  { value: 'GA', label: 'Georgia (GA)' },
  { value: 'HI', label: 'Hawaii (HI)' },
  { value: 'ID', label: 'Idaho (ID)' },
  { value: 'IL', label: 'Illinois (IL - 4.95% flat)' },
  { value: 'IN', label: 'Indiana (IN)' },
  { value: 'IA', label: 'Iowa (IA)' },
  { value: 'KS', label: 'Kansas (KS)' },
  { value: 'KY', label: 'Kentucky (KY)' },
  { value: 'LA', label: 'Louisiana (LA)' },
  { value: 'ME', label: 'Maine (ME)' },
  { value: 'MD', label: 'Maryland (MD)' },
  { value: 'MA', label: 'Massachusetts (MA - 5.0% flat)' },
  { value: 'MI', label: 'Michigan (MI - 4.25% flat)' },
  { value: 'MN', label: 'Minnesota (MN)' },
  { value: 'MS', label: 'Mississippi (MS)' },
  { value: 'MO', label: 'Missouri (MO)' },
  { value: 'MT', label: 'Montana (MT)' },
  { value: 'NE', label: 'Nebraska (NE)' },
  { value: 'NV', label: 'Nevada (NV - 0% state income tax)' },
  { value: 'NH', label: 'New Hampshire (NH - 0% on earned income)' },
  { value: 'NJ', label: 'New Jersey (NJ - up to 10.75%)' },
  { value: 'NM', label: 'New Mexico (NM)' },
  { value: 'NY', label: 'New York (NY - up to 10.9%)' },
  { value: 'NC', label: 'North Carolina (NC - 4.75% flat)' },
  { value: 'ND', label: 'North Dakota (ND)' },
  { value: 'OH', label: 'Ohio (OH)' },
  { value: 'OK', label: 'Oklahoma (OK)' },
  { value: 'OR', label: 'Oregon (OR - up to 9.9%)' },
  { value: 'PA', label: 'Pennsylvania (PA - 3.07% flat)' },
  { value: 'RI', label: 'Rhode Island (RI)' },
  { value: 'SC', label: 'South Carolina (SC)' },
  { value: 'SD', label: 'South Dakota (SD - 0% state income tax)' },
  { value: 'TN', label: 'Tennessee (TN - 0% state income tax)' },
  { value: 'TX', label: 'Texas (TX - 0% state income tax)' },
  { value: 'UT', label: 'Utah (UT - 4.85% flat)' },
  { value: 'VT', label: 'Vermont (VT)' },
  { value: 'VA', label: 'Virginia (VA - 5.75%)' },
  { value: 'WA', label: 'Washington (WA - 0% state income tax)' },
  { value: 'WV', label: 'West Virginia (WV)' },
  { value: 'WI', label: 'Wisconsin (WI)' },
  { value: 'WY', label: 'Wyoming (WY - 0% state income tax)' },
];

const FILING_STATUSES = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED_FILING_JOINTLY', label: 'Married filing jointly' },
  { value: 'MARRIED_FILING_SEPARATELY', label: 'Married filing separately' },
  { value: 'HEAD_OF_HOUSEHOLD', label: 'Head of household' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [filingStatus, setFilingStatus] = useState('SINGLE');
  const [stateCode, setStateCode] = useState('CA');
  const [annualIncome, setAnnualIncome] = useState('150000');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [advanceDays, setAdvanceDays] = useState('14');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync hash tab
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (['profile', 'tax', 'notifications', 'appearance', 'data'].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.profile?.name || '');
          setEmail(data.profile?.email || '');
          setCreatedAt(data.profile?.createdAt ? new Date(data.profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
          setFilingStatus(data.taxDefaults?.filingStatus || 'SINGLE');
          setStateCode(data.taxDefaults?.stateCode || 'CA');
          setAnnualIncome(String(data.taxDefaults?.annualIncome ?? 150000));
          setEmailAlerts(data.notifications?.emailAlerts ?? true);
          setInAppAlerts(data.notifications?.inAppAlerts ?? true);
          setAdvanceDays(String(data.notifications?.advanceReminderDays ?? 14));
        }
      })
      .catch(() => {
        toast.error('Failed to load settings', 'Error');
      })
      .finally(() => setLoading(false));

    // Theme preference from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vestly_theme');
      if (stored === 'light' || stored === 'dark') {
        setThemePreference(stored);
      } else {
        setThemePreference('system');
      }
    }
  }, [toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        toast.success('Your personal name was saved.', 'Profile updated');
      } else {
        throw new Error('Update failed');
      }
    } catch {
      toast.error('Unable to update profile.', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTaxDefaults = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filingStatus,
          stateCode,
          annualIncome: parseFloat(annualIncome) || 0,
        }),
      });
      if (res.ok) {
        toast.success(
          'Calculators and scenario models will now prefill with these parameters.',
          'Tax defaults saved'
        );
      } else {
        throw new Error('Update failed');
      }
    } catch {
      toast.error('Unable to save tax defaults.', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailAlerts,
          inAppAlerts,
          advanceReminderDays: parseInt(advanceDays, 10) || 14,
        }),
      });
      if (res.ok) {
        toast.success('Reminder timings updated.', 'Notification preferences saved');
      } else {
        throw new Error('Update failed');
      }
    } catch {
      toast.error('Unable to update notifications.', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = (theme: 'light' | 'dark' | 'system') => {
    setThemePreference(theme);
    if (typeof window !== 'undefined') {
      if (theme === 'system') {
        localStorage.removeItem('vestly_theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        localStorage.setItem('vestly_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      toast.info(`Appearance set to ${theme}.`, 'Theme changed');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim().toLowerCase() !== 'delete my account') {
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (res.ok) {
        toast.info('Your data has been removed.', 'Account deleted');
        router.push('/');
        router.refresh();
      } else {
        throw new Error('Deletion failed');
      }
    } catch {
      toast.error('Failed to delete account.', 'Error');
      setDeletingAccount(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'tax', label: 'Tax defaults' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'data', label: 'Data & privacy' },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <PageHeader
        eyebrow="Account & Preferences"
        title="Settings"
        contextSentence="Manage your profile, saved tax defaults, reminder rules, and data exports."
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
          <Section title="Personal profile" description="Your name and primary login address.">
            <div className="space-y-4">
              <Field label="Full name" id="profile-name">
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={loading || saving}
                />
              </Field>

              <Field label="Email address" id="profile-email" hint="Contact email cannot be modified in demo mode.">
                <Input id="profile-email" value={email} readOnly disabled className="bg-sunk/60 text-muted" />
              </Field>

              {createdAt && (
                <div className="text-xs text-muted font-mono">
                  Member since: <span className="text-ink font-medium">{createdAt}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </Section>
        </form>
      )}

      {/* Tab 2: Tax defaults */}
      {activeTab === 'tax' && (
        <form onSubmit={handleSaveTaxDefaults} className="space-y-6 max-w-xl">
          <Section
            title="Tax planning defaults"
            description="These assumptions are applied by default across your equity calculator, scenarios, and AMT projections."
          >
            <Callout variant="info" title="Tax calculations are deterministic estimates">
              Saved tax rates are for modeling educational scenarios only. Consult a certified CPA or tax attorney for actual tax filings.
            </Callout>

            <div className="space-y-4 mt-4">
              <Field label="Federal filing status" id="tax-filing-status" hint="Used for federal AMT exemption and standard tax brackets.">
                <Select
                  id="tax-filing-status"
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value)}
                  options={FILING_STATUSES}
                  disabled={loading || saving}
                />
              </Field>

              <Field label="State of residence" id="tax-state" hint="Determines state income tax rate on non-qualified options and capital gains.">
                <Select
                  id="tax-state"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  options={US_STATES}
                  disabled={loading || saving}
                />
              </Field>

              <Field label="Estimated annual ordinary income" id="tax-income" hint="Wage or salary income (excluding equity gains). Helps estimate AMT phaseout.">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-xs select-none">
                    $
                  </span>
                  <Input
                    id="tax-income"
                    type="number"
                    min="0"
                    step="1000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="pl-7 font-mono tabular-nums"
                    disabled={loading || saving}
                  />
                </div>
              </Field>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save tax defaults'}
              </Button>
            </div>
          </Section>
        </form>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-6 max-w-xl">
          <Section
            title="Reminder preferences"
            description="Control how and when you are notified about vesting milestones, Section 83(b) deadlines, and option expirations."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 border border-rule rounded-xs bg-surface">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-ink">In-app notifications</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Display deadline warnings on your Overview statement and Action center.
                  </p>
                </div>
                <Switch
                  checked={inAppAlerts}
                  onChange={setInAppAlerts}
                  disabled={loading || saving}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 border border-rule rounded-xs bg-surface">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-ink">Email summary reminders</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Receive email digests before critical dates (such as the 30-day Section 83(b) window).
                  </p>
                </div>
                <Switch
                  checked={emailAlerts}
                  onChange={setEmailAlerts}
                  disabled={loading || saving}
                />
              </div>

              <Field
                label="Advance notice window"
                id="advance-days"
                hint="How many days before a cliff, vest, or expiration event to flag the reminder."
              >
                <Select
                  id="advance-days"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(e.target.value)}
                  options={[
                    { value: '7', label: '7 days in advance' },
                    { value: '14', label: '14 days in advance (recommended)' },
                    { value: '30', label: '30 days in advance' },
                    { value: '60', label: '60 days in advance' },
                    { value: '90', label: '90 days in advance' },
                  ]}
                  disabled={loading || saving}
                />
              </Field>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save notifications'}
              </Button>
            </div>
          </Section>
        </form>
      )}

      {/* Tab 4: Appearance */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 max-w-xl">
          <Section
            title="Appearance theme"
            description="Choose between the quiet paper light palette and the dark ledger palette."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleApplyTheme('light')}
                className={`p-4 rounded-xs border text-left transition-colors ${
                  themePreference === 'light'
                    ? 'border-accent bg-surface ring-1 ring-accent'
                    : 'border-rule bg-paper hover:bg-sunk/50'
                }`}
              >
                <div className="w-full h-12 rounded-2xs bg-[#F7F4EE] border border-[#DDD7CB] mb-2.5 flex items-center justify-center text-[#1A1814] font-serif text-sm font-semibold">
                  Paper
                </div>
                <p className="text-xs font-semibold text-ink">Light paper</p>
                <p className="text-[11px] text-muted mt-0.5">High contrast, printed ledger aesthetic.</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTheme('dark')}
                className={`p-4 rounded-xs border text-left transition-colors ${
                  themePreference === 'dark'
                    ? 'border-accent bg-surface ring-1 ring-accent'
                    : 'border-rule bg-paper hover:bg-sunk/50'
                }`}
              >
                <div className="w-full h-12 rounded-2xs bg-[#14120F] border border-[#2E2A23] mb-2.5 flex items-center justify-center text-[#EDE8DD] font-serif text-sm font-semibold">
                  Ledger
                </div>
                <p className="text-xs font-semibold text-ink">Dark ledger</p>
                <p className="text-[11px] text-muted mt-0.5">Deep warm dark tone, low-glare financial view.</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTheme('system')}
                className={`p-4 rounded-xs border text-left transition-colors ${
                  themePreference === 'system'
                    ? 'border-accent bg-surface ring-1 ring-accent'
                    : 'border-rule bg-paper hover:bg-sunk/50'
                }`}
              >
                <div className="w-full h-12 rounded-2xs bg-sunk border border-rule mb-2.5 flex items-center justify-center text-muted font-sans text-xs">
                  Auto
                </div>
                <p className="text-xs font-semibold text-ink">System default</p>
                <p className="text-[11px] text-muted mt-0.5">Matches your operating system color scheme.</p>
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* Tab 5: Data & privacy */}
      {activeTab === 'data' && (
        <div className="space-y-8 max-w-xl">
          <Section
            title="Export your equity data"
            description="Download all calculations, vesting schedules, and recorded grants for tax preparation or offline backup."
          >
            <div className="space-y-3">
              <a
                href="/api/settings/export?format=csv"
                download
                className="flex items-center justify-between p-3.5 border border-rule rounded-xs bg-surface hover:bg-sunk/40 transition-colors group"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <span>Export grants as CSV</span>
                    <span className="text-[10px] font-mono text-muted uppercase">.csv</span>
                  </p>
                  <p className="text-[11px] text-muted">
                    Tabular spreadsheet format compatible with Excel, Google Sheets, and financial tools.
                  </p>
                </div>
                <Download className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" />
              </a>

              <a
                href="/api/settings/export?format=json"
                download
                className="flex items-center justify-between p-3.5 border border-rule rounded-xs bg-surface hover:bg-sunk/40 transition-colors group"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                    <span>Export full account data as JSON</span>
                    <span className="text-[10px] font-mono text-muted uppercase">.json</span>
                  </p>
                  <p className="text-[11px] text-muted">
                    Complete portfolio record including vesting events, saved scenarios, and action reminders.
                  </p>
                </div>
                <Download className="w-4 h-4 text-muted group-hover:text-accent transition-colors shrink-0" />
              </a>
            </div>
          </Section>

          {/* Destructive Section: Delete Account */}
          <Section
            title="Delete account and data"
            description="Permanently remove your account, recorded grants, uploaded agreements, and tax models."
          >
            <div className="p-4 rounded-xs border border-loss/40 bg-loss/5 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-loss shrink-0 mt-0.5" />
                <div className="text-xs text-ink space-y-1">
                  <p className="font-semibold text-loss">This action is irreversible</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    All grants, uploaded agreements, calculation notes, and reminder histories will be purged immediately from the database and storage.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Delete account and all data</span>
                </Button>
              </div>
            </div>
          </Section>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            title="Permanently delete account?"
            description="To confirm deletion, please type 'delete my account' in the box below."
            maxWidth="md"
          >
            <div className="space-y-4 pt-2">
              <Field label='Type "delete my account" to confirm' id="delete-confirm">
                <Input
                  id="delete-confirm"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  placeholder="delete my account"
                  autoFocus
                />
              </Field>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-rule">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={deletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirmationInput.trim().toLowerCase() !== 'delete my account' ||
                    deletingAccount
                  }
                >
                  {deletingAccount ? 'Deleting...' : 'Delete permanently'}
                </Button>
              </div>
            </div>
          </Dialog>
        </div>
      )}

      {/* Suggested next steps */}
      <NextSteps preset="J5" title="What to do next" />
    </div>
  );
}
