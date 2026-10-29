'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, ShieldCheck, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic password rule indicators
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password);

  const validate = () => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (!hasMinLength) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!hasNumberOrSymbol) {
      errors.password = 'Password must include at least one number or special character.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context, What is stored, and Privacy guarantee */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              New account
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Start tracking your equity
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              Create your personal equity ledger. Enter your option agreements once;
              model taxes, cliffs, and liquidation scenarios indefinitely.
            </p>
          </div>

          {/* What is stored box */}
          <div className="border border-rule rounded-xs bg-surface p-4 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted block">
                What is stored
              </span>
              <h2 className="font-serif text-sm font-bold text-ink">
                Your private portfolio records
              </h2>
            </div>

            <ul className="text-xs text-muted space-y-2 font-sans">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                <span>Grant details: share count, strike price, and vesting schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                <span>Personal tax defaults: state code, filing status, and income bracket</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                <span>Uploaded agreement files stored in private local directories</span>
              </li>
            </ul>
          </div>

          {/* Privacy and zero sharing guarantee */}
          <div className="border-t border-rule pt-4 space-y-2 text-xs text-muted font-sans">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold text-ink block">Privacy guarantee</span>
                <span className="text-[11px] leading-relaxed block">
                  Zero third-party trackers. We never sell your equity information or train AI models on it.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="md:col-span-7 bg-surface border border-rule rounded-xs p-6 sm:p-7 space-y-5">
          <div className="border-b border-rule pb-3">
            <h2 className="font-serif text-lg font-bold text-ink">
              Create your account
            </h2>
            <p className="text-xs text-muted">
              Enter your details to initialize your equity statement.
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
                <span>Sign up with Google</span>
              </a>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-rule w-full" />
                <span className="bg-surface px-2 text-[10px] font-mono text-muted uppercase tracking-wider">
                  or register with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            {/* Name Field */}
            <div className="space-y-1">
              <label htmlFor="register-name" className="block text-xs font-medium text-ink">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Alex Morgan"
                className={`w-full px-3 py-2 text-xs font-sans rounded-xs border ${
                  fieldErrors.name ? 'border-loss' : 'border-rule'
                } bg-paper text-ink focus:outline-hidden focus:border-accent`}
                disabled={loading}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-loss font-sans">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="register-email" className="block text-xs font-medium text-ink">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="alex@example.com"
                className={`w-full px-3 py-2 text-xs font-sans rounded-xs border ${
                  fieldErrors.email ? 'border-loss' : 'border-rule'
                } bg-paper text-ink focus:outline-hidden focus:border-accent`}
                disabled={loading}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-loss font-sans">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="register-password" className="block text-xs font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
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
                  autoComplete="new-password"
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

              {/* Password rules shown before submitting */}
              <div className="p-2.5 mt-2 rounded-xs bg-sunk/30 border border-rule/60 space-y-1.5 text-[11px] font-mono">
                <span className="text-[10px] text-muted uppercase tracking-wider block font-sans">
                  Password requirements:
                </span>
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-gain" aria-hidden="true" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                  )}
                  <span className={hasMinLength ? 'text-gain font-medium' : 'text-muted'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumberOrSymbol ? (
                    <Check className="w-3.5 h-3.5 text-gain" aria-hidden="true" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                  )}
                  <span className={hasNumberOrSymbol ? 'text-gain font-medium' : 'text-muted'}>
                    At least one number or special character
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xs font-sans text-xs font-medium bg-ink text-surface hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="pt-4 border-t border-rule text-center text-xs text-muted">
            <span>Already have an account? </span>
            <Link
              href={`/login${nextUrl !== '/dashboard' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="text-accent hover:underline font-medium"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
