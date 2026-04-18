'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Wallet, ChevronDown, LogOut, Copy } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button, Badge } from '@/components/ui';
import { formatINR, cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, shortAddress, address, totalPortfolioINR, disconnect, connect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLandingPage = pathname === '/';

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLandingPage && isConnected) return null; // dashboard uses sidebar

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06]"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-black text-xs">FP</span>
        </div>
        <span className="font-bold text-white text-lg hidden sm:block">FlowPay</span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-400 rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/[0.07] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-accent-500" />
                <span className="text-sm font-medium text-slate-300 hidden sm:block">{shortAddress}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl p-3 shadow-card-hover z-10"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 p-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{shortAddress}</p>
                      <p className="text-xs text-slate-500">{formatINR(totalPortfolioINR)} portfolio</p>
                    </div>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                  <button
                    onClick={() => { disconnect(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <Button onClick={() => connect()} variant="brand" size="sm" icon={<Wallet className="w-4 h-4" />}>
            Connect Wallet
          </Button>
        )}
      </div>
    </motion.nav>
  );
}
