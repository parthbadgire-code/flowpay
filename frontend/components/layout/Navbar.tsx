'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, QrCode, Settings, LogOut, Copy, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lottery',   label: 'Lottery' },
  { href: '/history',   label: 'History' },
];

export function Navbar() {
  const pathname  = usePathname();
  const { isConnected, shortAddress, address, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied]   = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ background: 'rgba(13,13,20,0.9)', borderBottom: '1px solid rgba(124,110,255,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center">
          <span
            className="font-black text-xl"
            style={{
              background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FlowPay
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors relative pb-0.5',
                    active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #A99BFF, #7C6EFF)' }}
                    />
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            {/* QR icon */}
            <Link href="/payment">
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <QrCode className="w-5 h-5" />
              </button>
            </Link>

            {/* Settings icon */}
            <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Settings className="w-5 h-5" />
            </button>

            {/* Avatar + dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #A99BFF, #6B5CE7)' }}
              >
                {shortAddress.substring(2, 4).toUpperCase()}
              </button>

              {menuOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-3 w-60 rounded-2xl p-3 z-10"
                  style={{ background: '#1A1830', border: '1px solid rgba(124,110,255,0.2)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 p-2 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A99BFF, #6B5CE7)' }}>
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{shortAddress}</p>
                      <p className="text-xs text-slate-500">Connected</p>
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
          <Link href="/connect">
            <button
              className="btn-pill-outline px-5 py-2 text-sm font-semibold"
              style={{ border: '1px solid rgba(169,155,255,0.5)', color: '#A99BFF', borderRadius: '9999px', background: 'transparent', transition: 'all 0.2s' }}
            >
              Login
            </button>
          </Link>
        )}
      </div>
    </motion.nav>
  );
}
