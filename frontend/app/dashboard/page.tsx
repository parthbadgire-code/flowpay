'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp, Wallet, ArrowDownToLine, QrCode, Trophy, Gem, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { useFlowPay } from '@/lib/flowpayContext';
import { Sidebar, BottomNav } from '@/components/layout/Navigation';
import { TokenCard } from '@/components/dashboard/TokenCard';
import { FlowPayBalanceCard } from '@/components/dashboard/FlowPayBalanceCard';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import { NFTBackupModal } from '@/components/nft/NFTBackupModal';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { formatINR, formatAddress } from '@/lib/utils';
import { useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, address, shortAddress, tokens, nfts, totalPortfolioINR, tryDemo } = useWallet();
  const { flowPayBalance } = useFlowPayBalance();
  const { paymentHistory, depositHistory } = useFlowPay();
  const [nftModalOpen, setNftModalOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      tryDemo().then(() => {});
    }
  }, [isConnected, tryDemo]);

  const QUICK_ACTIONS = [
    { icon: <ArrowDownToLine className="w-5 h-5" />, label: 'Deposit', href: '/deposit', color: 'text-primary-400', bg: 'bg-primary-600/10', border: 'border-primary-500/20' },
    { icon: <QrCode className="w-5 h-5" />, label: 'Scan QR', href: '/payment', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Lottery', href: '/lottery', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: <Gem className="w-5 h-5" />, label: 'NFTs', href: '#', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', onClick: () => setNftModalOpen(true) },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />

      <main className="flex-1 lg:ml-64 pb-24 lg:pb-6">
        {/* Header */}
        <div className="px-4 lg:px-8 pt-6 pb-4">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-slate-500 text-sm">Good evening 👋</p>
              <h1 className="text-2xl font-black text-white">
                {shortAddress || '0x742d...f44e'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="green" size="sm">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Polygon Amoy
              </Badge>
              <a
                href={`https://amoy.polygonscan.com/address/${address}`}
                target="_blank"
                rel="noopener"
                className="text-slate-600 hover:text-slate-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="px-4 lg:px-8 space-y-6">
          {/* Portfolio Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-transparent rounded-2xl" />
              <div className="relative grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Crypto Portfolio</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-4xl font-black text-white">
                      <AnimatedCounter value={totalPortfolioINR} prefix="₹" />
                    </p>
                    <Badge variant="green" size="sm">
                      <TrendingUp className="w-3 h-3" />
                      +4.2%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">Across {tokens.length} tokens + {nfts.length} NFTs · Polygon Amoy</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-4 sm:pt-0 sm:pl-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">FlowPay Balance</p>
                  <p className="text-2xl font-black gradient-text">
                    <AnimatedCounter value={flowPayBalance} prefix="₹" />
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Ready to spend</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="grid grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(action => (
                action.href === '#' ? (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${action.bg} ${action.border} ${action.color} hover:opacity-80 transition-all group`}
                  >
                    <div className="group-hover:scale-110 transition-transform">{action.icon}</div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ) : (
                  <Link key={action.label} href={action.href}>
                    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${action.bg} ${action.border} ${action.color} hover:opacity-80 transition-all group cursor-pointer`}>
                      <div className="group-hover:scale-110 transition-transform">{action.icon}</div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                    </div>
                  </Link>
                )
              ))}
            </div>
          </motion.div>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Tokens + History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Token Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Assets</h2>
                  <Badge variant="gray" size="sm">{tokens.length} tokens</Badge>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {tokens.map((token, i) => (
                    <TokenCard key={token.symbol} token={token} index={i} />
                  ))}
                </div>
              </div>

              {/* NFT Preview */}
              {nfts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">NFT Backup</h2>
                    <button
                      onClick={() => setNftModalOpen(true)}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {nfts.map(nft => (
                      <div
                        key={nft.tokenId}
                        onClick={() => setNftModalOpen(true)}
                        className="flex-shrink-0 glass rounded-xl p-3 w-40 cursor-pointer hover:bg-white/[0.07] transition-all"
                      >
                        <div className="w-full h-24 rounded-lg bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center text-3xl mb-2">
                          🖼️
                        </div>
                        <p className="text-xs font-bold text-white truncate">{nft.name}</p>
                        <p className="text-[10px] text-amber-400 mt-0.5">Backup: {formatINR(nft.backupLiquidity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              <TransactionHistory payments={paymentHistory} deposits={depositHistory} />
            </div>

            {/* Right: FlowPay Balance */}
            <div className="space-y-4">
              <FlowPayBalanceCard />

              {/* Network Stats */}
              <Card>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Network</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chain</span>
                    <span className="text-white font-medium">Polygon Amoy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gas Price</span>
                    <span className="text-emerald-400 font-medium">30 Gwei · Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <Badge variant="green" size="sm">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Live
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
      <NFTBackupModal isOpen={nftModalOpen} onClose={() => setNftModalOpen(false)} nfts={nfts} />
    </div>
  );
}
