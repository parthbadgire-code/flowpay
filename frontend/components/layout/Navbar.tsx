'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Wallet } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, isDemo, tryDemo } = useWallet();
  const { user } = useAuth();
  const isLandingPage = pathname === '/';

  if (!isLandingPage && isConnected) return null; // dashboard uses sidebar

  return (
    <>
      <AnimatePresence>
        {isDemo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/10 border-b border-amber-500/20 text-amber-500 text-xs font-semibold py-1.5 text-center flex items-center justify-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Demo Mode: Using simulated balances and liquidity
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        className={`fixed left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 ${isDemo ? 'top-6' : 'top-0'}`}
        style={{ background: 'rgba(13,13,20,0.9)', borderBottom: '1px solid rgba(124,110,255,0.1)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/flowpay-logo.png"
            alt="FlowPay logo"
            width={44}
            height={44}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 0 14px rgba(124,110,255,0.8)) drop-shadow(0 0 4px rgba(169,155,255,0.6))' }}
          />
          <span
            className="font-black text-xl hidden sm:block"
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isConnected ? (
                <>
                  <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all hidden sm:block">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-400 rounded-full" />
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
                  <Button onClick={() => tryDemo()} variant="outline" size="sm" className="hidden sm:flex">
                    Try Demo
                  </Button>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button onClick={openConnectModal} variant="brand" size="sm" icon={<Wallet className="w-4 h-4" />}>
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
                  <UserMenu />
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => tryDemo()} variant="outline" size="sm" className="hidden sm:flex">
                Try Demo
              </Button>
              <Button onClick={() => window.location.href = '/connect'} variant="brand" size="sm" icon={<Wallet className="w-4 h-4" />}>
                Connect Wallet
              </Button>
            </div>
          )}
        </div>
      </motion.nav>
    </>
  );
}
