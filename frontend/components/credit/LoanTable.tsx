'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Position } from '@/types/creditLine';
import { Badge } from '@/components/ui';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';
import { formatUnits } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';

export function LoanTable() {
  const { loans, currency } = useCreditLine();

  const fmt = (usd: number) =>
    currency === 'INR'
      ? `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const statusVariant = (s: boolean, l: boolean) => l ? 'red' : s ? 'green' : 'blue';
  
  const tokenName = (addr: string) => {
    if(addr.toLowerCase() === ADDRESSES.MockMATIC.toLowerCase()) return 'MATIC';
    if(addr.toLowerCase() === ADDRESSES.MockUSDC.toLowerCase()) return 'USDC';
    return 'TOKEN';
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex-1">CDP History</h3>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['Position ID', 'Collateral', 'Debt Issued', 'Origination Fee', 'Status'].map(h => (
            <span key={h} className="truncate">{h}</span>
          ))}
        </div>

        {loans.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No active positions yet</div>
        ) : (
          loans.map((loan, i) => {
            const token = tokenName(loan.collateralContract);
            const colNum = Number(formatUnits(loan.collateralAmount, loan.isNFT ? 0 : 18));
            const debtNum = Number(formatUnits(loan.creditIssued, 18));
            const feeNum = Number(formatUnits(loan.originationFee, 18));

            return (
            <motion.div
              key={loan.id.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid items-center text-sm px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-default"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                borderBottom: i < loans.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span className="text-xs font-mono text-slate-400 truncate">#{loan.id.toString()}</span>
              
              <div>
                <p className="text-white font-medium text-xs truncate">
                   {loan.isNFT ? 'NFT #'+colNum : colNum.toFixed(2) + ' ' + token}
                </p>
              </div>

              <span className="text-white font-medium text-xs">
                 {currency === 'INR' ? `₹${debtNum.toFixed(0)}` : `$${(debtNum / INR_PER_USD).toFixed(2)}`}
              </span>
              
              <span className="text-slate-400 font-medium text-xs">
                 ₹{feeNum.toFixed(0)}
              </span>

              <Badge variant={statusVariant(loan.active, loan.liquidated) as 'green' | 'blue' | 'red'} size="sm">
                {loan.liquidated ? 'Liquidated' : loan.active ? 'Active' : 'Repaid'}
              </Badge>
            </motion.div>
            )
          })
        )}
      </div>
    </div>
  );
}
