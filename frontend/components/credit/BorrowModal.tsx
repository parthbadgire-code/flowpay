'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, CheckCircle, Wallet, ArrowRight } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BorrowModal({ isOpen, onClose }: BorrowModalProps) {
  const { borrow, availableCreditUSD, safeBorrowUSD, totalCollateralUSD, simulateBorrow, currency, isLoading } = useCreditLine();
  const [amountUSD, setAmountUSD] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const amt = parseFloat(amountUSD || '0');
  const sim = simulateBorrow(amt);
  const creditedINR = amt * INR_PER_USD;
  const hfColor = sim.riskLevel === 'safe' ? '#00FF87' : sim.riskLevel === 'moderate' ? '#FFA858' : '#FF5E5E';

  const handleBorrow = async () => {
    if (!amt || amt <= 0 || amt > availableCreditUSD) return;
    await borrow({ amountUSD: amt, currency: 'INR' });
    setStep('success');
    setTimeout(() => { setStep('form'); setAmountUSD(''); onClose(); }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        className="relative w-full max-w-md rounded-3xl p-6 z-10"
        style={{ background: 'rgba(14,10,24,0.99)', border: '1px solid rgba(59,130,246,0.25)' }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}>
                <Wallet className="w-8 h-8" style={{ color: '#00D4AA' }} />
              </div>
              <p className="text-xl font-black text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Funds Credited!</p>
              <p className="text-slate-400 text-sm mb-1">
                <span className="font-bold" style={{ color: '#00D4AA' }}>
                  ₹{(amt * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>{' '}added to your FlowPay wallet
              </p>
              <p className="text-slate-600 text-xs">You can now spend it via QR payments</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Borrow Funds</h2>
                    <p className="text-xs text-slate-500">Against your locked collateral</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Available credit */}
              <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)' }}>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Available to Borrow</p>
                    <p className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {currency === 'INR' ? `₹${(availableCreditUSD * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : `$${availableCreditUSD.toFixed(2)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Safe limit</p>
                    <p className="text-sm font-bold" style={{ color: '#00FF87' }}>${safeBorrowUSD.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Wallet credit callout */}
              <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 mb-5"
                style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)' }}>
                <Wallet className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00D4AA' }} />
                <p className="text-xs text-slate-400">
                  Funds credited to your{' '}
                  <span className="font-bold" style={{ color: '#00D4AA' }}>FlowPay Wallet in INR</span>
                  {amt > 0 && (
                    <span style={{ color: '#00FF87' }}>
                      {' '}(+₹{(amt * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                    </span>
                  )}
                </p>
              </div>

              {/* Amount input (always in USD internally) */}
              <div className="mb-5">
                <label className="text-xs text-slate-500 font-medium mb-2 block">
                  Amount (USD equivalent)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={amountUSD}
                    onChange={e => setAmountUSD(e.target.value)}
                    placeholder="0.00"
                    max={availableCreditUSD}
                    className="w-full rounded-2xl py-4 pl-8 pr-4 text-lg font-bold text-white placeholder-slate-700 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${amt > 0 ? '#3B82F650' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  />
                </div>
                {amt > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    ≈ ₹{(amt * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })} credited to wallet
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 mb-5">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setAmountUSD((availableCreditUSD * pct / 100).toFixed(2))}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Risk preview */}
              {amt > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'New LTV', value: `${(sim.resultingLTV * 100).toFixed(1)}%` },
                    { label: 'Health Factor', value: sim.resultingHF === 999 ? '∞' : sim.resultingHF.toFixed(2) },
                    { label: 'Risk', value: sim.riskLevel.charAt(0).toUpperCase() + sim.riskLevel.slice(1) },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                      <p className="text-sm font-bold" style={{ color: hfColor }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {amt > availableCreditUSD && (
                <p className="text-xs text-red-400 mb-3 text-center">⚠ Exceeds available credit limit</p>
              )}

              {/* CTA */}
              <button
                onClick={handleBorrow}
                disabled={!amt || amt <= 0 || amt > availableCreditUSD || isLoading}
                className="w-full py-4 rounded-2xl text-sm font-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #627EEA 100%)', boxShadow: '0 4px 24px rgba(0,212,170,0.35)', color: '#0D1412', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing…</>) : (<><TrendingUp className="w-4 h-4" /> Borrow Now</>)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
