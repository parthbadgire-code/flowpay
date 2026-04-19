'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';

const ASSETS = [
  { symbol: 'USDC', color: '#2775CA', label: 'USD Coin' },
  { symbol: 'MATIC', color: '#8247E5', label: 'Polygon' },
  { symbol: 'ETH', color: '#627EEA', label: 'Ethereum' },
];

export function CryptoAssetsCard() {
  const { collateralBalances } = useCreditLine();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden relative p-5"
      style={{
        background: 'rgba(8,8,8,0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 cursor-default">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Crypto Assets</p>
          <p className="text-[10px] text-slate-500">Available Collateral</p>
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        {ASSETS.map((asset) => {
          const balance = collateralBalances[asset.symbol as keyof typeof collateralBalances] || 0;
          return (
            <div
              key={asset.symbol}
              className="flex justify-between items-center p-3 rounded-xl transition-colors hover:bg-white/5 cursor-default"
              style={{ border: '1px solid rgba(255,255,255,0.03)' }}
            >
              <div className="flex items-center gap-3 w-max">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ background: `${asset.color}15`, color: asset.color }}
                >
                  {asset.symbol.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{asset.symbol}</p>
                  <p className="text-[10px] text-slate-500">{asset.label}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </p>
                <p className="text-[10px] text-slate-500">Balance</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
