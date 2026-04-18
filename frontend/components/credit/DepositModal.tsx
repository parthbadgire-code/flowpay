'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, Shield } from 'lucide-react';
import { CollateralTokenSymbol, LTV_RULES, INR_PER_USD } from '@/types/creditLine';
import { useCreditLine } from '@/hooks/useCreditLine';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { depositCollateral, prices, simulateBorrow, totalBorrowedUSD, currency, isLoading } = useCreditLine();
  const [token, setToken] = useState<CollateralTokenSymbol>('ETH');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const price = token === 'ETH' ? prices.eth.priceUSD : prices.usdc.priceUSD;
  const valueUSD = parseFloat(amount || '0') * price;
  const maxBorrow = valueUSD * LTV_RULES[token];
  const displayValue = currency === 'INR'
    ? `₹${(valueUSD * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `$${valueUSD.toFixed(2)}`;

  const tokenColor = token === 'ETH' ? '#627EEA' : '#2775CA';
  const tokenIcon = token === 'ETH' ? '⟠' : '💵';

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    await depositCollateral({ token, amount: parseFloat(amount) });
    setStep('success');
    setTimeout(() => {
      setStep('form');
      setAmount('');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        className="relative w-full max-w-md rounded-3xl p-6 z-10"
        style={{ background: 'rgba(14,10,24,0.99)', border: '1px solid rgba(0, 212, 170,0.25)' }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white mb-2">Collateral Locked!</p>
              <p className="text-slate-400 text-sm">{amount} {token} deposited to vault</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00D4AA]/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-4 h-4 text-[#00D4AA]" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Deposit Collateral</h2>
                    <p className="text-xs text-slate-500">Lock tokens to open credit line</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Token selector */}
              <div className="flex gap-2 mb-5">
                {(['ETH', 'USDC'] as CollateralTokenSymbol[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setToken(t); setAmount(''); }}
                    className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all"
                    style={{
                      background: token === t ? `${t === 'ETH' ? '#627EEA' : '#2775CA'}20` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${token === t ? (t === 'ETH' ? '#627EEA' : '#2775CA') + '50' : 'rgba(255,255,255,0.08)'}`,
                      color: token === t ? (t === 'ETH' ? '#627EEA' : '#2775CA') : '#64748B',
                    }}
                  >
                    {t === 'ETH' ? '⟠' : '💵'} {t}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <div className="mb-5">
                <label className="text-xs text-slate-500 font-medium mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{tokenIcon}</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl py-4 pl-12 pr-4 text-lg font-bold text-white placeholder-slate-700 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${amount ? tokenColor + '50' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{token}</span>
                </div>
                {parseFloat(amount) > 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    ≈ {displayValue} · 1 {token} = ${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {/* Info cards */}
              {parseFloat(amount) > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: 'Collateral Value', value: displayValue, color: '#00D4AA' },
                    { label: 'Max You Can Borrow', value: currency === 'INR' ? `₹${(maxBorrow * INR_PER_USD).toFixed(0)}` : `$${maxBorrow.toFixed(2)}`, color: '#34D399' },
                    { label: 'LTV Rule', value: `${LTV_RULES[token] * 100}% max`, color: '#F59E0B' },
                    { label: 'Liquidation at', value: `${(LTV_RULES[token] * 100 / 0.75).toFixed(0)}% usage`, color: '#F87171' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                className="w-full py-4 rounded-2xl text-sm font-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
                  boxShadow: '0 4px 24px rgba(0,212,170,0.4)',
                  color: '#0D1412',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {isLoading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Locking Collateral…</>
                ) : (
                  <><Shield className="w-4 h-4" /> Deposit & Lock Collateral</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
