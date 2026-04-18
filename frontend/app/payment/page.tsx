'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { useFlowPay } from '@/lib/flowpayContext';
import { Merchant } from '@/types/payment';
import { SuccessModal } from '@/components/shared/SuccessModal';

export default function PaymentPage() {
  const router = useRouter();
  const { isConnected, tryDemo } = useWallet();
  const { canAfford } = useFlowPayBalance();
  const { spend, addLotteryEntry } = useFlowPay();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ newBalance: number; txHash?: string } | null>(null);
  const [torchOn, setTorchOn] = useState(false);

  const amountNum = 40;
  const affordable = canAfford(amountNum);
  const canPay = merchant !== null && amountNum > 0 && affordable;

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
    setTimeout(() => {
      setMerchant({
        id: '1',
        name: "Rahul's Chai Stall",
        upiId: 'rahulchai@ybl',
        category: 'Food & Beverage',
        logo: '🏪',
        color: '#7C6EFF',
        walletAddress: '0xabc...',
      });
    }, 1800);
  }, [isConnected, tryDemo]);

  const handleConfirm = async () => {
    if (!merchant || !canPay) return;
    setConfirming(true);
    try {
      const tx = await spend(amountNum, merchant.name, merchant.logo);
      addLotteryEntry();
      setSuccessData({ newBalance: tx.flowPayBalanceAfter, txHash: tx.txHash });
      setSuccessOpen(true);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: '#080810' }}
    >
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(107,92,231,0.06) 0%, transparent 60%)',
        }}
      />

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-6 pb-4">
        <Link href="/dashboard">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>

        <span className="text-white font-semibold text-base tracking-wide">Scan QR</span>

        <button
          onClick={() => setTorchOn(t => !t)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: torchOn ? 'rgba(169,155,255,0.3)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${torchOn ? 'rgba(169,155,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Torch / flashlight icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 2L16 2L18 8L14 12L14 20L10 20L10 12L6 8L8 2Z" stroke={torchOn ? '#A99BFF' : 'white'} strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M6 8H18" stroke={torchOn ? '#A99BFF' : 'white'} strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── Camera view / QR frame ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative" style={{ paddingBottom: merchant ? '22rem' : '2rem', paddingTop: '5rem' }}>
        {/* QR bracket frame */}
        <div className="relative w-64 h-64">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-10 h-10" style={{ borderTop: '3px solid #A99BFF', borderLeft: '3px solid #A99BFF', borderRadius: '4px 0 0 0' }} />
          <div className="absolute top-0 right-0 w-10 h-10" style={{ borderTop: '3px solid #A99BFF', borderRight: '3px solid #A99BFF', borderRadius: '0 4px 0 0' }} />
          <div className="absolute bottom-0 left-0 w-10 h-10" style={{ borderBottom: '3px solid #A99BFF', borderLeft: '3px solid #A99BFF', borderRadius: '0 0 0 4px' }} />
          <div className="absolute bottom-0 right-0 w-10 h-10" style={{ borderBottom: '3px solid #A99BFF', borderRight: '3px solid #A99BFF', borderRadius: '0 0 4px 0' }} />

          {/* Center focus dot / icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ border: '2px solid rgba(169,155,255,0.25)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="rgba(169,155,255,0.6)" strokeWidth="1.5"/>
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="rgba(169,155,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Animated scan line */}
          <div
            className="absolute left-2 right-2 h-[2px] animate-scan-line"
            style={{
              background: 'linear-gradient(90deg, transparent, #A99BFF, transparent)',
              boxShadow: '0 0 12px rgba(169,155,255,0.8)',
              top: '8px',
            }}
          />
        </div>

        {/* Subtitle */}
        {!merchant && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute text-slate-600 text-sm"
            style={{ bottom: '12rem' }}
          >
            Point camera at QR code
          </motion.p>
        )}
      </div>

      {/* ── Bottom Sheet ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <AnimatePresence>
          {merchant && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-w-md mx-auto"
              style={{
                background: 'rgba(18, 16, 36, 0.95)',
                border: '1px solid rgba(124,110,255,0.2)',
                borderRadius: '1.5rem',
                padding: '1.5rem',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 -4px 40px rgba(0,0,0,0.7)',
              }}
            >
              {/* Merchant info */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(124,110,255,0.15)', border: '1px solid rgba(124,110,255,0.3)' }}
                  >
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

              {/* Source assets */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">Source Assets</span>
                  <span className="text-xs font-semibold" style={{ color: '#A99BFF' }}>Smart Route</span>
                </div>
                <div
                  className="flex items-center justify-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* USDC pill */}
                  <div
                    className="flex items-center gap-2 py-1.5 px-3 rounded-xl"
                    style={{ background: 'rgba(13,13,20,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: '#2775CA' }}>U</div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">USDC</p>
                      <p className="text-[10px] text-slate-500">0.38</p>
                    </div>
                  </div>

                  <span className="text-slate-600">+</span>

                  {/* MATIC pill */}
                  <div
                    className="flex items-center gap-2 py-1.5 px-3 rounded-xl"
                    style={{ background: 'rgba(13,13,20,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: '#8247E5' }}>M</div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">MATIC</p>
                      <p className="text-[10px] text-slate-500">0.12</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyze & Pay button */}
              <button
                disabled={!canPay}
                onClick={handleConfirm}
                className="w-full py-4 font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: confirming
                    ? 'linear-gradient(135deg, #7C6EFF, #6B5CE7)'
                    : 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 60%, #6B5CE7 100%)',
                  borderRadius: '9999px',
                  boxShadow: canPay ? '0 4px 24px rgba(124,110,255,0.45)' : 'none',
                }}
              >
                <Zap className="w-4 h-4 fill-white" />
                {confirming ? 'Processing…' : 'Analyze & Pay'}
              </button>
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
