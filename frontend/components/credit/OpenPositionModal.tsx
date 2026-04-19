'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownToLine, Shield, TrendingUp, Wallet } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';
import { LTV_RULES, INR_PER_USD } from '@/types/creditLine';
import { ADDRESSES } from '@/src/contracts/addresses';
import { parseUnits } from 'viem';
import { useWriteContract, useAccount } from 'wagmi';
import mInrArtifact from '@/src/contracts/MockINR.json'; // ERC20 standard ABI

interface OpenPositionModalProps {
  isOpen: boolean; onClose: () => void;
}

export function OpenPositionModal({ isOpen, onClose }: OpenPositionModalProps) {
  const { openPositionERC20, currency, simulateBorrow } = useCreditLine();
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const [token, setToken] = useState<'MATIC' | 'USDC'>('MATIC');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmountUSD, setBorrowAmountUSD] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);

  // Very naive price mapping for testnet demo constraints
  const price = token === 'MATIC' ? 0.8 : 1.0; 
  const collateralValueUSD = parseFloat(collateralAmount || '0') * price;
  const maxBorrowUSD = collateralValueUSD * LTV_RULES.ERC20;
  
  const amtBorrowed = parseFloat(borrowAmountUSD || '0');
  const sim = simulateBorrow(amtBorrowed, collateralValueUSD);

  const displayCollateral = currency === 'INR' 
    ? `₹${(collateralValueUSD * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
    : `$${collateralValueUSD.toFixed(2)}`;

  const handleOpenPosition = async () => {
    if (!address || !collateralAmount || !borrowAmountUSD || isProcessing) return;
    setIsProcessing(true);
    try {
      const colRaw = parseUnits(collateralAmount, 18);
      const creditRaw = parseUnits((amtBorrowed * INR_PER_USD).toFixed(18), 18); // mint mINR natively equivalent to INR value
      const tokenAddress = token === 'MATIC' ? ADDRESSES.MockMATIC : ADDRESSES.MockUSDC;

      // 1. Approve Collateral Manager for ERC20 transfer
      await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: mInrArtifact.abi, // reuse ERC20 generic abi
        functionName: 'approve',
        args: [ADDRESSES.CollateralManager, colRaw],
      });

      // Simple delay to assume generic block processing before CDP execution in sequence demo
      await new Promise(r => setTimeout(r, 6000));

      // 2. Open Position Atomic Action
      await openPositionERC20(tokenAddress, colRaw, creditRaw);
      
      setStep('success');
      setTimeout(() => { setStep('form'); setCollateralAmount(''); setBorrowAmountUSD(''); onClose(); }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
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
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {step === 'success' ? (
            <motion.div key="success" className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">CDP Position Opened!</p>
              <p className="text-slate-400 text-sm mt-2">Locked {collateralAmount} {token}</p>
              <p className="text-[#00FF87] font-bold">Generated ₹{(amtBorrowed * INR_PER_USD).toFixed(0)} Credit Line</p>
            </motion.div>
          ) : (
            <motion.div key="form">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-black text-white">Open CDP Position</h2>
                  <p className="text-xs text-slate-500">Atomic Collateral & Credit generation</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* 1. Deposit Collateral Side */}
              <div className="mb-4">
                 <label className="text-xs text-[#00D4AA] font-bold mb-2 flex items-center gap-2"><ArrowDownToLine className="w-3 h-3"/> Step 1: Deposit Collateral</label>
                 <div className="flex gap-2 mb-2">
                  {(['MATIC', 'USDC'] as const).map(t => (
                    <button key={t} onClick={() => setToken(t)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: token === t ? '#627EEA20' : 'rgba(255,255,255,0.03)', border: `1px solid ${token === t ? '#627EEA' : '#ffffff20'}`, color: token === t ? '#627EEA' : '#64748B' }}>
                      {t}
                    </button>
                  ))}
                 </div>
                 <input type="number" value={collateralAmount} onChange={e => setCollateralAmount(e.target.value)} placeholder="0.00"
                    className="w-full rounded-2xl py-3 px-4 text-lg font-bold text-white bg-black/40 border border-white/10 focus:outline-none" />
                 {collateralValueUSD > 0 && <p className="text-xs text-slate-400 mt-1">Value: {displayCollateral}</p>}
              </div>

              {/* 2. Borrow Credit Side */}
              <div className="mb-6 opacity-90">
                 <label className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Step 2: Generate Credit (Max Allowable: ${maxBorrowUSD.toFixed(2)})</label>
                 <input type="number" value={borrowAmountUSD} onChange={e => setBorrowAmountUSD(e.target.value)} placeholder="Borrow USD amount" max={maxBorrowUSD}
                    className="w-full rounded-2xl py-3 px-4 text-lg font-bold text-white bg-black/40 border border-blue-500/20 focus:outline-none" />
                 {amtBorrowed > 0 && <p className="text-xs text-blue-300 mt-1">Receiving precisely ₹{(amtBorrowed * INR_PER_USD).toFixed(0)} mINR</p>}
              </div>

              {/* Info grid */}
              {amtBorrowed > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="rounded-xl p-2 bg-white/5"><p className="text-xs text-slate-500">LTV Output</p><p className="text-sm font-bold text-white">{(sim.resultingLTV * 100).toFixed(1)}%</p></div>
                  <div className="rounded-xl p-2 bg-white/5"><p className="text-xs text-slate-500">Risk Profile</p><p className="text-sm font-bold" style={{ color: sim.resultingHF > 1.5 ? '#00FF87' : '#FF5E5E' }}>{sim.resultingHF.toFixed(2)}</p></div>
                </div>
              )}

              <button onClick={handleOpenPosition} disabled={!collateralAmount || !borrowAmountUSD || amtBorrowed > maxBorrowUSD || isProcessing}
                className="w-full py-4 rounded-2xl text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', color: '#0D1412' }}>
                {isProcessing ? "Awaiting Metamask Approvals..." : "Open Position (Atomic CDP)"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
