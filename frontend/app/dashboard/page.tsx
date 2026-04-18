'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Wallet, ArrowDownToLine, QrCode, Trophy, Gem, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { useFlowPay } from '@/lib/flowpayContext';
import { TokenCard } from '@/components/dashboard/TokenCard';
import { FlowPayBalanceCard } from '@/components/dashboard/FlowPayBalanceCard';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import { NFTBackupModal } from '@/components/nft/NFTBackupModal';
import { Badge, Card } from '@/components/ui';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardPage() {
  const { isConnected, address, shortAddress, tokens, nfts, totalPortfolioINR, connect } = useWallet();
  const { flowPayBalance } = useFlowPayBalance();
  const { paymentHistory, depositHistory } = useFlowPay();
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    await connect();
    setConnecting(false);
  };

  const QUICK_ACTIONS = [
    { icon: <ArrowDownToLine className="w-5 h-5" />, label: 'Deposit', href: '/deposit', color: 'text-primary-400', bg: 'bg-primary-600/10', border: 'border-primary-500/20' },
    { icon: <QrCode className="w-5 h-5" />, label: 'Scan QR', href: '/payment', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Lottery', href: '/lottery', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { icon: <Gem className="w-5 h-5" />, label: 'NFTs', href: '#', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', onClick: () => setNftModalOpen(true) },
  ];

  const cardStyle = { background: 'rgba(18,16,34,0.85)', border: '1px solid rgba(124,110,255,0.15)' };

  return (
    <div className="flex flex-col min-h-screen pt-20" style={{ background: '#0D0D14' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto pb-24 lg:pb-10 px-4 lg:px-8">

        {/* Header */}
        <div className="pt-6 pb-4">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <p className="text-slate-500 text-sm">
                {isConnected ? 'Good evening 👋' : 'Welcome to FlowPay 👋'}
              </p>
              <h1 className="text-2xl font-black text-white">
                {isConnected ? (shortAddress || '0x742d…f44e') : 'Your Dashboard'}
              </h1>
            </div>

            {isConnected && (
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
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── NO WALLET — Empty State ─────────────────────────────────── */}
          {!isConnected ? (
            <motion.div
              key="no-wallet"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              {/* Glowing wallet illustration */}
              <div className="relative mb-8">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
                  style={{
                    background: 'linear-gradient(135deg, rgba(169,155,255,0.15), rgba(107,92,231,0.1))',
                    border: '1px solid rgba(124,110,255,0.3)',
                    boxShadow: '0 0 40px rgba(124,110,255,0.15)',
                  }}
                >
                  <Wallet className="w-10 h-10" style={{ color: '#A99BFF' }} />
                </div>
                {/* Floating orbs */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
                  style={{ background: 'rgba(169,155,255,0.4)' }}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full"
                  style={{ background: 'rgba(124,110,255,0.5)' }}
                  animate={{ y: [0, 6, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
              </div>

              <h2 className="text-2xl font-black text-white mb-3">No assets yet</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                Connect your Web3 wallet to see your crypto assets, FlowPay balance, and transaction history.
              </p>

              {/* Connect Wallet button */}
              <motion.button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="px-8 py-3.5 text-sm font-bold text-white rounded-full transition-all disabled:opacity-60 flex items-center gap-2 mb-4"
                style={{
                  background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 60%, #6B5CE7 100%)',
                  boxShadow: '0 4px 24px rgba(124,110,255,0.45)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 32px rgba(124,110,255,0.6)' }}
                whileTap={{ scale: 0.98 }}
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </>
                )}
              </motion.button>

              <p className="text-xs text-slate-600">
                Supports MetaMask, Phantom, WalletConnect & Coinbase
              </p>

              {/* Subtle info cards below */}
              <div className="grid sm:grid-cols-3 gap-3 mt-12 w-full max-w-2xl">
                {[
                  { icon: '🌐', title: 'Multi-chain', desc: 'USDC, MATIC, ETH & more' },
                  { icon: '⚡', title: 'Instant INR', desc: 'Spend crypto like cash' },
                  { icon: '🔒', title: 'Non-custodial', desc: 'Your keys, your assets' },
                ].map(item => (
                  <div
                    key={item.title}
                    className="rounded-2xl p-4 text-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,110,255,0.1)' }}
                  >
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ─── CONNECTED — Full Dashboard ─────────────────────────────── */
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Portfolio Overview */}
              <Card className="relative overflow-hidden" style={cardStyle}>
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

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action) => (
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

              {/* Main Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
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
                        <button onClick={() => setNftModalOpen(true)} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
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
                            <div className="w-full h-24 rounded-lg bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center text-3xl mb-2">🖼️</div>
                            <p className="text-xs font-bold text-white truncate">{nft.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <TransactionHistory payments={paymentHistory} deposits={depositHistory} />
                </div>

                {/* Right: Balance + Network */}
                <div className="space-y-4">
                  <FlowPayBalanceCard />
                  <Card style={cardStyle}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <NFTBackupModal isOpen={nftModalOpen} onClose={() => setNftModalOpen(false)} nfts={nfts} />
    </div>
  );
}
