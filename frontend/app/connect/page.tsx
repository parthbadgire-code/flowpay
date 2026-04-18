'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/lib/supabase';

export default function ConnectPage() {
  const router = useRouter();
  const { tryDemo } = useWallet();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const isValid = email.includes('@') && password.length >= 1;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Auth succeeded — also hydrate demo wallet state then redirect
    await tryDemo();
    router.push('/dashboard');
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(124,110,255,0.18)',
    borderRadius: '0.875rem',
    color: 'white',
  };

  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0D0D14' }}
    >
      {/* Background glows */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(107,92,231,0.12) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '0', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,110,255,0.07) 0%, transparent 70%)' }} />

      {/* FlowPay logo above card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link href="/">
          <span
            className="text-3xl font-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            FlowPay
          </span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm relative z-10"
        style={{
          background: 'rgba(22, 20, 42, 0.9)',
          border: '1px solid rgba(124,110,255,0.15)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <h1 className="text-2xl font-black text-white text-center mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400 text-center mb-7">
          Sign in to your FlowPay account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full py-3 px-4 text-sm placeholder-slate-600 outline-none transition-all"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,110,255,0.5)'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(124,110,255,0.18)'; }}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Password</label>
              <button
                type="button"
                className="text-xs transition-colors"
                style={{ color: '#A99BFF' }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#C4B5FD'; }}
                onMouseLeave={e => { (e.currentTarget).style.color = '#A99BFF'; }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full py-3 px-4 pr-11 text-sm placeholder-slate-600 outline-none transition-all"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,110,255,0.5)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(124,110,255,0.18)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            style={{
              background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 60%, #6B5CE7 100%)',
              borderRadius: '9999px',
              boxShadow: isValid ? '0 4px 20px rgba(124,110,255,0.4)' : 'none',
            }}
            onMouseEnter={e => { if (isValid && !loading) (e.currentTarget).style.boxShadow = '0 6px 28px rgba(124,110,255,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget).style.boxShadow = isValid ? '0 4px 20px rgba(124,110,255,0.4)' : 'none'; }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-5">
          New to FlowPay?{' '}
          <Link href="/signup" className="font-medium transition-colors" style={{ color: '#A99BFF' }}>
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
