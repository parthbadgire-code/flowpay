'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-300 hover:bg-primary-600/40 hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,212,170,0.2)]"
      >
        <span className="font-bold text-sm">
          {user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-3 w-60 rounded-2xl p-2 border border-white/10 shadow-2xl z-50 flex flex-col gap-1"
              style={{ background: 'rgba(22, 20, 42, 0.95)', backdropFilter: 'blur(24px)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
            >
              <div className="px-3 py-3 border-b border-white/10 mb-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#00D4AA] mb-1">Account Profile</p>
                <p className="text-sm font-semibold text-white truncate" title={user.email}>{user.email}</p>
              </div>
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await signOut();
                  router.push('/');
                }}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
