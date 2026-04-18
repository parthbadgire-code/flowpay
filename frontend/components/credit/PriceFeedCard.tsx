'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';

export function PriceFeedCard() {
  const { prices, currency } = useCreditLine();
  const INR = 83.5;

  const feeds = [
    {
      key: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      price: prices.eth.priceUSD,
      change: prices.eth.change24h,
      sparkline: prices.eth.sparkline,
      color: '#627EEA',
      glow: 'rgba(98,126,234,0.25)',
      icon: '⟠',
    },
    {
      key: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      price: prices.usdc.priceUSD,
      change: prices.usdc.change24h,
      sparkline: prices.usdc.sparkline,
      color: '#2775CA',
      glow: 'rgba(39,117,202,0.25)',
      icon: '💵',
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Live Price Feeds
        </span>
        <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Chainlink
        </span>
      </div>

      {feeds.map((feed, i) => {
        const display = currency === 'INR'
          ? `₹${(feed.price * INR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
          : `$${feed.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;

        const chartData = feed.sparkline.map((v, idx) => ({ v, idx }));
        const isUp = feed.change >= 0;

        return (
          <motion.div
            key={feed.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'rgba(14,22,19,0.92)',
              border: `1px solid ${feed.color}22`,
            }}
          >
            <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: feed.color }} />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{feed.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{feed.symbol}</p>
                  <p className="text-xs text-slate-500">{feed.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-white">{display}</p>
                <p className={`text-xs font-semibold flex items-center gap-1 justify-end ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? '+' : ''}{feed.change.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`sparkGrad-${feed.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={feed.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={feed.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={feed.color}
                    strokeWidth={2}
                    fill={`url(#sparkGrad-${feed.key})`}
                    dot={false}
                    isAnimationActive={true}
                  />
                  <Tooltip
                    contentStyle={{ display: 'none' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
