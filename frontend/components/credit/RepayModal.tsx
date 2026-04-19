'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpLeft, ShieldCheck } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD, Position } from '@/types/creditLine';
import { formatUnits, parseUnits } from 'viem';

interface RepayModalProps { isOpen: boolean; onClose: () => void; }

export function RepayModal({ isOpen, onClose }: RepayModalProps) {
  const { activeLoans, repayPosition, currency, isLoading, walletBalanceINR } = useCreditLine();
  const [selectedLoan, setSelectedLoan] = useState<Position | null>(null);
  const [step, setStep] = useState<'select' | 'success'>('select');

  const handleRepay = async (loan: Position) => {
    if (isLoading) return;
    try {
      setSelectedLoan(loan);
      
      // Calculate Native Interest
      const now = Math.floor(Date.now() / 1000);
      const daysElapsed = (BigInt(now) - loan.createdAt) / BigInt(86400);
      const interest = (loan.creditIssued * BigInt(6) * daysElapsed) / BigInt(365) / BigInt(100);
      const totalRepayRaw = loan.creditIssued + interest;

      await repayPosition(loan.id, totalRepayRaw);
      setStep('success');
      setTimeout(() => { setStep('select'); onClose(); }, 2500);
    } catch (e) {
      console.error(e);
      setSelectedLoan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        className="relative w-full max-w-md rounded-3xl p-6 z-10"
        style={{ background: 'rgba(14,10,24,0.99)', border: '1px solid rgba(52,211,153,0.25)' }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div key="success" className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white mb-2">Position Repaid!</p>
              <p className="text-slate-400 text-sm">Collateral has been returned to your wallet.</p>
            </motion.div>
          ) : (
            <motion.div key="select">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-black text-white">Repay Position</h2>
                  <p className="text-xs text-slate-500">Select an active CDP to clear</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-2">
                {activeLoans.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No active positions to repay.</p>
                ) : (
                  activeLoans.map(loan => {
                    const debtINR = formatUnits(loan.creditIssued, 18);
                    const debtUSD = Number(debtINR) / INR_PER_USD;
                    const isRepayingThis = isLoading && selectedLoan?.id === loan.id;

                    const now = Math.floor(Date.now() / 1000);
                    const daysElapsed = (BigInt(now) - loan.createdAt) / BigInt(86400);
                    const interest = (loan.creditIssued * BigInt(6) * daysElapsed) / BigInt(365) / BigInt(100);
                    const requiredINRMight = (loan.creditIssued - loan.originationFee) + interest;
                    const requiredINRNum = Number(formatUnits(requiredINRMight, 18));
                    const hasSufficient = walletBalanceINR >= requiredINRNum - 0.01; // small wiggle room for decimals

                    return (
                      <div key={loan.id.toString()} className="rounded-2xl p-4 border border-white/10 bg-white/5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-400">Position #{loan.id.toString()}</p>
                            <p className="text-lg font-black text-white">
                              {currency === 'INR' ? `₹${Number(debtINR).toFixed(0)}` : `$${debtUSD.toFixed(2)}`} Debt
                            </p>
                          </div>
                        </div>
                        { !hasSufficient && <p className="text-[10px] text-red-400 mb-1">Insufficient FlowPay balance to repay</p> }
                        <button
                          onClick={() => handleRepay(loan)}
                          disabled={isLoading || !hasSufficient}
                          className="w-full py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}
                        >
                          {isRepayingThis ? "Processing..." : "Repay & Unlock"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
