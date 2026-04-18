'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 space-y-1.5"
    >
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-2">
          {c.pass
            ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
            : <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
          }
          <span className={`text-xs ${c.pass ? 'text-emerald-400' : 'text-slate-600'}`}>{c.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

export function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;
  const isValid = form.email.includes('@') && form.password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    // Small celebration pause then redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const inputBase = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(124,110,255,0.18)',
    borderRadius: '0.875rem',
    color: 'white',
  };

  return (
    <div className="flex flex-col items-center w-full relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-sm relative z-10"
        style={{ background: 'rgba(22, 20, 42, 0.9)', border: '1px solid rgba(124,110,255,0.15)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 16px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(24px)' }}
      >
        <AnimatePresence mode="wait">
          {success ? (
            /* ─ Success state ─ */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))', border: '2px solid rgba(52,211,153,0.4)' }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: '#34d399' }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
              <p className="text-sm text-slate-400">Taking you to your dashboard…</p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #A99BFF, #6B5CE7)' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.4, ease: 'linear' }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* ─ Form ─ */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-black text-white text-center mb-1">Create your account</h1>
              <p className="text-sm text-slate-400 text-center mb-7">Join FlowPay and unify your crypto</p>

              <div className="space-y-3 mb-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    className="w-full py-3 px-4 text-sm placeholder-slate-600 outline-none transition-all"
                    style={inputBase}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(124,110,255,0.5)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(124,110,255,0.18)'; }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Create a password"
                      className="w-full py-3 px-4 pr-11 text-sm placeholder-slate-600 outline-none transition-all"
                      style={inputBase}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(124,110,255,0.5)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(124,110,255,0.18)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={form.confirm}
                      onChange={set('confirm')}
                      placeholder="Repeat your password"
                      className="w-full py-3 px-4 pr-11 text-sm placeholder-slate-600 outline-none transition-all"
                      style={{
                        ...inputBase,
                        borderColor: form.confirm
                          ? (passwordsMatch ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)')
                          : 'rgba(124,110,255,0.18)',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(124,110,255,0.5)'; }}
                      onBlur={(e) => {
                        e.target.style.borderColor = form.confirm
                          ? (passwordsMatch ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)')
                          : 'rgba(124,110,255,0.18)';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirm && !passwordsMatch && (
                    <p className="text-xs text-red-400 mt-1.5 ml-1">Passwords don&apos;t match</p>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 text-center mb-4 bg-red-500/10 rounded-xl py-2 px-3 border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                style={{
                  background: isValid
                    ? 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 60%, #6B5CE7 100%)'
                    : 'rgba(124,110,255,0.3)',
                  borderRadius: '9999px',
                  boxShadow: isValid ? '0 4px 20px rgba(124,110,255,0.4)' : 'none',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link href="/connect" className="text-slate-300 hover:text-white transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
