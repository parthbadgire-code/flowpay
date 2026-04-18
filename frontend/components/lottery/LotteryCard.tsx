'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Ticket, Clock, Gift, Sparkles } from 'lucide-react';
import type { LotteryPool, LotteryWinner } from '@/types/lottery';
import { Card, Button, Badge, Progress } from '@/components/ui';
import { formatINR, formatTimeAgo, formatAddress } from '@/lib/utils';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { pickWinner } from '@/services/lotteryService';

interface LotteryCardProps {
  pool: LotteryPool;
  winners: LotteryWinner[];
}

export function LotteryCard({ pool, winners: initialWinners }: LotteryCardProps) {
  const [loading, setLoading] = useState(false);
  const [latestWinner, setLatestWinner] = useState<LotteryWinner | null>(null);
  const [winners, setWinners] = useState(initialWinners);

  const hoursUntilDraw = Math.max(
    0,
    Math.round((new Date(pool.drawTimestamp).getTime() - Date.now()) / 3600000)
  );

  const handlePickWinner = async () => {
    setLoading(true);
    try {
      const winner = await pickWinner(pool.currentRound);
      setLatestWinner(winner);
      setWinners(prev => [winner, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Prize Pool Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-primary-600/5 rounded-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Reward Pool</h3>
            <Badge variant="yellow" size="sm" className="ml-auto">Round #{pool.currentRound}</Badge>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1">Total Prize Pool</p>
            <p className="text-4xl font-black gradient-text-gold">
              <AnimatedCounter value={pool.totalPrizeINR} prefix="₹" />
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.06]">
              <Ticket className="w-4 h-4 text-primary-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{pool.totalEntries}</p>
              <p className="text-[10px] text-slate-600">Total Entries</p>
            </div>
            <div className="bg-primary-600/10 border border-primary-500/20 rounded-xl p-3 text-center">
              <Sparkles className="w-4 h-4 text-primary-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-primary-300">{pool.userEntries}</p>
              <p className="text-[10px] text-primary-600">Your Entries</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/[0.06]">
              <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{hoursUntilDraw}h</p>
              <p className="text-[10px] text-slate-600">Until Draw</p>
            </div>
          </div>

          {/* Win chances */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Your Win Chance</span>
              <span className="text-white font-medium">
                {pool.totalEntries > 0 ? ((pool.userEntries / pool.totalEntries) * 100).toFixed(2) : 0}%
              </span>
            </div>
            <Progress
              value={pool.userEntries}
              max={pool.totalEntries}
              color="from-amber-500 to-amber-400"
            />
          </div>

          {/* Prizes */}
          <div className="space-y-2 mb-4">
            {pool.prizes.map((prize, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-xl">{prize.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{prize.label}</p>
                </div>
                <Badge variant={prize.type === 'cashback' ? 'green' : prize.type === 'nft' ? 'yellow' : 'purple'} size="sm">
                  {formatINR(prize.valueINR)}
                </Badge>
              </div>
            ))}
          </div>

          <Button
            variant="brand"
            className="w-full"
            onClick={handlePickWinner}
            loading={loading}
            icon={<Gift className="w-4 h-4" />}
          >
            {loading ? 'Drawing Winner...' : 'Pick Winner (Admin)'}
          </Button>
        </div>
      </Card>

      {/* Latest winner reveal */}
      <AnimatePresence>
        {latestWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-strong rounded-2xl p-5 border border-amber-500/20 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-sm text-amber-400 font-semibold mb-1">Round #{latestWinner.round} Winner!</p>
            <p className="text-xl font-black text-white mb-1">{latestWinner.shortAddress}</p>
            <Badge variant="yellow">{latestWinner.prize.label}</Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Winners */}
      <Card>
        <h3 className="font-bold text-white mb-3">Recent Winners</h3>
        <div className="space-y-3">
          {winners.map((w, i) => (
            <motion.div
              key={w.id}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: w.avatarColor }}
              >
                {w.shortAddress.slice(2, 4).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{w.shortAddress}</p>
                <p className="text-xs text-slate-500">Round #{w.round} · {formatTimeAgo(new Date(w.timestamp))}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{w.prize.icon}</p>
                <p className="text-xs text-slate-400">{formatINR(w.prize.valueINR)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
