'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TokenBalance } from '@/types/wallet';
import { Card, Badge } from '@/components/ui';
import { formatINR, formatNumber } from '@/lib/utils';

interface TokenCardProps {
  token: TokenBalance;
  index?: number;
}

export function TokenCard({ token, index = 0 }: TokenCardProps) {
  const isPositive = token.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card hover className="relative overflow-hidden group">
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60"
          style={{ background: `linear-gradient(90deg, ${token.color}, transparent)` }}
        />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border"
              style={{
                background: `${token.color}20`,
                borderColor: `${token.color}40`,
              }}
            >
              {token.logo}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{token.name}</p>
              <p className="text-xs text-slate-500 font-medium">{token.symbol}</p>
            </div>
          </div>
          <Badge variant={isPositive ? 'green' : 'red'} className="flex items-center gap-1">
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{token.change24h.toFixed(2)}%
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">
            {formatINR(token.inrValue)}
          </p>
          <p className="text-sm text-slate-500">
            {formatNumber(token.amount, 6)} {token.symbol}
          </p>
        </div>

        {/* Progress bar showing share of portfolio */}
        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: token.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((token.inrValue / 500) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          />
        </div>
      </Card>
    </motion.div>
  );
}
