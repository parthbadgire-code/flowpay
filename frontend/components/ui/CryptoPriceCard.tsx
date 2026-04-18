'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const cardGlass = {
  background: 'rgba(18, 16, 34, 0.8)',
  border: '1px solid rgba(0,212,170,0.15)',
  borderRadius: '1rem',
  backdropFilter: 'blur(20px)',
};

export function CryptoPriceCard() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,matic-network&order=market_cap_desc&sparkline=false&price_change_percentage=24h'
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCoins(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch crypto prices', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="w-full max-w-sm rounded-2xl p-4 mt-2"
      style={{ ...cardGlass, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
         <Activity className="w-4 h-4" style={{ color: '#00D4AA' }} />
         <p className="text-xs font-bold text-white uppercase tracking-wider">Live Markets</p>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="flex items-center justify-between p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
               <div className="flex items-center gap-3">
                 <div className="w-7 h-7 rounded-full bg-slate-800 animate-pulse"></div>
                 <div className="space-y-1.5">
                    <div className="w-10 h-3 rounded bg-slate-800 animate-pulse"></div>
                    <div className="w-16 h-2 rounded bg-slate-800/80 animate-pulse"></div>
                 </div>
               </div>
               <div className="space-y-1.5 flex flex-col items-end">
                 <div className="w-14 h-3 rounded bg-slate-800 animate-pulse"></div>
                 <div className="w-10 h-2 rounded bg-slate-800/80 animate-pulse"></div>
               </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {coins.map((coin) => {
            const currentPrice = coin?.current_price || 0;
            const priceChange = coin?.price_change_percentage_24h || 0;
            const isPositive = priceChange >= 0;
            return (
              <div key={coin.id} className="flex items-center justify-between p-2 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5">
                 <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full bg-white/10" />
                    <div>
                      <span className="text-[13px] font-black text-white uppercase block leading-none mb-1">{coin.symbol}</span>
                      <span className="text-[10px] text-slate-500 font-medium block leading-none">{coin.name}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[13px] font-black text-white block leading-none mb-1">
                       ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentPrice < 1 ? 4 : 2 })}
                    </span>
                    <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'} leading-none`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(priceChange).toFixed(2)}%
                    </span>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
