'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useFlowPayBalance } from '@/hooks/useFlowPayBalance';
import { useFlowPay } from '@/lib/flowpayContext';
import { Merchant } from '@/types/payment';
import { Sidebar, BottomNav } from '@/components/layout/Navigation';
import { QRScanner } from '@/components/payment/QRScanner';
import { SuccessModal } from '@/components/shared/SuccessModal';
import { Button, Card, Input, Badge, Label, Separator } from '@/components/ui';
import { formatINR } from '@/lib/utils';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export default function PaymentPage() {
  const router = useRouter();
  const { isConnected, tryDemo } = useWallet();
  const { flowPayBalance, canAfford } = useFlowPayBalance();
  const { spend, addLotteryEntry } = useFlowPay();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [amount, setAmount] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ newBalance: number; txHash?: string } | null>(null);

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
  }, [isConnected, tryDemo]);

  const amountNum = parseFloat(amount) || 0;
  const affordable = canAfford(amountNum);
  const canPay = merchant !== null && amountNum > 0 && affordable;

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
    <div className="flex min-h-screen bg-[#0A0A0F]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-6 px-4 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <button className="w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">QR Payment</h1>
            <p className="text-sm text-slate-500">Scan a merchant QR or select below</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-5">
          {/* Balance */}
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-400" />
              <Label>FlowPay Balance</Label>
            </div>
            <p className="text-lg font-bold gradient-text">{formatINR(flowPayBalance)}</p>
          </Card>

          {/* QR Scanner */}
          <QRScanner onMerchantSelect={setMerchant} selectedMerchant={merchant} />

          {/* Merchant & Amount */}
          <AnimatePresence>
            {merchant && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Merchant card */}
                <Card className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border flex-shrink-0"
                    style={{ background: `${merchant.color}20`, borderColor: `${merchant.color}40` }}
                  >
                    {merchant.logo}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{merchant.name}</p>
                    <p className="text-sm text-slate-500">{merchant.category}</p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{merchant.upiId}</p>
                  </div>
                  <Badge variant="green" size="sm" className="ml-auto">Verified</Badge>
                </Card>

                {/* Amount */}
                <Card>
                  <h3 className="font-bold text-white mb-3">Enter Amount</h3>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {PRESET_AMOUNTS.map(p => (
                      <button
                        key={p}
                        onClick={() => setAmount(String(p))}
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
                    onChange={e => setAmount(e.target.value)}
                    className="text-xl font-bold"
                  />

                  {/* Balance preview */}
                  {amountNum > 0 && (
                    <div className="mt-3 space-y-2 text-sm">
                      <Separator />
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-500">Balance Before</span>
                        <span className="text-white font-medium">{formatINR(flowPayBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment</span>
                        <span className="text-red-400 font-medium">−{formatINR(amountNum)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-300">Balance After</span>
                        <span className={affordable ? 'text-emerald-400' : 'text-red-400'}>
                          {formatINR(Math.max(flowPayBalance - amountNum, 0))}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Insufficient balance warning */}
                {amountNum > 0 && !affordable && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Insufficient FlowPay balance. <Link href="/deposit" className="underline ml-0.5">Deposit more →</Link>
                  </motion.div>
                )}

                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  disabled={!canPay}
                  loading={confirming}
                  onClick={handleConfirm}
                  id="confirm-payment-btn"
                >
                  {confirming ? 'Processing...' : `Pay ${formatINR(amountNum)} to ${merchant.name}`}
                </Button>
                <p className="text-center text-xs text-slate-600">
                  Simulated payment · Entry into reward pool on success
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />

      {successData && (
        <SuccessModal
          isOpen={successOpen}
          onClose={() => { setSuccessOpen(false); router.push('/dashboard'); }}
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
