'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LoanPosition } from '@/types/creditLine';
import { Badge } from '@/components/ui';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';
import { CreditTransaction } from '@/data/mockLoans';

interface LoanTableProps {
  onRepay?: (loan: LoanPosition) => void;
}

export function LoanTable({ onRepay }: LoanTableProps) {
  const { loans, currency, transactions } = useCreditLine();
  const [view, setView] = useState<'loans' | 'txs'>('loans');

  const fmt = (usd: number) =>
    currency === 'INR'
      ? `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const statusVariant = (s: string) => s === 'active' ? 'green' : s === 'repaid' ? 'blue' : 'red';

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex-1">Loan History</h3>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['loans', 'txs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${view === tab ? 'bg-primary-600/30 text-primary-300' : 'text-slate-500 hover:text-white'}`}
            >
              {tab === 'loans' ? 'Loans' : 'Transactions'}
            </button>
          ))}
        </div>
      </div>

      {view === 'loans' ? (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Table header */}
          <div className="grid text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Loan ID', 'Token', 'Collateral', 'Borrowed', 'LTV', 'Liq. Price', 'Status'].map(h => (
              <span key={h} className="truncate">{h}</span>
            ))}
          </div>

          {loans.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No loans yet</div>
          ) : (
            loans.map((loan, i) => (
              <motion.div
                key={loan.loanId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid items-center text-sm px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-default"
                style={{
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                  borderBottom: i < loans.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span className="text-xs font-mono text-slate-400 truncate">#{loan.loanId.slice(-6)}</span>
                <span className="font-semibold" style={{ color: loan.collateralToken === 'ETH' ? '#627EEA' : '#2775CA' }}>
                  {loan.collateralToken === 'ETH' ? '⟠ ' : '💵 '}{loan.collateralToken}
                </span>
                <div>
                  <p className="text-white font-medium text-xs">{loan.collateralAmount} {loan.collateralToken}</p>
                  <p className="text-slate-600 text-xs">{fmt(loan.collateralValueUSD)}</p>
                </div>
                <span className="text-white font-medium text-xs">{fmt(loan.borrowedAmountUSD)}</span>
                <span className="text-xs font-bold" style={{ color: loan.ltv < 0.35 ? '#34D399' : loan.ltv < 0.6 ? '#FBBF24' : '#F87171' }}>
                  {(loan.ltv * 100).toFixed(1)}%
                </span>
                <span className="text-slate-400 text-xs">
                  {loan.liquidationPriceUSD > 0 ? fmt(loan.liquidationPriceUSD) : '—'}
                </span>
                <Badge variant={statusVariant(loan.status) as 'green' | 'blue' | 'red'} size="sm">
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Transactions view */
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5"
            style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Type', 'Amount', 'Token', 'Date'].map(h => <span key={h}>{h}</span>)}
          </div>
          {transactions.map((tx, i) => {
            const typeColor = tx.type === 'deposit' ? '#00D4AA' : tx.type === 'borrow' ? '#60A5FA' : tx.type === 'repay' ? '#34D399' : '#FB923C';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid items-center text-sm px-4 py-3 hover:bg-white/[0.02] transition-colors"
                style={{
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span className="text-xs font-bold capitalize" style={{ color: typeColor }}>
                  {tx.type === 'deposit' ? '↓' : tx.type === 'borrow' ? '→' : tx.type === 'repay' ? '←' : '↑'} {tx.type}
                </span>
                <span className="text-white text-xs font-medium">{fmt(tx.amountUSD)}</span>
                <span className="text-slate-400 text-xs">{tx.token}</span>
                <span className="text-slate-500 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
