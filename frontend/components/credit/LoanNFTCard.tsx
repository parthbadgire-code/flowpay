'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Gem, ExternalLink } from 'lucide-react';
import { LoanPosition } from '@/types/creditLine';
import { useCreditLine } from '@/hooks/useCreditLine';
import { INR_PER_USD } from '@/types/creditLine';

interface LoanNFTCardProps {
  loan: LoanPosition;
  onMint: (loanId: string) => Promise<void>;
}

export function LoanNFTCard({ loan, onMint }: LoanNFTCardProps) {
  const { currency, isLoading } = useCreditLine();
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(!!loan.nftTokenId);

  const fmt = (usd: number) =>
    currency === 'INR'
      ? `₹${(usd * INR_PER_USD).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
      : `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

  const handleMint = async () => {
    setMinting(true);
    await onMint(loan.loanId);
    setMinted(true);
    setMinting(false);
  };

  const tokenColor = loan.collateralToken === 'ETH' ? '#627EEA' : '#2775CA';
  const tokenIcon = loan.collateralToken === 'ETH' ? '⟠' : '💵';
  const nftId = loan.nftTokenId ?? `FLP-${loan.loanId.slice(-3)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0, 212, 170,0.25)' }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'rgba(14, 22, 19,0.98)',
        border: '1px solid rgba(0, 212, 170,0.25)',
        cursor: minted ? 'default' : 'pointer',
      }}
    >
      {/* NFT Artwork Area */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tokenColor}18, rgba(0, 212, 170,0.2), rgba(0,255,135,0.15))`,
        }}
      >
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 30px)',
          }}
        />
        {/* Glow orbs */}
        <motion.div
          className="absolute w-20 h-20 rounded-full blur-3xl"
          style={{ background: tokenColor, opacity: 0.2 }}
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full blur-2xl"
          style={{ background: '#00D4AA', opacity: 0.3, right: '20%', top: '20%' }}
          animate={{ x: [0, -15, 0], y: [0, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* NFT content */}
        <div className="relative text-center">
          <div className="text-4xl mb-1">{tokenIcon}</div>
          <p className="text-xs font-bold text-white opacity-80">FlowPay Loan Position</p>
          {minted && (
            <span className="text-xs text-[#00D4AA] font-semibold">#{nftId}</span>
          )}
        </div>

        {minted && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00D4AA]/30 text-[#00D4AA] border border-[#00D4AA]/40">
              ✦ Minted
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white">Loan Position NFT</p>
            <p className="text-xs text-slate-500">#{loan.loanId}</p>
          </div>
          {minted && (
            <button className="text-slate-500 hover:text-white transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-1.5 mb-4">
          {[
            { label: 'Collateral', value: `${loan.collateralAmount} ${loan.collateralToken}` },
            { label: 'Borrowed', value: fmt(loan.borrowedAmountUSD) },
            { label: 'LTV', value: `${(loan.ltv * 100).toFixed(1)}%` },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-slate-500">{row.label}</span>
              <span className="text-white font-semibold">{row.value}</span>
            </div>
          ))}
        </div>

        {!minted ? (
          <button
            onClick={handleMint}
            disabled={minting || loan.status !== 'active'}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
              boxShadow: '0 4px 16px rgba(0, 212, 170,0.35)',
            }}
          >
            {minting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Minting NFT…
              </>
            ) : (
              <>
                <Gem className="w-4 h-4" />
                Mint Loan NFT
              </>
            )}
          </button>
        ) : (
          <div
            className="w-full py-2.5 rounded-xl text-sm font-bold text-[#00D4AA] text-center"
            style={{ background: 'rgba(0, 212, 170,0.1)', border: '1px solid rgba(0, 212, 170,0.2)' }}
          >
            ✦ NFT Receipt Minted
          </div>
        )}
      </div>
    </motion.div>
  );
}
