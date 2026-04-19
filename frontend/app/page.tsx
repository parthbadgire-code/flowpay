
'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Zap,
  Shield,
  QrCode,
  ChevronRight,
  Sparkles,
  Lock,
  Wallet,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const FEATURES = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Deposit as Collateral',
    desc: 'Lock ETH at 40% LTV or USDC at 80% LTV. Your assets stay on-chain — you stay in control.',
    color: '#00D4AA',
    bg: 'rgba(0,212,170,0.1)',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Borrow Instantly',
    desc: 'Draw a line of credit against your collateral in seconds. No credit score. No paperwork.',
    color: '#B87333',
    bg: 'rgba(184,115,51,0.1)',
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    title: 'Spend in INR',
    desc: 'Borrowed funds land straight in your FlowPay wallet as spendable INR — ready for real-world payments.',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.1)',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Real-Time Risk Engine',
    desc: 'Chainlink price feeds update your health factor live. Get alerts before you ever approach liquidation.',
    color: '#C25A2A',
    bg: 'rgba(194,90,42,0.1)',
  },
];

const cardGlass = {
  background: 'rgba(10, 10, 10, 0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '1.25rem',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
};

const cardBrown = {
  background: 'rgba(10,7,5,0.9)',
  border: '1px solid rgba(184,115,51,0.15)',
  borderRadius: '1.25rem',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
};

const BackgroundEffects = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div
      className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
      style={{
        background:
          'radial-gradient(circle, rgba(184,115,51,0.12) 0%, transparent 70%)',
      }}
    />
    <div
      className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
      style={{
        background:
          'radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)',
      }}
    />
    <div
      className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px]"
      style={{
        background:
          'radial-gradient(circle, rgba(194,90,42,0.06) 0%, transparent 70%)',
      }}
    />
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const { tryDemo } = useWallet();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleDemo = async () => {
    await tryDemo();
    router.push('/dashboard');
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-[#00D4AA]/30 text-slate-200"
      style={{ background: '#080808' }}
    >
      <section className="relative min-h-screen flex items-center px-6 lg:px-16 pt-24 overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div style={{ y: yOffset }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{
                background: 'rgba(184,115,51,0.1)',
                borderColor: 'rgba(184,115,51,0.25)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#B87333' }} />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: '#B87333' }}
              >
                Crypto-Backed Credit · Live on Polygon
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl lg:text-[5rem] font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your crypto.
              <br />
              Your collateral.
              <br />
              <span className="relative">
                <span
                  className="absolute -inset-1 blur-lg opacity-25"
                  style={{
                    background:
                      'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)',
                  }}
                />
                <span
                  className="relative"
                  style={{
                    background:
                      'linear-gradient(135deg, #B87333 0%, #C25A2A 40%, #00D4AA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Your credit.
                </span>
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg font-medium"
              style={{ color: 'rgba(240,235,227,0.5)' }}
            >
              Deposit ETH or USDC as collateral. Borrow instantly against it.
              Spend as INR directly from your FlowPay wallet — no bank, no credit score.
            </motion.p>

            <motion.div className="flex flex-wrap items-center gap-4">
              {user ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="group relative px-8 py-4 font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
                        boxShadow: '0 8px 30px rgba(0,212,170,0.3)',
                        color: '#080808',
                      }}
                    >
                      Connect Wallet
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <button
                  onClick={() => router.push('/connect')}
                  className="group relative px-8 py-4 font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)',
                    boxShadow: '0 8px 30px rgba(0,212,170,0.3)',
                    color: '#080808',
                  }}
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleDemo}
                className="px-8 py-4 font-bold rounded-full transition-all flex items-center gap-2 group"
                style={{
                  background: 'rgba(184,115,51,0.07)',
                  border: '1px solid rgba(184,115,51,0.25)',
                  color: '#B87333',
                }}
              >
                Explore Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl group cursor-pointer transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              style={i % 2 === 0 ? cardGlass : cardBrown}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer
        className="py-12 mt-12 relative z-10"
        style={{
          borderTop: '1px solid rgba(184,115,51,0.1)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)',
              }}
            />
            <p className="text-white font-black text-xl tracking-tight">FlowPay</p>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
            {['Protocol', 'Risk Docs', 'Chainlink', 'Privacy'].map((l) => (
              <button key={l} className="hover:text-[#B87333] transition-colors">
                {l}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-700 font-medium">
            © 2026 FlowPay. Non-custodial credit.
          </p>
        </div>
      </footer>
    </div>
  );
}

