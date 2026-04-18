'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Wallet, Shield, LayoutDashboard, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useCreditLine } from '@/hooks/useCreditLine';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <path d="M8 16L13 11L16 14L20 10L24 16L20 20L16 17L13 20L8 16Z"
        fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00D4AA" />
          <stop offset="1" stopColor="#00FF87" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Nav link ─────────────────────────────────────────────────────────────────
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-xl ${
        active
          ? 'text-[#00D4AA]'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #00D4AA, #00FF87)' }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
        />
      )}
    </Link>
  );
}

// ─── Health Factor badge ───────────────────────────────────────────────────────
function HFBadge({ hf, risk }: { hf: number; risk: string }) {
  const color = risk === 'safe' ? '#00FF87' : risk === 'moderate' ? '#FFA858' : '#FF5E5E';
  const bg = risk === 'safe' ? 'rgba(0,255,135,0.08)' : risk === 'moderate' ? 'rgba(255,168,88,0.08)' : 'rgba(255,94,94,0.08)';
  const border = risk === 'safe' ? 'rgba(0,255,135,0.25)' : risk === 'moderate' ? 'rgba(255,168,88,0.25)' : 'rgba(255,94,94,0.25)';

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      HF {hf === 999 ? '∞' : hf.toFixed(2)}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, isDemo, tryDemo, address } = useWallet();
  const { user } = useAuth();
  const { healthFactor, riskLevel, activeLoans } = useCreditLine();
  const isLandingPage = pathname === '/';

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/deposit', label: 'Deposit' },
    { href: '/payment', label: 'Payments' },
    { href: '/lottery', label: 'Lottery' },
  ];

  return (
    <>
      {/* Demo Banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] text-xs font-semibold py-1.5 text-center flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255, 168, 88, 0.1)',
              borderBottom: '1px solid rgba(255, 168, 88, 0.2)',
              color: '#FFA858',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#FFA858' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#FFA858' }} />
            </span>
            Demo Mode — Using simulated balances & mock price feeds
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <motion.nav
        className={`fixed left-0 right-0 z-50 flex items-center gap-6 px-6 py-3 transition-all duration-300 ${isDemo ? 'top-6' : 'top-0'}`}
        style={{
          background: 'rgba(13, 20, 18, 0.92)',
          borderBottom: '1px solid rgba(0, 212, 170, 0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative">
            <LogoMark />
            <div
              className="absolute inset-0 rounded-xl blur-md opacity-50"
              style={{ background: 'linear-gradient(135deg, #00D4AA, #00FF87)' }}
            />
          </div>
          <span
            className="font-extrabold text-xl hidden sm:block tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FlowPay
          </span>
        </Link>

        {/* Center Nav Links — only shown when logged in */}
        {user && (
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(link => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={pathname === link.href}
              />
            ))}
          </div>
        )}

        <div className="flex-1 hidden md:block" />

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 ml-auto">
          {user ? (
            <>
              {isConnected ? (
                <>
                  {/* HF badge — shows when user has active loans */}
                  {activeLoans.length > 0 && (
                    <Link href="/dashboard">
                      <HFBadge hf={healthFactor} risk={riskLevel} />
                    </Link>
                  )}

                  {/* Dashboard button */}
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: pathname === '/dashboard' ? 'rgba(0,212,170,0.15)' : 'rgba(0,212,170,0.07)',
                      border: `1px solid ${pathname === '/dashboard' ? 'rgba(0,212,170,0.4)' : 'rgba(0,212,170,0.2)'}`,
                      color: '#00D4AA',
                    }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  {/* Notification bell */}
                  <button
                    className="relative p-2 rounded-xl transition-all hover:bg-white/5"
                    style={{ color: '#64748B' }}
                  >
                    <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    {activeLoans.length > 0 && (
                      <span
                        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: '#00D4AA' }}
                      />
                    )}
                  </button>

                  <ConnectButton
                    showBalance={false}
                    chainStatus="icon"
                    accountStatus="avatar"
                  />
                  <UserMenu />
                </>
              ) : (
                <div className="flex gap-2">
                  {/* Dashboard link even when not connected */}
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      border: '1px solid rgba(0,212,170,0.2)',
                      color: '#00D4AA',
                      background: 'rgba(0,212,170,0.06)',
                    }}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  <Button
                    onClick={() => tryDemo()}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    Try Demo
                  </Button>

                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
                          color: '#0D1412',
                          boxShadow: '0 4px 16px rgba(0,212,170,0.35)',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </button>
                    )}
                  </ConnectButton.Custom>
                  <UserMenu />
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              {/* Dashboard CTA for non-logged-in users */}
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: '1px solid rgba(0,212,170,0.2)',
                  color: '#00D4AA',
                  background: 'rgba(0,212,170,0.06)',
                }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              <Button
                onClick={() => tryDemo()}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                Try Demo
              </Button>

              <button
                onClick={() => window.location.href = '/connect'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
                  color: '#0D1412',
                  boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </motion.nav>
    </>
  );
}
