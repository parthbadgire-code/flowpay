'use client';

import { motion } from 'framer-motion';
import { useCreditLine } from '@/hooks/useCreditLine';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { INR_PER_USD } from '@/types/creditLine';

interface StatCard {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  color?: string;
  subLabel?: string;
}

export function PortfolioSummary() {
  const { totalCollateralUSD, totalBorrowedUSD, availableCreditUSD, healthFactor, activeLoans, currency, riskLevel } = useCreditLine();

  const toDisplay = (usd: number) => currency === 'INR' ? usd * INR_PER_USD : usd;
  const prefix = currency === 'INR' ? '₹' : '$';

  const hfColor = riskLevel === 'safe' ? '#00FF87' : riskLevel === 'moderate' ? '#FFA858' : '#FF5E5E';
  const hfDisplay = healthFactor === 999 ? '∞' : healthFactor.toFixed(2);

  const stats: StatCard[] = [
    { label: 'Total Collateral', value: toDisplay(totalCollateralUSD), prefix, isCurrency: true, color: '#00D4AA', subLabel: 'Locked in vault' },
    { label: 'Total Borrowed', value: toDisplay(totalBorrowedUSD), prefix, isCurrency: true, color: '#627EEA', subLabel: 'Outstanding debt' },
    { label: 'Available Credit', value: toDisplay(availableCreditUSD), prefix, isCurrency: true, color: '#00FF87', subLabel: 'Ready to borrow' },
    { label: 'Health Factor', value: healthFactor === 999 ? 999 : healthFactor, prefix: '', isCurrency: false, color: hfColor, subLabel: riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) },
    { label: 'Active Loans', value: activeLoans.length, prefix: '', isCurrency: false, color: '#FFA858', subLabel: 'Open positions' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'rgba(6,6,6,0.98)',
            border: i % 2 === 0
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(184,115,51,0.12)',
          }}
        >
          {/* Glow orb */}
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-20" style={{ background: stat.color }} />
          <p className="text-xs text-slate-500 mb-1 font-medium">{stat.label}</p>
          <p className="text-lg font-black" style={{ color: stat.color }}>
            {stat.label === 'Health Factor' ? (
              hfDisplay
            ) : stat.label === 'Active Loans' ? (
              stat.value
            ) : (
              <>
                {stat.prefix}<AnimatedCounter value={stat.value} />
              </>
            )}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{stat.subLabel}</p>
        </motion.div>
      ))}
    </div>
  );
}
