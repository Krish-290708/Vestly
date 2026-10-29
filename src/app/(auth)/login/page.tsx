'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Validate form fields inline
  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setGeneralError('');
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed.');

      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to open sample account.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context, sample account, and storage facts */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              Account access
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Sign in to your equity statement
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              Review your stock option grants, inspect vesting schedules, and calculate
              exercise taxes before making commitments.
            </p>
          </div>

          {/* Sample account access box */}
          <div className="border border-rule rounded-xs bg-surface p-4 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                Instant exploration
              </span>
              <h2 className="font-serif text-sm font-bold text-ink">
                Test with sample data
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Includes 3 pre-seeded grants (Stripe ISOs, Databricks NSOs, Figma RSUs)
                with realistic vesting calendars and tax parameters.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loadingDemo}
              className="w-full py-2.5 px-3 rounded-xs font-sans text-xs font-medium bg-accent text-accent-contrast hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loadingDemo ? 'Opening sample account…' : 'Try it with sample data'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Privacy and security guarantee */}
          <div className="border-t border-rule pt-4 space-y-2 text-xs text-muted font-sans">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold text-ink block">Local storage guarantee</span>
                <span className="text-[11px] leading-relaxed block">
                  All grant details and notes live in your local database. Zero third-party tracking.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="md:col-span-7 bg-surface border border-rule rounded-xs p-6 sm:p-7 space-y-5">
          <div className="border-b border-rule pb-3">
            <h2 className="font-serif text-lg font-bold text-ink">
              Enter credentials
            </h2>
            <p className="text-xs text-muted">
              Sign in with your email address and password.
            </p>
          </div>

          {generalError && (
            <div
              role="alert"
              className="p-3 rounded-xs bg-loss/10 border border-loss/30 text-loss text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Optional Google OAuth button rendered ONLY when configured */}
          {googleClientId && (
            <div className="space-y-4">
              <a
                href="/api/auth/google"
                className="w-full py-2.5 px-4 rounded-xs border border-rule bg-surface hover:bg-sunk text-ink font-sans text-xs font-medium transition-colors flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </a>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-rule w-full" />
                <span className="bg-surface px-2 text-[10px] font-mono text-muted uppercase tracking-wider">
                  or with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-medium text-ink">
                Email address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full px-3 py-2 text-xs font-sans rounded-xs border ${
                    fieldErrors.email ? 'border-loss' : 'border-rule'
                  } bg-paper text-ink focus:outline-hidden focus:border-accent`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-loss font-sans">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-medium text-ink">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 pr-9 text-xs font-sans rounded-xs border ${
                    fieldErrors.password ? 'border-loss' : 'border-rule'
                  } bg-paper text-ink focus:outline-hidden focus:border-accent`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-loss font-sans">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xs font-sans text-xs font-medium bg-ink text-surface hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in to account'}
            </button>
          </form>

          <div className="pt-4 border-t border-rule text-center text-xs text-muted">
            <span>Do not have an account yet? </span>
            <Link
              href={`/register${nextUrl !== '/dashboard' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="text-accent hover:underline font-medium"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
