'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { QrCode, Wifi, AlertCircle } from 'lucide-react';
import { mockMerchants } from '@/data/merchants';
import { Merchant } from '@/types/payment';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onMerchantSelect: (merchant: Merchant) => void;
  selectedMerchant: Merchant | null;
}

export function QRScanner({ onMerchantSelect, selectedMerchant }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);

  const handleScan = (merchant: Merchant) => {
    setScanning(false);
    onMerchantSelect(merchant);
  };

  return (
    <div className="space-y-4">
      {/* QR Frame */}
      <Card className="flex flex-col items-center py-8">
        <div className="relative w-52 h-52 mb-4">
          {/* Corners */}
          <div className="qr-corner qr-corner-tl" />
          <div className="qr-corner qr-corner-tr" />
          <div className="qr-corner qr-corner-bl" />
          <div className="qr-corner qr-corner-br" />

          {/* Inner content */}
          <div className="absolute inset-3 rounded-lg bg-white/[0.02] flex flex-col items-center justify-center gap-2 overflow-hidden">
            {scanning ? (
              <>
                {/* Scan line animation */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
                <QrCode className="w-10 h-10 text-primary-500/40" />
                <p className="text-xs text-slate-600 text-center">Scanning...</p>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-xs text-emerald-400 font-medium text-center">Merchant Detected</p>
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500">Or select a merchant below to simulate QR scan</p>
      </Card>

      {/* Merchant selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {mockMerchants.map(merchant => (
          <button
            key={merchant.id}
            onClick={() => handleScan(merchant)}
            className={cn(
              'glass rounded-xl p-3 text-left transition-all duration-200 hover:bg-white/[0.07]',
              selectedMerchant?.id === merchant.id
                ? 'border-primary-500/50 bg-primary-600/10'
                : 'border-white/[0.06]',
            )}
          >
            <div className="text-2xl mb-1">{merchant.logo}</div>
            <p className="text-xs font-semibold text-white">{merchant.name}</p>
            <p className="text-[10px] text-slate-600">{merchant.category}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
