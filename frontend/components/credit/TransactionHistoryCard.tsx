'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePublicClient, useAccount } from 'wagmi';
import { parseAbiItem, Log } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import { ExternalLink, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';

interface TxRecord {
  type: 'RECEIVED' | 'SENT';
  txHash: string;
  blockNumber: string;
  amount: string;
  asset: string;
  category: string;
}

export function TransactionHistoryCard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [history, setHistory] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchHistory() {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'n7MXNbmaASHEe5yswprAx';
        const url = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;

        const fetchTransfers = async (isFrom: boolean) => {
          const body = {
            id: 1,
            jsonrpc: "2.0",
            method: "alchemy_getAssetTransfers",
            params: [{
              fromBlock: "0x0",
              toBlock: "latest",
              category: ["erc20", "erc721", "external"],
              [isFrom ? "fromAddress" : "toAddress"]: address,
              excludeZeroValue: true,
              order: "desc",
              maxCount: "0x14" // Get last 20 transfers each
            }]
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          return data.result?.transfers || [];
        };

        const [fromTransfers, toTransfers] = await Promise.all([
          fetchTransfers(true),
          fetchTransfers(false)
        ]);

        if (!mounted) return;

        const merged: TxRecord[] = [
          ...fromTransfers.map((t: any) => ({
            type: 'SENT' as const,
            txHash: t.hash,
            blockNumber: parseInt(t.blockNum, 16).toString(),
            amount: t.value?.toString() || '0',
            asset: t.asset || 'ETH',
            category: t.category
          })),
          ...toTransfers.map((t: any) => ({
            type: 'RECEIVED' as const,
            txHash: t.hash,
            blockNumber: parseInt(t.blockNum, 16).toString(),
            amount: t.value?.toString() || '0',
            asset: t.asset || 'ETH',
            category: t.category
          }))
        ];

        // Unique by hash and sort by block descending
        const unique = Array.from(new Map(merged.map(item => [item.txHash + item.type, item])).values());
        unique.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

        setHistory(unique);
      } catch (err) {
        console.error("Failed to fetch Alchemy history:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchHistory();

    const interval = setInterval(fetchHistory, 15000); // Polling every 15s instead of watching logs to keep it simple and consistent

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [address]);

  if (!address) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-slate-400" />
        <p className="text-sm font-bold text-white tracking-widest uppercase">On-Chain Activity</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-xs text-slate-500 animate-pulse">Syncing Sepolia Blocks...</div>
        ) : history.length === 0 ? (
          <div className="text-xs text-slate-500">No on-chain history found</div>
        ) : (
          history.slice(0, 5).map((tx, i) => (
            <motion.div
              key={tx.txHash + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'RECEIVED' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#627EEA]/20 text-[#627EEA]'}`}>
                  {tx.type === 'RECEIVED' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{tx.type === 'RECEIVED' ? 'Received' : 'Sent'}</p>
                  <p className="text-[10px] text-slate-500">{tx.asset} • Block #{tx.blockNumber}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-sm font-black text-white">
                    {tx.type === 'RECEIVED' ? '+' : '-'} {parseFloat(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.asset}
                  </p>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all ml-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
