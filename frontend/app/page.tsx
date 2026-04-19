'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Zap, Shield,
  ChevronRight, Sparkles, Lock, Wallet, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// ─── Feature Cards ─────────────────────────────────────────────────────────────
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
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]"
      style={{ background: 'radial-gradient(circle, rgba(184,115,51,0.12) 0%, transparent 70%)' }} />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]"
      style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)' }} />
    <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px]"
      style={{ background: 'radial-gradient(circle, rgba(194,90,42,0.06) 0%, transparent 70%)' }} />
    {/* Grid floor */}
    <div
      className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(rgba(184,115,51,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,115,51,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(1000px) rotateX(80deg) scale(2)',
        transformOrigin: 'bottom',
      }}
    />
  </div>
);

// ─── Credit Flow Pipeline (hero right column) ─────────────────────────────────
const STEPS = [
  { id: 'wallet', icon: '⟠', label: 'Your Wallet', sub: '0.5 ETH · 1,000 USDC', color: '#627EEA', glow: 'rgba(98,126,234,0.25)' },
  { id: 'vault', icon: '🔒', label: 'Collateral Vault', sub: '$1,510 locked on-chain', color: '#B87333', glow: 'rgba(184,115,51,0.25)' },
  { id: 'credit', icon: '📈', label: 'Credit Line', sub: '$604 available @ 40% LTV', color: '#00D4AA', glow: 'rgba(0,212,170,0.25)' },
  { id: 'spend', icon: '₹', label: 'FlowPay Wallet', sub: '₹50,433 · Ready to spend', color: '#00FF87', glow: 'rgba(0,255,135,0.25)' },
];

const LIVE_LOG = [
  { t: '0s', msg: 'ETH price feed updated', c: '#B87333' },
  { t: '2s', msg: 'Collateral value: $1,510.40', c: '#627EEA' },
  { t: '4s', msg: 'Health factor: 2.14 ✓', c: '#00FF87' },
  { t: '6s', msg: '₹50,433 credited to wallet', c: '#00D4AA' },
  { t: '8s', msg: 'LTV: 39.7% — within limit', c: '#B87333' },
  { t: '10s', msg: 'Position healthy. No action.', c: '#00D4AA' },
];

function CreditFlowPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [logIdx, setLogIdx] = useState(0);
  const [ltvPct, setLtvPct] = useState(0);
  const [hf, setHf] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLogIdx(i => (i + 1) % LIVE_LOG.length), 1600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v += 1.2;
      setLtvPct(Math.min(v, 39.7));
      if (v >= 39.7) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let v = 0;
    const t = setInterval(() => {
      v += 0.04;
      setHf(Math.min(v, 2.14));
      if (v >= 2.14) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      className="hidden lg:flex flex-col justify-center w-full max-w-[440px] ml-auto gap-3"
    >
      {/* Terminal header bar */}
      <div
        className="rounded-t-2xl px-4 py-2.5 flex items-center gap-2"
        style={{ background: 'rgba(6,6,6,0.98)', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#FF5E5E' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#FFA858' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#00FF87' }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] ml-2" style={{ color: '#B87333' }}>
          flowpay · credit engine · live
        </p>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87' }} />
          <span className="text-[9px]" style={{ color: '#00FF87' }}>ACTIVE</span>
        </div>
      </div>

      {/* Main panel */}
      <div
        className="rounded-b-2xl p-5 space-y-4"
        style={{ background: 'rgba(6,6,6,0.98)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Flow steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => (
            <div key={step.id}>
              <motion.div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                animate={{
                  background: activeStep === i ? `${step.color}12` : 'rgba(255,255,255,0.02)',
                }}
                style={{ border: `1px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.05)'}` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-black flex-shrink-0"
                  style={{
                    background: activeStep === i ? `${step.color}20` : 'rgba(255,255,255,0.04)',
                    boxShadow: activeStep === i ? `0 0 14px ${step.glow}` : 'none',
                    color: activeStep === i ? step.color : '#64748B',
                    border: `1px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: activeStep === i ? '#FFFFFF' : '#475569' }}>
                    {step.label}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: activeStep === i ? step.color : '#334155' }}>
                    {step.sub}
                  </p>
                </div>
                {activeStep === i && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: step.color, boxShadow: `0 0 8px ${step.glow}` }}
                  />
                )}
              </motion.div>

              {i < STEPS.length - 1 && (
                <div className="flex items-center pl-7 py-0.5">
                  <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    className="text-[8px] pl-1"
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                  >▼</motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-px" style={{ background: 'rgba(184,115,51,0.15)' }} />

        {/* Live metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1.5">Current LTV</p>
            <p className="text-lg font-black mb-2" style={{ color: '#B87333', fontFamily: "'Space Grotesk', sans-serif" }}>
              {ltvPct.toFixed(1)}%
            </p>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #B87333, #C25A2A)', width: `${ltvPct}%` }} />
            </div>
            <p className="text-[9px] text-slate-700 mt-1">Max: 40%</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1.5">Health Factor</p>
            <p className="text-lg font-black mb-2" style={{ color: '#00FF87', fontFamily: "'Space Grotesk', sans-serif" }}>
              {hf.toFixed(2)}
            </p>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #00FF87, #00D4AA)', width: `${Math.min((hf / 3) * 100, 100)}%` }} />
            </div>
            <p className="text-[9px] text-slate-700 mt-1">&gt;1.5 = Safe ✓</p>
          </div>
        </div>

        {/* Live log */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>
          <p className="text-[9px] uppercase tracking-wider text-slate-700 mb-2">// system log</p>
          <div className="space-y-1 h-[60px] overflow-hidden">
            {[...LIVE_LOG, ...LIVE_LOG].slice(logIdx, logIdx + 4).map((entry, i) => (
              <motion.p
                key={`${logIdx}-${i}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: i === 0 ? 1 : Math.max(0, 0.35 - i * 0.08) }}
                className="text-[10px] flex gap-2"
              >
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>[{entry.t}]</span>
                <span style={{ color: entry.c }}>{entry.msg}</span>
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen overflow-x-hidden selection:bg-[#00D4AA]/30 text-slate-200" style={{ background: '#080808' }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-16 pt-24 overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div style={{ y: yOffset }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ background: 'rgba(184,115,51,0.1)', borderColor: 'rgba(184,115,51,0.25)' }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#B87333' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B87333' }}>
                Crypto-Backed Credit · Live on Polygon
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-7xl lg:text-[5rem] font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              Your crypto.{' '}<br />
              Your collateral.<br />
              <span className="relative">
                <span className="absolute -inset-1 blur-lg opacity-25"
                  style={{ background: 'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)' }} />
                <span className="relative" style={{
                  background: 'linear-gradient(135deg, #B87333 0%, #C25A2A 40%, #00D4AA 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Your credit.
                </span>
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg font-medium"
              style={{ color: 'rgba(240,235,227,0.5)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
            >
              Deposit ETH or USDC as collateral. Borrow instantly against it.
              Spend as INR directly from your FlowPay wallet — no bank, no credit score.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              {user ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button onClick={openConnectModal}
                      className="group relative px-8 py-4 font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                      Connect Wallet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <button onClick={() => router.push('/connect')}
                  className="group relative px-8 py-4 font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                  Get Started Free <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button onClick={handleDemo}
                className="px-8 py-4 font-bold rounded-full transition-all flex items-center gap-2"
                style={{ background: 'rgba(184,115,51,0.07)', border: '1px solid rgba(184,115,51,0.25)', color: '#B87333' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(184,115,51,0.14)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(184,115,51,0.07)'; }}
              >
                Try Demo
              </button>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              className="flex items-center gap-6 mt-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            >
              {[
                { val: '40%', label: 'ETH LTV' },
                { val: '80%', label: 'USDC LTV' },
                { val: '₹83.5', label: 'per USD' },
                { val: 'Live', label: 'Chainlink feeds' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-sm font-black" style={{ color: '#F0EBE3', fontFamily: "'Space Grotesk', sans-serif" }}>{s.val}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Animated Credit Flow Pipeline */}
          <CreditFlowPipeline />
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#B87333' }}>How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4"
            style={{ color: '#F0EBE3', fontFamily: "'Space Grotesk', sans-serif" }}>
            Three steps to liquid credit
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(240,235,227,0.4)' }}>
            From cold wallet to spendable INR in under 60 seconds. No KYC. No waiting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without FlowPay */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 relative overflow-hidden"
            style={cardGlass}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-red-900/50" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black" style={{ background: 'rgba(255,94,94,0.1)', color: '#FF5E5E' }}>×</div>
              <span className="text-lg font-bold text-white">Without FlowPay</span>
            </div>
            <div className="rounded-2xl p-5 bg-black/30 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-white">Need ₹50,000?</span>
                <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>Binance/WazirX</span>
              </div>
              {[
                { label: 'Sell ETH at market price', tag: 'Realized loss', c: '#FF5E5E' },
                { label: 'Wait 1–3 days for bank transfer', tag: 'Delay', c: '#FFA858' },
                { label: 'Pay 30% crypto tax on gains', tag: 'Taxable event', c: '#FF5E5E' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-white/5">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold" style={{ background: `${row.c}15`, color: row.c }}>{row.tag}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* With FlowPay */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 relative overflow-hidden group"
            style={{ ...cardBrown, boxShadow: '0 0 40px rgba(184,115,51,0.08)' }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #B87333, #C25A2A, #00D4AA)' }} />
            <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-all pointer-events-none" style={{ background: '#B87333' }} />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA' }}>
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">With FlowPay</span>
              <span className="ml-auto text-[10px] rounded-full px-3 py-1 font-black"
                style={{ background: 'rgba(184,115,51,0.15)', color: '#B87333', border: '1px solid rgba(184,115,51,0.25)' }}>
                NON-CUSTODIAL
              </span>
            </div>

            <div className="rounded-2xl p-5 mb-6 relative z-10" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-white">Need ₹50,000?</span>
                <span className="text-xs font-bold" style={{ color: '#00D4AA' }}>Keep your ETH</span>
              </div>
              <div className="space-y-2">
                {[
                  { step: '01', label: 'Deposit 0.5 ETH as collateral', val: '~$1,510', color: '#B87333' },
                  { step: '02', label: 'Borrow $600 against 40% LTV', val: '≈ ₹50,100', color: '#00D4AA' },
                  { step: '03', label: 'Spend via FlowPay wallet', val: 'Instant', color: '#00FF87' },
                ].map(row => (
                  <div key={row.step} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] font-black w-5 text-center" style={{ color: row.color }}>{row.step}</span>
                    <span className="text-xs text-slate-300 flex-1">{row.label}</span>
                    <span className="text-xs font-black" style={{ color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleDemo}
              className="w-full py-4 font-black text-sm rounded-xl relative overflow-hidden group/btn"
              style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
              <span className="relative flex justify-center items-center gap-2">
                Try the Demo <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#B87333]/20 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F0EBE3' }}>
            Built for the{' '}
            <span style={{ background: 'linear-gradient(135deg, #B87333 0%, #C25A2A 40%, #00D4AA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              credit era
            </span>
          </h2>
          <p className="text-base mt-4 max-w-xl mx-auto" style={{ color: 'rgba(240,235,227,0.4)' }}>
            DeFi credit without selling. Spend without losing exposure. Repay when you want.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              className="p-8 rounded-3xl group cursor-pointer transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              style={i % 2 === 0 ? cardGlass : cardBrown}
            >
              <div className="absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{ backgroundImage: `linear-gradient(to bottom right, ${f.bg}, transparent)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110"
                style={{ background: f.bg, color: f.color, border: `1px solid ${f.color}30` }}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed relative z-10 font-medium" style={{ color: 'rgba(240,235,227,0.45)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-12 mt-12 relative z-10"
        style={{ borderTop: '1px solid rgba(184,115,51,0.1)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)', boxShadow: '0 0 15px rgba(184,115,51,0.4)' }} />
            <p className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FlowPay</p>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
            {['Protocol', 'Risk Docs', 'Chainlink', 'Privacy'].map(l => (
              <button key={l} className="hover:text-[#B87333] transition-colors">{l}</button>
            ))}
          </div>
          <p className="text-xs text-slate-700 font-medium">© 2026 FlowPay. Non-custodial credit.</p>
        </div>
      </footer>
    </div>
  );
}
