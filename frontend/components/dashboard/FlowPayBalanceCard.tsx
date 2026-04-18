'use client';

import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, Plus, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { Card, Button, Progress } from '@/components/ui';
import { formatINR } from '@/lib/utils';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';

export function FlowPayBalanceCard() {
  const { flowPayBalance, spendableBalance, fromFlowPay, fromNFT } = useFlowPayBalance();
  const maxDisplay = Math.max(spendableBalance, 500);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden" glow={flowPayBalance > 0}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-accent-500/5 rounded-2xl" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-400" />
            </div>
            <p className="text-sm font-semibold text-slate-400">FlowPay Wallet</p>
            <span className="ml-auto text-xs bg-primary-600/20 text-primary-300 px-2 py-0.5 rounded-full border border-primary-500/20">
              Polygon Amoy
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Spendable Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black gradient-text">
                <AnimatedCounter value={flowPayBalance} prefix="₹" />
              </span>
            </div>
            {fromNFT > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                + {formatINR(fromNFT)} NFT backup available
              </p>
            )}
          </div>

          {/* Balance bar */}
          <Progress value={flowPayBalance} max={maxDisplay} className="mb-5" />

          {/* Breakdown */}
          {(fromFlowPay > 0 || fromNFT > 0) && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Wallet Balance</p>
                <p className="text-sm font-bold text-white">{formatINR(fromFlowPay)}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">NFT Backup</p>
                <p className="text-sm font-bold text-amber-400">{formatINR(fromNFT)}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href="/deposit" className="flex-1">
              <Button variant="brand" className="w-full" size="sm" icon={<Plus className="w-4 h-4" />}>
                Deposit
              </Button>
            </Link>
            <Link href="/payment" className="flex-1">
              <Button variant="outline" className="w-full" size="sm" icon={<QrCode className="w-4 h-4" />}>
                Pay
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
