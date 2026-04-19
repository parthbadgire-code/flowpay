'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { usePaymentRouting } from '@/hooks/usePaymentRouting';
import { useFlowPay } from '@/lib/flowpayContext';
import { RouteBreakdown } from '@/components/deposit/RouteBreakdown';
import { SuccessModal } from '@/components/shared/SuccessModal';
import { Button, Card, Input, Badge, Label, Separator } from '@/components/ui';
import { formatINR } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';

const PRESET_AMOUNTS = [100, 200, 300, 500];

export default function DepositPage() {
  const router = useRouter();
  const { tokens, isConnected, tryDemo } = useWallet();
  const { breakdown, loading, computeRoutes } = usePaymentRouting();
  const { deposit, wallet } = useFlowPay();
  const flowPayBalance = wallet.balances.inr;

  const [amount, setAmount] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newBalance, setNewBalance] = useState(flowPayBalance);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
  }, [isConnected, tryDemo]);

  const totalAvailable = tokens.reduce((a, t) => a + t.inrValue, 0);

  const handleAmountChange = useCallback((val: string) => {
    setAmount(val);
    setError('');
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      if (n > totalAvailable) {
        setError(`Max available: ${formatINR(totalAvailable)}`);
        return;
      }
      computeRoutes(n, tokens);
    }
  }, [tokens, totalAvailable, computeRoutes]);

  const handleConfirm = async () => {
    if (!breakdown) return;
    setConfirming(true);
    try {
      await deposit(breakdown.totalINR, breakdown.routes);
      setNewBalance(flowPayBalance + breakdown.totalINR);
      setSuccessOpen(true);
    } finally {
      setConfirming(false);
    }
  };

  const amountNum = parseFloat(amount) || 0;
  const canConfirm = amountNum > 0 && amountNum <= totalAvailable && !!breakdown && !loading;

  return (
<<<<<<< Updated upstream
    <div className="flex min-h-screen bg-[#0A0A0F] pt-20">
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Deposit Funds</h1>
            <p className="text-sm text-slate-500">Convert crypto assets into FlowPay spendable balance</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-5">
          {/* Current Balance */}
          <Card className="flex items-center justify-between">
=======
    <AuthGuard>
      <div className="flex min-h-screen bg-[#0A0A0F] pt-20">
              <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard">
              <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
>>>>>>> Stashed changes
            <div>
              <h1 className="text-2xl font-black text-white">Deposit Funds</h1>
              <p className="text-sm text-slate-500">Convert crypto assets into FlowPay spendable balance</p>
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-5">
            {/* Current Balance */}
            <Card className="flex items-center justify-between">
              <div>
                <Label>Current FlowPay Balance</Label>
                <p className="text-xl font-bold gradient-text mt-1">{formatINR(flowPayBalance)}</p>
              </div>
              <Badge variant="purple" size="md">Active</Badge>
            </Card>

            {/* Amount Input */}
            <Card>
              <h2 className="font-bold text-white mb-4">How much to deposit?</h2>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {PRESET_AMOUNTS.map(p => (
                  <button
                    key={p}
                    onClick={() => handleAmountChange(String(p))}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                      amount === String(p)
                        ? 'bg-primary-600 text-white'
                        : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              <Input
                type="number"
                prefix="₹"
                placeholder="0"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                error={error}
                className="text-xl font-bold"
              />

              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Available: {formatINR(totalAvailable)} across {tokens.length} tokens
              </p>
            </Card>

            {/* Available Assets */}
            <Card>
              <Label className="mb-3">Your Assets</Label>
              <div className="space-y-2">
                {tokens.map(token => (
                  <div key={token.symbol} className="flex items-center gap-3 py-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border flex-shrink-0"
                      style={{ background: `${token.color}20`, borderColor: `${token.color}40` }}
                    >
                      {token.logo}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{token.symbol}</p>
                      <p className="text-xs text-slate-500">{token.amount.toFixed(4)} {token.symbol}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-300">{formatINR(token.inrValue)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Route Breakdown */}
            <RouteBreakdown breakdown={breakdown} loading={loading && amountNum > 0} />

            {/* Confirm */}
            <AnimatePresence>
              {canConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="brand"
                    size="lg"
                    className="w-full"
                    loading={confirming}
                    onClick={handleConfirm}
                    id="confirm-deposit-btn"
                  >
                    {confirming ? 'Processing...' : `Confirm Deposit of ${formatINR(amountNum)}`}
                  </Button>
                  <p className="text-center text-xs text-slate-600 mt-2">
                    Simulated transaction · No real funds transferred
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <SuccessModal
          isOpen={successOpen}
          onClose={() => { setSuccessOpen(false); router.push('/dashboard'); }}
          type="deposit"
          amount={amountNum}
          newBalance={newBalance}
          routes={breakdown?.routes}
          lotteryEntry={false}
        />
      </div>
    </AuthGuard>
  );
}
