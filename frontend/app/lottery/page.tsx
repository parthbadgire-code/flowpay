'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import RewardLotteryConfig from '@/src/contracts/RewardLottery.json';
import { ADDRESSES } from '@/src/contracts/addresses';

export default function LotteryPage() {
  const { isConnected, tryDemo } = useWallet();
  const { address } = useAccount();

  // ----- WAGMI BLOCKCHAIN READS -----
  const { data: participantCount } = useReadContract({
    address: ADDRESSES.RewardLottery as `0x${string}`,
    abi: RewardLotteryConfig.abi,
    functionName: 'getParticipantCount',
    query: { refetchInterval: 5000 }
  });

  const { data: lastWinner } = useReadContract({
    address: ADDRESSES.RewardLottery as `0x${string}`,
    abi: RewardLotteryConfig.abi,
    functionName: 'lastWinner',
    query: { refetchInterval: 5000 }
  });

  const { data: drawInProgress } = useReadContract({
    address: ADDRESSES.RewardLottery as `0x${string}`,
    abi: RewardLotteryConfig.abi,
    functionName: 'drawInProgress',
    query: { refetchInterval: 5000 }
  });

  const { data: myTickets } = useReadContract({
    address: ADDRESSES.RewardLottery as `0x${string}`,
    abi: RewardLotteryConfig.abi,
    functionName: 'ticketCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });
  
  // Hardcode fallback value
  const totalEntries = participantCount !== undefined ? Number(participantCount) : 0;
  const userEntries = myTickets !== undefined ? Number(myTickets) : 0;
  const isDrawing = Boolean(drawInProgress);
  const historicWinner = lastWinner && lastWinner !== '0x0000000000000000000000000000000000000000' 
      ? String(lastWinner) : null;

  // ----- WAGMI BLOCKCHAIN WRITE -----
  const { writeContractAsync } = useWriteContract();
  const [loadingPick, setLoadingPick] = useState(false);

  const handlePickWinner = async () => {
    try {
      setLoadingPick(true);
      if (!ADDRESSES.RewardLottery) throw new Error("Contract Address missing");
      
      await writeContractAsync({
        address: ADDRESSES.RewardLottery as `0x${string}`,
        abi: RewardLotteryConfig.abi,
        functionName: 'requestWinner',
      });
      // The chainlink callback will fire `fulfillRandomWords` asynchronously
    } catch (e) {
      console.error(e);
      alert("Failed to pick winner (User rejected OR not owner)");
    } finally {
      setLoadingPick(false);
    }
  };

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
  }, [isConnected, tryDemo]);


  const capacityPct = Math.min(100, (totalEntries / 100) * 75);
  
  const shortenAddress = (addr: string) => `${addr.slice(0,6)}...${addr.slice(-4)}`;

  const cardStyle = {
    background: 'rgba(18, 16, 34, 0.9)',
    border: '1px solid rgba(0,212,170,0.15)',
    borderRadius: '1.25rem',
    backdropFilter: 'blur(20px)',
  };

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen" style={{ background: '#0D0D14' }}>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 pt-24 pb-8">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">

            {/* ── Left: Payment Success Card ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl p-8 relative overflow-hidden min-h-[520px] flex flex-col items-center"
              style={{
                background: 'rgba(14, 12, 28, 0.95)',
                border: '1px solid rgba(0,212,170,0.12)',
                boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(0,184,146,0.18) 0%, transparent 70%)' }} />
              <div className="absolute top-8 right-8 w-4 h-4 rounded-full"
                style={{ background: 'rgba(0,184,146,0.4)' }} />
              <div className="absolute top-24 right-24 w-3 h-3 rotate-45"
                style={{ background: 'rgba(0,255,135,0.3)' }} />

              <div className="mt-8 mb-5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,184,146,0.2))',
                    border: '2px solid rgba(0,212,170,0.4)',
                    boxShadow: '0 0 30px rgba(0,212,170,0.25)',
                  }}
                >
                  <Check className="w-9 h-9" style={{ color: '#00D4AA' }} strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-1">Payment Successful</h2>
              <p className="text-slate-400 text-sm mb-7">Merchant received ₹100</p>

              <div className="w-full space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.25)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="7" width="20" height="14" rx="2" stroke="#00D4AA" strokeWidth="1.5" />
                        <path d="M16 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="#00D4AA" />
                        <path d="M2 11h20" stroke="#00D4AA" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">PAID FROM</p>
                      <p className="text-white font-semibold text-sm">Main Wallet</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">AMOUNT</p>
                    <p className="text-white font-semibold text-sm">- ₹100</p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between p-4 rounded-2xl cursor-pointer group transition-all"
                  style={{ background: 'rgba(0,184,146,0.12)', border: '1px solid rgba(0,212,170,0.25)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,184,146,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,184,146,0.12)'; }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: 'rgba(0,212,170,0.2)' }}>🎲</div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">Lottery Entry Earned!</p>
                      <p className="text-xs" style={{ color: '#00D4AA' }}>You&apos;re in the next draw.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: '#00D4AA' }} />
                </div>
              </div>

              <Link
                href="/dashboard"
                className="mt-auto text-sm font-medium text-slate-500 hover:text-white transition-colors"
              >
                Return to Dashboard
              </Link>
            </motion.div>

            {/* ── Right: The Vault ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-black text-white mb-4">
                The <span style={{ color: '#00D4AA' }}>Vault</span>
              </h1>

              {/* Active Pool Card */}
              <div className="rounded-2xl p-5 mb-4" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: isDrawing ? 'rgba(255,165,0,0.15)' : 'rgba(0,212,170,0.15)', color: isDrawing ? 'orange' : '#00D4AA', border: '1px solid rgba(0,212,170,0.3)' }}
                  >
                    {isDrawing ? "CHAINLINK VRF DRAWING..." : "VRF ACTIVE POOL"}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Current Prize</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <h3 className="text-2xl font-black text-white">Chainlink Draw</h3>
                  <p className="text-3xl font-black text-white">100 <span className="text-xl">mINR</span></p>
                </div>

                {/* Progress bar */}
                <div className="mb-1">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #00B892, #00D4AA)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${capacityPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">TOTAL ENTRIES (ALL)</p>
                    <p className="text-2xl font-black text-white">{totalEntries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">YOUR TICKETS</p>
                    <p className="text-2xl font-black text-white font-mono">{userEntries}</p>
                  </div>
                </div>
              </div>

              {/* Pick Winner button */}
              <button
                onClick={handlePickWinner}
                disabled={loadingPick || isDrawing || totalEntries === 0}
                className="w-full py-4 mb-5 flex items-center justify-center gap-2 font-bold text-white rounded-2xl transition-all disabled:opacity-60"
                style={{
                  background: 'rgba(18,16,34,0.9)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  boxShadow: '0 0 0 0 rgba(0,255,135,0)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,184,146,0.15)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(18,16,34,0.9)'; }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#00D4AA' }} />
                <span style={{ color: '#00D4AA' }}>{isDrawing ? 'Awaiting Oracle Fulfillment...' : loadingPick ? 'Requesting...' : 'Request Winner (Admin)'}</span>
              </button>

              {/* Recent Winners */}
              {historicWinner && (
              <div>
                <h3 className="text-lg font-black text-white mb-3">Latest Winner</h3>
                <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={cardStyle}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #00D4AA, #009C7A)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.5" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{shortenAddress(historicWinner)}</p>
                        <p className="text-xs text-green-400">Verified by VRF</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#00D4AA' }}>
                        100 mINR
                      </p>
                    </motion.div>
                </div>
              </div>
              )}
            </motion.div>
          </div>
        </main>

        <footer className="py-8 mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-white font-black text-lg mb-3">FlowPay</p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500 mb-3">
              <button className="hover:text-slate-300 transition-colors">Privacy</button>
              <button className="hover:text-slate-300 transition-colors">Terms</button>
              <button className="hover:text-slate-300 transition-colors">Docs</button>
              <button className="hover:text-slate-300 transition-colors">Security</button>
            </div>
            <p className="text-xs text-slate-600">© 2024 FlowPay Protocol. Liquid assets, unified.</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}