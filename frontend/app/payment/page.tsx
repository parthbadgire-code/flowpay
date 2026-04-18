'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPay } from '@/lib/flowpayContext';
import { usePrices } from '@/hooks/usePrices';
import { runRoutingEngine } from '@/services/routingEngine';
import { Merchant } from '@/types/payment';
import { SuccessModal } from '@/components/shared/SuccessModal';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

export default function PaymentPage() {
  const router = useRouter();
  const { isConnected, tryDemo } = useWallet();
  const { spend, addLotteryEntry, wallet: contextWallet } = useFlowPay();
  const { snapshot, lockedAt, timeSinceLock, takeSnapshot } = usePrices();

  // Wagmi testnet tx
  const { sendTransactionAsync } = useSendTransaction();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ newBalance: number; txHash?: string } | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  
  const [breakdown, setBreakdown] = useState<any>(null);

  const amountNum = 40; // Hardcoded test amount
  // We mock affordability here directly out of total balance for simplicty
  const affordable = contextWallet.balances.inr >= amountNum;
  const canProceed = merchant !== null && amountNum > 0 && affordable;

  // Auto load merchant
  useEffect(() => {
    if (!isConnected) { tryDemo(); }
    setTimeout(() => {
      setMerchant({
        id: '1',
        name: "Rahul's Chai Stall",
        upiId: 'rahulchai@ybl',
        category: 'Food & Beverage',
        logo: '🏪',
        color: '#00B892',
      });
    }, 1800);
  }, [isConnected, tryDemo]);

  // Lock polling interval counter for UI timer
  const [clock, setClock] = useState(0);
  useEffect(() => {
    if (lockedAt) {
      const interval = setInterval(() => setClock(c => c + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [lockedAt]);

  const handleAnalyze = async () => {
    if (!merchant || !canProceed) return;
    setAnalyzing(true);
    try {
      const newSnapshot = await takeSnapshot();
      const output = runRoutingEngine(amountNum, contextWallet, newSnapshot);
      setBreakdown(output);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePay = async () => {
    if (!merchant || !canProceed || !breakdown) return;
    setConfirming(true);
    let realTxHash = "mocked_tx";

    try {
      // 1. Execute REAL transaction on Polygon Amoy if wagmi available
      // Using a dummy small MATIC transfer to represent the on-chain action
      if (contextWallet.isConnected && contextWallet.address !== '0xDEm0...Flow') {
        try {
          const hash = await sendTransactionAsync({
            to: '0x0000000000000000000000000000000000000000', // burn/dummy target
            value: parseEther('0.0001'),
          });
          realTxHash = hash;
        } catch (err: any) {
          console.log("Wagmi Testnet Tx Failed/Rejected: ", err);
          // Standard error handling, maybe prompt user they rejected the testnet tx
          throw new Error("Transaction rejected!"); 
        }
      }

      // 2. Perform the mocked internal context mutation
      const tx = await spend(amountNum, merchant.name, merchant.logo, breakdown);
      addLotteryEntry();
      
      setSuccessData({ newBalance: tx.flowPayBalanceAfter, txHash: realTxHash });
      setSuccessOpen(true);
    } catch (err) {
      console.log(err);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#080810]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,184,146,0.06) 0%, transparent 60%)' }}
      />

      {/* ── Top Header ── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all bg-white/5 border border-white/10 backdrop-blur-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <span className="text-white font-semibold text-base tracking-wide">Scan QR</span>
        <button
          onClick={() => setTorchOn(t => !t)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 2L16 2L18 8L14 12L14 20L10 20L10 12L6 8L8 2Z" stroke={torchOn ? '#00D4AA' : 'white'} strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 8H18" stroke={torchOn ? '#00D4AA' : 'white'} strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── Camera view ── */}
      <div className="flex-1 flex items-center justify-center relative" style={{ paddingBottom: merchant ? '22rem' : '2rem', paddingTop: '5rem' }}>
        <div className="relative w-64 h-64 border-2 border-primary-500/20 rounded-xl" />
        {!merchant && <motion.p className="absolute text-slate-600 text-sm bottom-[12rem]">Point camera at QR code</motion.p>}
      </div>

      {/* ── Bottom Sheet ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <AnimatePresence>
          {merchant && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              className="max-w-md mx-auto bg-[#121024]/95 border border-primary-500/20 rounded-[1.5rem] p-6 backdrop-blur-3xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-primary-500/15 border border-primary-500/30">
                    {merchant.logo}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">PAYING</p>
                    <p className="font-bold text-white text-lg leading-snug">{merchant.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">AMOUNT</p>
                  <p className="font-black text-2xl text-white">₹{amountNum}</p>
                </div>
              </div>

              {breakdown ? (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Locked Price Breakdown</span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    {breakdown.assetUsage.map((u: any) => (
                      <div key={u.symbol} className="flex justify-between items-center bg-black/40 p-2 rounded-lg">
                        <span className="text-xs font-bold text-white">{u.symbol}</span>
                        <span className="text-xs text-slate-400">Sell {u.amountToSell.toFixed(4)} • ₹{u.inrValue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {lockedAt && (
                     <p className="text-[10px] text-slate-500 mt-2 text-center">
                        Prices locked {(Date.now() - lockedAt) / 1000 | 0} seconds ago
                     </p>
                  )}
                </div>
              ) : (
                <div className="h-4" /> // spacing
              )}

              {/* Action Button */}
              {!breakdown ? (
                <button
                  disabled={!canProceed || analyzing}
                  onClick={handleAnalyze}
                  className="w-full py-4 font-bold text-white flex items-center justify-center gap-2 transition-all rounded-full bg-gradient-to-br from-[#00D4AA] to-[#009C7A]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  {analyzing ? 'Analyzing Routes…' : 'Analyze Wallet'}
                </button>
              ) : (
                <button
                  disabled={confirming}
                  onClick={handlePay}
                  className="w-full py-4 font-bold text-white flex items-center justify-center gap-2 transition-all rounded-full bg-gradient-to-br from-[#00D4AA] to-[#009C7A]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  {confirming ? 'Sending Tx (Testnet)…' : 'Confirm & Pay'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {successData && (
        <SuccessModal
          isOpen={successOpen}
          onClose={() => { setSuccessOpen(false); router.push('/lottery'); }}
          type="payment"
          amount={amountNum}
          merchantName={merchant?.name}
          merchantLogo={merchant?.logo}
          newBalance={successData.newBalance}
          txHash={successData.txHash}
          lotteryEntry={true}
        />
      )}
    </div>
  );
}
