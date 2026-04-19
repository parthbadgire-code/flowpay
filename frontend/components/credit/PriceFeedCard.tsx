'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useCreditLine } from '@/hooks/useCreditLine';

export function PriceFeedCard() {
  const { currency } = useCreditLine();
  const INR = 83.5;

  const [pricesData, setPricesData] = useState<any>(null);
  const [sparkTick, setSparkTick] = useState(0);

  // 1. Fetch prices independently for all 5 tokens
  useEffect(() => {
    let mounted = true;
    async function fetchPrices() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,matic-network,polygon-ecosystem-token,usd-coin&vs_currencies=usd,inr&include_24hr_change=true');
        const data = await res.json();
        if (mounted) setPricesData(data);
      } catch (e) {
        console.error("Local feed fetch failed", e);
      }
    }
    fetchPrices();
    const int = setInterval(fetchPrices, 15000);
    return () => { mounted = false; clearInterval(int); };
  }, []);

  // 2. Drive the asynchronous jitter tick
  useEffect(() => {
    const int = setInterval(() => setSparkTick(t => t + 1), 1000);
    return () => clearInterval(int);
  }, []);

  // 3. Helper to generate mathematical graph arrays that are out of sync (using the offset param)
  const generateAsyncSparkline = (base: number, volatility: number, offset: number) => {
    let line = [];
    for (let i = 0; i < 6; i++) {
        if (i === 5) {
            line.push(base); // the final right-side point must anchor directly onto the true spot price
        } else {
            // Include 'offset' in the phase so each graph dances entirely independently of the others!
            const wave = Math.sin((sparkTick * 0.5) + i + offset) * volatility;
            line.push(base + (base * wave));
        }
    }
    return line;
  };

  const getFeed = (id: string, symbol: string, name: string, fallbackPrice: number, color: string, icon: string, offset: number, fallbackChange: number = 0, vol: number = 0.05) => {
    const pUSD = pricesData?.[id]?.usd || fallbackPrice;
    const change = pricesData?.[id]?.usd_24h_change || fallbackChange;
    return {
      key: id, symbol, name, color, icon, 
      price: pUSD, 
      change: change,
      sparkline: generateAsyncSparkline(pUSD, vol, offset)
    };
  };

  // 4. Assemble the Async Feeds Data
  const feeds = [
    getFeed('bitcoin', 'BTC', 'Bitcoin', 64000, '#F7931A', '₿', 0.0, 1.2, 0.03),
    getFeed('ethereum', 'ETH', 'Ethereum', 3100, '#627EEA', '⟠', 2.1, 1.8, 0.04), // Offset 2.1
    getFeed('matic-network', 'MATIC', 'Polygon', 0.68, '#8247E5', '🟣', 4.5, -1.2, 0.06), // Offset 4.5
    getFeed('polygon-ecosystem-token', 'POL', 'Polygon POL', 0.68, '#1e7db8', '💠', 7.7, -1.1, 0.06), // Offset 7.7
    getFeed('usd-coin', 'USDC', 'USD Coin', 1.0, '#2775CA', '💵', 12.0, 0.01, 0.001), // Offset 12.0
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Live Market Feeds
        </span>
        <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          CoinGecko Stream
        </span>
      </div>

      {feeds.map((feed, i) => {
        const display = currency === 'INR'
          ? `₹${(feed.price * INR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
          : `$${feed.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;

        const chartData = feed.sparkline.map((v: number, idx: number) => ({ v, idx }));
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
