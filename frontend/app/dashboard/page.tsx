'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownToLine, TrendingUp, ArrowUpLeft, Unlock,
  ExternalLink, ToggleLeft, ToggleRight, ChevronRight, CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useCreditLine } from '@/hooks/useCreditLine';
import { Badge } from '@/components/ui';

// Credit components
import { PortfolioSummary } from '@/components/credit/PortfolioSummary';
import { HealthFactorGauge } from '@/components/credit/HealthFactorGauge';
import { RiskMeter } from '@/components/credit/RiskMeter';
import { PriceFeedCard } from '@/components/credit/PriceFeedCard';
import { LoanPositionCard } from '@/components/credit/LoanPositionCard';
import { LoanNFTCard } from '@/components/credit/LoanNFTCard';
import { LoanTable } from '@/components/credit/LoanTable';
import { BorrowingSimulator } from '@/components/credit/BorrowingSimulator';
import { LiquidationAlert, LiquidationToast } from '@/components/credit/LiquidationAlert';
import { DepositModal } from '@/components/credit/DepositModal';
import { BorrowModal } from '@/components/credit/BorrowModal';
import { RepayModal } from '@/components/credit/RepayModal';
import { WithdrawModal } from '@/components/credit/WithdrawModal';
import { INR_PER_USD } from '@/types/creditLine';

const TEAL = '#00D4AA';
const MINT = '#00FF87';
const ORANGE = '#FFA858';
const DARK = '#0D1412';

const cardBg = {
  background: 'rgba(14,22,19,0.92)',
  border: '1px solid rgba(0,212,170,0.1)',
};

