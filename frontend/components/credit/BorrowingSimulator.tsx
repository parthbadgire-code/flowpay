'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreditLine } from '@/hooks/useCreditLine';

export function BorrowingSimulator() {
  const { availableCreditUSD, safeBorrowUSD, simulateBorrow, fmt, currency } = useCreditLine();
  const max = Math.floor(availableCreditUSD);
  const [amount, setAmount] = useState(Math.floor(safeBorrowUSD));
  const sim = simulateBorrow(amount);

  const ltvPct = (sim.resultingLTV * 100).toFixed(1);
  const hfColor = sim.riskLevel === 'safe' ? '#34D399' : sim.riskLevel === 'moderate' ? '#FBBF24' : '#F87171';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Borrowing Simulator</p>
          <p className="text-xs text-slate-500 mt-0.5">Simulate borrow impact before committing</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Max available</p>
          <p className="text-sm font-bold text-white">{fmt(availableCreditUSD)}</p>
        </div>
      </div>

      {/* Amount display */}
      <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(0, 212, 170,0.08)', border: '1px solid rgba(0, 212, 170,0.2)' }}>
        <p className="text-3xl font-black text-white">{fmt(amount)}</p>
        <p className="text-xs text-slate-500 mt-1">Simulated borrow amount</p>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={max}
        step={Math.max(1, Math.floor(max / 100))}
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, #00D4AA ${(amount / max) * 100}%, rgba(255,255,255,0.1) ${(amount / max) * 100}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-slate-600">
        <span>$0</span>
        <span className="text-emerald-400">Safe: {fmt(safeBorrowUSD)}</span>
        <span>{fmt(max)}</span>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'New LTV', value: `${ltvPct}%`, color: hfColor },
          { label: 'Health Factor', value: sim.resultingHF === 999 ? '∞' : sim.resultingHF.toFixed(2), color: hfColor },
          { label: 'Risk Level', value: sim.riskLevel.charAt(0).toUpperCase() + sim.riskLevel.slice(1), color: hfColor },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
            <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Safety indicator */}
      <div className={`rounded-xl p-3 flex items-center gap-2 text-xs font-semibold ${sim.isSafe ? 'text-emerald-400' : 'text-red-400'}`}
        style={{ background: sim.isSafe ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)', border: `1px solid ${sim.isSafe ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
        {sim.isSafe ? '✓ This borrow is within safe limits' : '⚠ This borrow may put your position at risk'}
      </div>
    </div>
  );
}
