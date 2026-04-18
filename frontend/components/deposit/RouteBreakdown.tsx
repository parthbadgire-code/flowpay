'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, TrendingDown, CheckCircle2 } from 'lucide-react';
import { DepositBreakdown } from '@/types/deposit';
import { Card, Badge, Progress, Separator } from '@/components/ui';
import { formatINR, formatNumber } from '@/lib/utils';

interface RouteBreakdownProps {
  breakdown: DepositBreakdown | null;
  loading?: boolean;
}

export function RouteBreakdown({ breakdown, loading }: RouteBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="skeleton h-4 w-32" />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-9 h-9 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-2 w-full" />
              </div>
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!breakdown || breakdown.routes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Optimal Route Found</h3>
            </div>
            {breakdown.savedSwaps > 0 && (
              <Badge variant="green" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                Saved {breakdown.savedSwaps} swap{breakdown.savedSwaps > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Routes */}
          <div className="space-y-3 mb-4">
            {breakdown.routes.map((route, i) => (
              <motion.div
                key={route.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border"
                    style={{ background: `${route.color}20`, borderColor: `${route.color}40` }}
                  >
                    {route.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">{route.symbol}</span>
                      {route.badge && (
                        <Badge variant={route.badge === 'Best Route' ? 'purple' : 'blue'} size="sm">
                          {route.badge === 'Best Route' && <Star className="w-2.5 h-2.5" />}
                          {route.badge === 'Low Gas' && <Zap className="w-2.5 h-2.5" />}
                          {route.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatNumber(route.tokenAmount, 6)} {route.symbol} · Score: {(route.routingScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">{formatINR(route.amountINR)}</p>
                    <p className="text-[10px] text-slate-600">gas ₹{route.gasEstimateINR.toFixed(4)}</p>
                  </div>
                </div>
                <Progress
                  value={route.amountINR}
                  max={breakdown.totalINR}
                  color={`from-[${route.color}] to-[${route.color}80]`}
                  animated={false}
                />
              </motion.div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Total Gas Estimate
              </span>
              <span className="text-slate-300 font-medium">₹{breakdown.totalGasEstimateINR.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Network</span>
              <Badge variant="purple" size="sm">{breakdown.network}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Est. Time</span>
              <span className="text-slate-300">{breakdown.estimatedTime}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">You Deposit</span>
              <span className="text-white font-bold text-base">{formatINR(breakdown.totalINR)}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
