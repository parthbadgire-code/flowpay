'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

/**
 * Wrap any page that requires the user to be signed in.
 * - While Supabase resolves the session: shows a spinner.
 * - If no session: immediately redirects to /connect.
 * - If signed in: renders children normally.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/connect');
    }
  }, [user, loading, router]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#080808' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-9 h-9 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#B87333', borderRightColor: '#00D4AA' }}
        />
        <p
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: '#B87333' }}
        >
          Verifying session…
        </p>
      </div>
    );
  }

  // ── Not signed in — render nothing while redirect fires ───────────────────
  if (!user) return null;

  return <>{children}</>;
}
