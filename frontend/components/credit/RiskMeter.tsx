'use client';

import { motion } from 'framer-motion';
import { useCreditLine } from '@/hooks/useCreditLine';

export function RiskMeter() {
  const { healthFactor, riskLevel, totalBorrowedUSD, totalCollateralUSD } = useCreditLine();

  // liquidation proximity: how close are we to HF=1.0?
  // 0% = safe (HF≥3), 100% = liquidated (HF≤1.0)
  const liquidationProximityPct = healthFactor === 999 ? 0 : Math.min(100, Math.max(0, ((3 - healthFactor) / 2) * 100));
  const pct = Math.min(liquidationProximityPct, 100);

  const riskColor = riskLevel === 'safe' ? '#00FF87' : riskLevel === 'moderate' ? '#FFA858' : '#FF5E5E';

  const labels = [
    { pos: '0%', text: 'Safe' },
    { pos: '75%', text: 'Liq. Zone' },
    { pos: '100%', text: 'Liquidated' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Liquidation Risk</span>
        <span className="font-semibold" style={{ color: riskColor }}>
          {pct.toFixed(1)}% of threshold
        </span>
      </div>

      <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'rgba(0,212,170,0.06)' }}>
        {/* Gradient bar background */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="risk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF87" />
              <stop offset="55%" stopColor="#FFA858" />
              <stop offset="80%" stopColor="#FF8E38" />
              <stop offset="100%" stopColor="#FF5E5E" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#risk-gradient)" opacity={0.12} />
        </svg>

        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00FF87 0%, #FFA858 55%, #FF8E38 80%, #FF5E5E 100%)',
            backgroundSize: `${100 / Math.max(pct / 100, 0.01)}% 100%`,
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        />

        {/* Threshold marker at 100% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400/80"
          style={{ right: 0 }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>Safe</span>
        <span>Moderate</span>
        <span className="text-red-400">Liquidation</span>
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          { label: 'Collateral', val: `$${totalCollateralUSD.toFixed(0)}` },
          { label: 'Debt', val: `$${totalBorrowedUSD.toFixed(0)}` },
          { label: 'HF', val: healthFactor === 999 ? '∞' : healthFactor.toFixed(2) },
        ].map(item => (
          <div key={item.label} className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-slate-600">{item.label}</p>
            <p className="text-sm font-bold text-white">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
