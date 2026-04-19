'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePublicClient, useAccount } from 'wagmi';
import { parseAbiItem, Log } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import { ExternalLink, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';

interface TxRecord {
  type: 'BORROW' | 'REPAY';
  txHash: string;
  blockNumber: bigint;
  amount: number;
}

export function TransactionHistoryCard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [history, setHistory] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchLogs() {
      if (!address || !publicClient) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const openedAbi = parseAbiItem('event PositionOpened(uint256 indexed positionId, address indexed borrower, uint256 creditIssued)');
        const repaidAbi = parseAbiItem('event PositionRepaid(uint256 indexed positionId, address indexed borrower, uint256 totalRepaid)');

        // We fetch logs from a reasonably recent testnet block to avoid RPC timeouts
        const fromBlock = BigInt(5740000); // generic recent block on Sepolia
        
        // Parallel fetch for both events strictly filtered by the user's address
        const [openedLogs, repaidLogs] = await Promise.all([
          publicClient.getLogs({
            address: ADDRESSES.CollateralManager as `0x${string}`,
            event: openedAbi,
            args: { borrower: address },
            fromBlock: 'earliest' // Alchemy can usually handle earliest for indexed queries!
          }),
          publicClient.getLogs({
            address: ADDRESSES.CollateralManager as `0x${string}`,
            event: repaidAbi,
            args: { borrower: address },
            fromBlock: 'earliest'
          })
        ]);

        if (!mounted) return;

        // Parse and merge logs
        const records: TxRecord[] = [];

        openedLogs.forEach((log: any) => {
          records.push({
            type: 'BORROW',
            txHash: log.transactionHash,
            blockNumber: log.blockNumber || 0n,
            amount: Number(log.args.creditIssued) / 1e18,
          });
        });

        repaidLogs.forEach((log: any) => {
          records.push({
            type: 'REPAY',
            txHash: log.transactionHash,
            blockNumber: log.blockNumber || 0n,
            amount: Number(log.args.totalRepaid) / 1e18,
          });
        });

        // Sort dynamically (newest / highest block first)
        records.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setHistory(records);
      } catch (err) {
        console.error("Failed to fetch on-chain tx history:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLogs();

    // Setup live listener for new events while on page!
    if (publicClient && address) {
      const unwatchOpen = publicClient.watchContractEvent({
        address: ADDRESSES.CollateralManager as `0x${string}`,
        abi: [parseAbiItem('event PositionOpened(uint256 indexed positionId, address indexed borrower, uint256 creditIssued)')],
        eventName: 'PositionOpened',
        args: { borrower: address },
        onLogs: (logs) => {
          logs.forEach((log: any) => {
            setHistory(prev => [{
              type: 'BORROW',
              txHash: log.transactionHash,
              blockNumber: log.blockNumber || 0n,
              amount: Number(log.args.creditIssued) / 1e18,
            }, ...prev]);
          });
        }
      });
      const unwatchRepay = publicClient.watchContractEvent({
        address: ADDRESSES.CollateralManager as `0x${string}`,
        abi: [parseAbiItem('event PositionRepaid(uint256 indexed positionId, address indexed borrower, uint256 totalRepaid)')],
        eventName: 'PositionRepaid',
        args: { borrower: address },
        onLogs: (logs) => {
          logs.forEach((log: any) => {
            setHistory(prev => [{
              type: 'REPAY',
              txHash: log.transactionHash,
              blockNumber: log.blockNumber || 0n,
              amount: Number(log.args.totalRepaid) / 1e18,
            }, ...prev]);
          });
        }
      });

      return () => {
        mounted = false;
        unwatchOpen();
        unwatchRepay();
      };
    }

    return () => { mounted = false; };
  }, [address, publicClient]);

  if (!address) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-slate-400" />
        <p className="text-sm font-bold text-white tracking-widest uppercase">Live Subgraph</p>
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'BORROW' ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#627EEA]/20 text-[#627EEA]'}`}>
                  {tx.type === 'BORROW' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{tx.type === 'BORROW' ? 'Credit Received' : 'Debt Repaid'}</p>
                  <p className="text-[10px] text-slate-500">Block #{tx.blockNumber.toString()}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="text-sm font-black text-white">
                    {tx.type === 'BORROW' ? '+' : '-'} {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} mINR
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
