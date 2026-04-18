'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';
import { formatINR, formatAddress } from '@/lib/utils';
import { DepositRoute } from '@/types/deposit';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'payment' | 'deposit';
  amount: number;
  merchantName?: string;
  merchantLogo?: string;
  newBalance: number;
  routes?: DepositRoute[];
  txHash?: string;
  lotteryEntry?: boolean;
}

export function SuccessModal({
  isOpen, onClose, type, amount, merchantName, merchantLogo,
  newBalance, routes, txHash, lotteryEntry,
}: SuccessModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Confetti
    let confettiModule: any;
    import('canvas-confetti').then(mod => {
      confettiModule = mod.default;
      confettiModule({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
      });
    });
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative glass-strong rounded-3xl p-8 w-full max-w-sm z-10 text-center"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            >
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-2xl font-black text-white mb-1">
                {type === 'payment' ? 'Payment Successful!' : 'Deposit Complete!'}
              </p>
              {type === 'payment' && merchantName && (
                <p className="text-slate-400 text-sm mb-4">
                  {merchantLogo} <strong>{merchantName}</strong> received {formatINR(amount)}
                </p>
              )}
              {type === 'deposit' && (
                <p className="text-slate-400 text-sm mb-4">
                  {formatINR(amount)} added to your FlowPay wallet
                </p>
              )}

              {/* Balance card */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-500 mb-1">Updated FlowPay Balance</p>
                <p className="text-3xl font-black gradient-text">{formatINR(newBalance)}</p>
              </div>

              {/* Routes breakdown for deposit */}
              {routes && routes.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-4 text-left space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Assets Used</p>
                  {routes.map(r => (
                    <div key={r.symbol} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span>{r.logo}</span>
                        <span className="text-slate-400">{r.symbol}</span>
                      </span>
                      <span className="font-semibold text-white">{formatINR(r.amountINR)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tx hash */}
              {txHash && (
                <p className="text-xs text-slate-600 font-mono mb-4">
                  TX: {formatAddress(txHash)}
                </p>
              )}

              {/* Lottery */}
              {lotteryEntry && (
                <div className="flex items-center gap-2 justify-center mb-5 text-sm text-amber-400">
                  <Trophy className="w-4 h-4" />
                  <span>You've been entered into the reward pool! 🎉</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                  Done
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="brand" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                    Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
