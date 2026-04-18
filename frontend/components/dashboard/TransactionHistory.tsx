'use client';

import { motion } from 'framer-motion';
import { Clock, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { PaymentTransaction } from '@/types/payment';
import { DepositTransaction } from '@/types/deposit';
import { Card, Badge, StatusDot, Separator } from '@/components/ui';
import { formatINR, formatTimeAgo, formatAddress } from '@/lib/utils';

interface TransactionHistoryProps {
  payments: PaymentTransaction[];
  deposits: DepositTransaction[];
}

type TxItem =
  | { kind: 'payment'; data: PaymentTransaction }
  | { kind: 'deposit'; data: DepositTransaction };

export function TransactionHistory({ payments, deposits }: TransactionHistoryProps) {
  const items: TxItem[] = [
    ...payments.map(d => ({ kind: 'payment' as const, data: d })),
    ...deposits.map(d => ({ kind: 'deposit' as const, data: d })),
  ].sort((a, b) => {
    const ta = a.kind === 'payment' ? a.data.timestamp : a.data.timestamp;
    const tb = b.kind === 'payment' ? b.data.timestamp : b.data.timestamp;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No transactions yet</p>
          <p className="text-xs text-slate-700 mt-1">Deposit funds to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Recent Activity</h3>
        <Clock className="w-4 h-4 text-slate-500" />
      </div>
      <div className="space-y-1">
        {items.slice(0, 8).map((item, i) => (
          <motion.div
            key={item.kind === 'payment' ? item.data.id : item.data.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {i > 0 && <Separator className="my-1" />}
            {item.kind === 'payment' ? (
              <PaymentRow tx={item.data} />
            ) : (
              <DepositRow tx={item.data} />
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function PaymentRow({ tx }: { tx: PaymentTransaction }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2.5 hover:bg-white/[0.02] rounded-xl transition-colors">
      <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-lg flex-shrink-0">
        {tx.merchantLogo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{tx.merchantName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusDot status={tx.status} />
          <p className="text-xs text-slate-500">{formatTimeAgo(new Date(tx.timestamp))} · QR Payment</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-red-400">−{formatINR(tx.amountINR)}</p>
        {tx.txHash && (
          <p className="text-[10px] text-slate-600 font-mono">{formatAddress(tx.txHash)}</p>
        )}
      </div>
    </div>
  );
}

function DepositRow({ tx }: { tx: DepositTransaction }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2.5 hover:bg-white/[0.02] rounded-xl transition-colors">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">Deposit to FlowPay</p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusDot status={tx.status} />
          <p className="text-xs text-slate-500">{formatTimeAgo(new Date(tx.timestamp))} · {tx.routes.map(r => r.symbol).join(' + ')}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-emerald-400">+{formatINR(tx.totalINR)}</p>
        {tx.txHash && (
          <p className="text-[10px] text-slate-600 font-mono">{formatAddress(tx.txHash)}</p>
        )}
      </div>
    </div>
  );
}