export default function DashboardPage() {
  const { isConnected, address, shortAddress, connect } = useWallet();
  const {
    activeLoans, healthFactor, riskLevel, totalCollateralUSD, totalBorrowedUSD,
    availableCreditUSD, liquidationPrice, collateralRatio, currency, setCurrency,
    mintLoanNFT, fmt,
  } = useCreditLine();

  const [connecting, setConnecting] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    await connect();
    setConnecting(false);
  };

  const riskBadgeVariant = riskLevel === 'safe' ? 'green' : riskLevel === 'moderate' ? 'yellow' : 'red';
  const riskLabel = riskLevel === 'safe' ? '✓ Safe' : riskLevel === 'moderate' ? '⚠ Moderate' : '⚡ Dangerous';
  const hfColor = riskLevel === 'safe' ? MINT : riskLevel === 'moderate' ? ORANGE : '#FF5E5E';

  return (
    <div className="flex flex-col min-h-screen pt-20" style={{ background: '#0D1412' }}>
      
      {/* Liquidation push toast */}
      <LiquidationToast />

      <main className="flex-1 w-full max-w-7xl mx-auto pb-24 lg:pb-10 px-4 lg:px-8">

        {/* ─ Header ─────────────────────────────────────────────────────── */}
        <div className="pt-6 pb-4">
          <motion.div className="flex flex-wrap items-center justify-between gap-3"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <p className="text-slate-500 text-sm font-medium">Credit Line Dashboard</p>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {isConnected ? (shortAddress || '0x742d…f44e') : 'FlowPay Credit'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* USD / INR toggle */}
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{ border: '1px solid rgba(0,212,170,0.2)', color: TEAL, background: 'rgba(0,212,170,0.06)' }}
              >
                {currency === 'USD' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                {currency}
              </button>

              {isConnected && (
                <>
                  <Badge variant={riskBadgeVariant as 'green' | 'yellow' | 'red'} size="sm">
                    {riskLabel}
                  </Badge>
                  <a href={`https://amoy.polygonscan.com/address/${address}`} target="_blank" rel="noopener"
                    className="text-slate-600 hover:text-slate-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─ NO WALLET ──────────────────────────────────────────────── */}
          {!isConnected ? (
            <motion.div key="no-wallet" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170,0.15), rgba(0,255,135,0.1))', border: '1px solid rgba(0,212,170,0.3)', boxShadow: '0 0 40px rgba(0,212,170,0.15)' }}>
                  <span className="text-4xl">🏦</span>
                </div>
                <motion.div className="absolute -top-2 -right-2 w-4 h-4 rounded-full" style={{ background: 'rgba(0, 212, 170,0.6)' }}
                  animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Crypto-Backed Credit Line</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
                Deposit ETH or USDC as collateral and borrow against them instantly. No credit score needed.
              </p>
              <motion.button onClick={handleConnect} disabled={connecting}
                className="px-8 py-3.5 text-sm font-bold text-black rounded-full transition-all disabled:opacity-60 flex items-center gap-2 mb-6"
                style={{ background: 'linear-gradient(135deg, #00D4AA, #00FF87)', boxShadow: '0 4px 24px rgba(0, 212, 170,0.45)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {connecting ? 'Connecting…' : '🔗 Connect Wallet'}
              </motion.button>
              <div className="grid sm:grid-cols-3 gap-3 w-full max-w-lg">
                {[
                  { icon: '🛡️', title: 'Collateral-Backed', desc: 'ETH → 40% LTV · USDC → 80% LTV' },
                  { icon: '⚡', title: 'Instant Liquidity', desc: 'Borrow USDC or mock INR' },
                  { icon: '🖼️', title: 'NFT Receipts', desc: 'Mint your loan as an NFT' },
                ].map(item => (
                  <div key={item.title} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,170,0.1)' }}>
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ─ CONNECTED — Full Credit Dashboard ────────────────────── */
            <motion.div key="connected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* Liquidation alert banner */}
              <LiquidationAlert />

              {/* Portfolio summary strip */}
              <PortfolioSummary />

              {/* Main grid */}
              <div className="grid lg:grid-cols-3 gap-6">

                {/* ── Left / Center (2 cols) ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Deposit', icon: <ArrowDownToLine className="w-5 h-5" />, color: TEAL, bg: 'rgba(0,212,170,0.08)', border: 'rgba(0,212,170,0.2)', action: () => setDepositOpen(true) },
                      { label: 'Borrow', icon: <TrendingUp className="w-5 h-5" />, color: '#00B892', bg: 'rgba(0,184,146,0.08)', border: 'rgba(0,184,146,0.2)', action: () => setBorrowOpen(true) },
                      { label: 'Repay', icon: <ArrowUpLeft className="w-5 h-5" />, color: MINT, bg: 'rgba(0,255,135,0.08)', border: 'rgba(0,255,135,0.2)', action: () => setRepayOpen(true) },
                      { label: 'Withdraw', icon: <Unlock className="w-5 h-5" />, color: ORANGE, bg: 'rgba(255,168,88,0.08)', border: 'rgba(255,168,88,0.2)', action: () => setWithdrawOpen(true) },
                    ].map(action => (
                      <motion.button key={action.label} onClick={action.action}
                        whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group"
                        style={{
                          color: action.color,
                          background: action.bg,
                          border: `1px solid ${action.border}`,
                        }}>
                        <div className="group-hover:scale-110 transition-transform">{action.icon}</div>
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Active Loan Positions */}
                  {activeLoans.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Positions</h2>
                        <Badge variant="green" size="sm">{activeLoans.length} active</Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {activeLoans.map(loan => (
                          <LoanPositionCard key={loan.loanId} loan={loan}
                            onMintNFT={mintLoanNFT}
                            onRepay={() => setRepayOpen(true)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Analytics Panel */}
                  <div className="rounded-2xl p-5" style={cardBg}>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Risk Analytics</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <HealthFactorGauge />
                      <div className="space-y-4">
                        <RiskMeter />
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Liquidation Price', value: liquidationPrice > 0 ? `$${liquidationPrice.toFixed(0)}` : '—', sub: 'ETH/USD trigger', color: '#F87171' },
                            { label: 'Collateral Ratio', value: `${Math.min(collateralRatio, 999).toFixed(0)}%`, sub: '>133% is safe', color: '#34D399' },
                          ].map(item => (
                            <div key={item.label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                              <p className="text-base font-black" style={{ color: item.color }}>{item.value}</p>
                              <p className="text-xs text-slate-600 mt-0.5">{item.sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Borrowing Simulator */}
                  <div className="rounded-2xl p-5" style={cardBg}>
                    <BorrowingSimulator />
                  </div>

                  {/* Loan History Table */}
                  <div className="rounded-2xl p-5" style={cardBg}>
                    <LoanTable onRepay={() => setRepayOpen(true)} />
                  </div>

                </div>

                {/* ── Right Sidebar ── */}
                <div className="space-y-5">

                  {/* Price Feeds */}
                  <div className="rounded-2xl p-5" style={cardBg}>
                    <PriceFeedCard />
                  </div>

                  {/* Loan NFT Cards */}
                  {activeLoans.length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">NFT Receipts</h2>
                      <div className="space-y-4">
                        {activeLoans.slice(0, 2).map(loan => (
                          <LoanNFTCard key={loan.loanId} loan={loan} onMint={mintLoanNFT} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Quick Stats */}
                  <div className="rounded-2xl p-5" style={cardBg}>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Credit Summary</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Total Collateral', value: fmt(totalCollateralUSD), color: '#00FF87' },
                        { label: 'Total Borrowed', value: fmt(totalBorrowedUSD), color: '#00D4AA' },
                        { label: 'Available Credit', value: fmt(availableCreditUSD), color: '#34D399' },
                        { label: 'Health Factor', value: healthFactor === 999 ? '∞' : healthFactor.toFixed(2), color: riskLevel === 'safe' ? '#34D399' : riskLevel === 'moderate' ? '#FBBF24' : '#F87171' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center py-2"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span className="text-xs text-slate-500">{item.label}</span>
                          <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick links to other FlowPay features */}
                  <div className="rounded-2xl p-4" style={{ ...cardBg, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-3">Other Features</p>
                    {[
                      { label: 'Deposit (Swap)', href: '/deposit', icon: '💱' },
                      { label: 'QR Payments', href: '/payment', icon: '📲' },
                      { label: 'Lottery', href: '/lottery', icon: '🎰' },
                    ].map(link => (
                      <Link key={link.href} href={link.href}
                        className="flex items-center justify-between py-2.5 text-sm text-slate-500 hover:text-white transition-colors group">
                        <span className="flex items-center gap-2">
                          <span>{link.icon}</span>{link.label}
                        </span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {depositOpen && <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />}
        {borrowOpen && <BorrowModal isOpen={borrowOpen} onClose={() => setBorrowOpen(false)} />}
        {repayOpen && <RepayModal isOpen={repayOpen} onClose={() => setRepayOpen(false)} />}
        {withdrawOpen && <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
