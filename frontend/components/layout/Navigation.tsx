'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowDownToLine, QrCode, Trophy, Gem, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { formatINR } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deposit',   label: 'Deposit',   icon: ArrowDownToLine },
  { href: '/payment',   label: 'Pay',       icon: QrCode },
  { href: '/lottery',   label: 'Lottery',   icon: Trophy },
  { href: '/nfts',      label: 'NFTs',      icon: Gem },
];

export function Sidebar() {
  const pathname = usePathname();
  const { flowPayBalance } = useFlowPayBalance();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0D0D15] border-r border-white/[0.06] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-glow-sm">
          <span className="text-white font-black text-sm">FP</span>
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-none">FlowPay</p>
          <p className="text-xs text-slate-500 mt-0.5">Unified Spending</p>
        </div>
      </div>

      {/* FlowPay Balance Chip */}
      <div className="mx-4 mt-4 mb-2 rounded-xl bg-gradient-to-r from-primary-600/20 to-accent-500/10 border border-primary-500/20 p-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">FlowPay Balance</p>
        <p className="text-xl font-bold gradient-text">{formatINR(flowPayBalance)}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-primary-600/20 border border-primary-500/30 text-primary-300'
                    : 'text-slate-500 hover:text-white hover:bg-white/5',
                )}
                whileHover={{ x: 2 }}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-primary-400' : 'group-hover:text-slate-300')} />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 pt-2 border-t border-white/[0.06] mt-2">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const mobileItems = navItems.slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D15]/95 backdrop-blur-xl border-t border-white/[0.06] px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {mobileItems.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={cn(
                'flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200',
                active ? 'text-primary-400' : 'text-slate-600',
              )}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-primary-400" />}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
