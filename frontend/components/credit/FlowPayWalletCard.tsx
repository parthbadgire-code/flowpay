'use client';

import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Send, ShoppingBag } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';

// Quick actions a user can do with their FlowPay wallet balance
const QUICK_ACTIONS = [
  { label: 'Pay', icon: <Send className="w-4 h-4" />, color: '#00D4AA', href: '/payment' },
  { label: 'Shop', icon: <ShoppingBag className="w-4 h-4" />, color: '#FFA858', href: '/payment' },
  { label: 'Send', icon: <ArrowUpRight className="w-4 h-4" />, color: '#627EEA', href: '/payment' },
  { label: 'Top Up', icon: <ArrowDownLeft className="w-4 h-4" />, color: '#00FF87', href: '/deposit' },
];

export function FlowPayWalletCard() {
  const { walletBalanceINR, totalBorrowedUSD, transactions } = useCreditLine();

  // Last borrow/credit transaction
  const lastCredit = transactions.find(t => t.type === 'borrow');
  const lastCreditINR = lastCredit ? lastCredit.amountUSD * INR_PER_USD : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(0,255,135,0.06) 50%, rgba(14,22,19,0.98) 100%)',
        border: '1px solid rgba(0,212,170,0.25)',
        boxShadow: '0 4px 32px rgba(0,212,170,0.1)',
      }}
    >
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,212,170,0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Glowing orb top-right */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ background: '#00D4AA' }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}
            >
              <Wallet className="w-4 h-4" style={{ color: '#00D4AA' }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">FlowPay Wallet</p>
              <p className="text-[10px] text-slate-600">Spendable balance</p>
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.25)', color: '#00FF87' }}
          >
            ● Live
          </div>
        </div>

        {/* Main balance */}
        <div className="mb-1">
          <motion.p
            key={walletBalanceINR}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-black"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ₹{walletBalanceINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </motion.p>
          <p className="text-xs text-slate-500 mt-0.5">
            ≈ ${(walletBalanceINR / INR_PER_USD).toFixed(2)} USD
          </p>
        </div>

        {/* Last credit pill */}
        {lastCreditINR > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <ArrowDownLeft className="w-3 h-3" style={{ color: '#00FF87' }} />
            <p className="text-xs" style={{ color: '#00FF87' }}>
              +₹{lastCreditINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })} credited from last borrow
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px mb-4" style={{ background: 'rgba(0,212,170,0.1)' }} />

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(action => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${action.color}15`, color: action.color }}
              >
                {action.icon}
              </div>
              <span className="text-[10px] font-semibold text-slate-500">{action.label}</span>
            </a>
          ))}
        </div>

        {/* Info footer */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            💡 This balance is funded by your crypto credit line. Repay your loan to reduce outstanding debt.
            Equivalent to ${(walletBalanceINR / INR_PER_USD).toFixed(0)} borrowed against collateral.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
