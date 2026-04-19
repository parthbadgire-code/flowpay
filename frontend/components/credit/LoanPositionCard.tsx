'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, Wallet } from 'lucide-react';
import { LoanPosition } from '@/types/creditLine';
import { Badge } from '@/components/ui';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';

interface LoanPositionCardProps {
  loan: LoanPosition;
  onRepay: () => void;
}

export function LoanPositionCard({ loan, onRepay }: LoanPositionCardProps) {
  const { currency, prices } = useCreditLine();

  const fmt = (usd: number) =>
    currency === 'INR'
      ? `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const ltvPct = (loan.ltv * 100).toFixed(1);
  const ltvColor = loan.ltv < 0.35 ? '#00FF87' : loan.ltv < 0.6 ? '#FFA858' : '#FF5E5E';
  const tokenColor = loan.collateralToken === 'ETH' ? '#627EEA' : '#2775CA';
  const tokenIcon = loan.collateralToken === 'ETH' ? '⟠' : '💵';
  // INR value of what was borrowed against this loan
  const borrowedINR = loan.borrowedAmountUSD * INR_PER_USD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'rgba(14,22,19,0.92)',
        border: `1px solid ${tokenColor}22`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.25)`,
      }}
    >
      {/* Background glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10" style={{ background: tokenColor }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${tokenColor}20`, border: `1px solid ${tokenColor}40` }}>
            {tokenIcon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{loan.collateralToken} Collateral</p>
            <p className="text-xs text-slate-500">#{loan.loanId}</p>
          </div>
        </div>
        <Badge variant={loan.status === 'active' ? 'green' : loan.status === 'repaid' ? 'blue' : 'red'} size="sm">
          {loan.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Collateral', value: `${loan.collateralAmount} ${loan.collateralToken}`, sub: fmt(loan.collateralValueUSD) },
          { label: 'Borrowed', value: fmt(loan.borrowedAmountUSD), sub: `${loan.collateralToken === 'ETH' ? '40' : '80'}% max LTV` },
          { label: 'Current LTV', value: `${ltvPct}%`, color: ltvColor },
          { label: 'Liq. Price', value: loan.liquidationPriceUSD > 0 ? fmt(loan.liquidationPriceUSD) : '—', sub: loan.collateralToken === 'ETH' ? 'ETH/USD' : '—' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3" style={{ background: 'rgba(0,212,170,0.04)', border: '1px solid rgba(0,212,170,0.08)' }}>
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className="text-sm font-bold" style={{ color: stat.color ?? '#fff' }}>{stat.value}</p>
            {stat.sub && <p className="text-xs text-slate-600">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* INR wallet credit callout */}
      {loan.borrowedAmountUSD > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)' }}>
          <Wallet className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#00D4AA' }} />
          <p className="text-xs text-slate-400">
            <span style={{ color: '#00D4AA' }} className="font-bold">
              ₹{borrowedINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>{' '}
            credited to your FlowPay wallet
          </p>
        </div>
      )}

      {/* LTV bar */}
      <div className="mb-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,170,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: ltvColor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(loan.ltv * 100, 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0%</span>
          <span style={{ color: ltvColor }}>LTV: {ltvPct}%</span>
          <span>Max: {loan.collateralToken === 'ETH' ? '40%' : '80%'}</span>
        </div>
      </div>

      {/* Actions */}
      {loan.status === 'active' && (
        <button
          onClick={onRepay}
          className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
          style={{
            border: '1px solid rgba(0,212,170,0.3)',
            color: '#00D4AA',
            background: 'rgba(0,212,170,0.07)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Repay Loan →
        </button>
      )}

      {loan.status === 'repaid' && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle className="w-3 h-3" style={{ color: '#00FF87' }} />
          Fully repaid · {new Date(loan.createdAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
