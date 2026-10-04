'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register account');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 sm:my-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold mx-auto shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create Your Vestly Account
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal stock option grants securely
        </p>
      </div>

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-card p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Work or Personal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
