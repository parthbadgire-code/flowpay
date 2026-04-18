'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, QrCode, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useWallet } from '@/hooks/useWallet';

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Gasless by Default',
    desc: 'Never worry about native gas tokens again. We sponsor or abstract gas fees across all supported chains.',
    color: '#A99BFF',
    bg: 'rgba(124,110,255,0.1)',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Instant INR',
    desc: 'Convert crypto to fiat instantly for real-world merchant payments.',
    color: '#A99BFF',
    bg: 'rgba(124,110,255,0.1)',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'NFT Liquidity',
    desc: 'Borrow against blue-chip NFTs instantly to fund your transactions without selling.',
    color: '#A99BFF',
    bg: 'rgba(124,110,255,0.1)',
  },
  {
    icon: <QrCode className="w-5 h-5" />,
    title: 'Cross-Chain Routing',
    desc: 'Our algorithm automatically bridges and swaps assets behind the scenes to fulfil your payment requires.',
    color: '#A99BFF',
    bg: 'rgba(124,110,255,0.1)',
  },
];

const cardGlass = {
  background: 'rgba(18, 16, 34, 0.8)',
  border: '1px solid rgba(124,110,255,0.15)',
  borderRadius: '1rem',
  backdropFilter: 'blur(20px)',
};

export default function LandingPage() {
  const router = useRouter();
  const { tryDemo } = useWallet();

  const handleDemo = async () => {
    await tryDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0D0D14' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-16 pt-16">
        {/* background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(107,92,231,0.1) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(124,110,255,0.07) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-5"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Turning<br />
              fragmented<br />
              crypto into<br />
              <span style={{ background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                usable money.
              </span>
            </motion.h1>

            <motion.p
              className="text-slate-400 text-base leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              Wallets show what you own. We show what you can spend. Experience frictionless liquidity across chains, tokens, and real-world assets.
            </motion.p>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/connect">
                <button
                  id="hero-login"
                  className="px-6 py-3 text-sm font-bold text-white rounded-full transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 60%, #6B5CE7 100%)',
                    boxShadow: '0 4px 20px rgba(124,110,255,0.4)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(124,110,255,0.6)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,110,255,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  Login
                </button>
              </Link>
              <button
                onClick={handleDemo}
                id="hero-try-demo"
                className="px-6 py-3 text-sm font-semibold rounded-full transition-all"
                style={{ background: 'transparent', border: '1px solid rgba(169,155,255,0.35)', color: '#A99BFF' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,110,255,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Try Demo
              </button>
            </motion.div>
          </div>

          {/* Right: Floating stats card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="hidden lg:flex flex-col items-end gap-4"
          >
            {/* Main balance card */}
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ ...cardGlass, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">TOTAL USABLE LIQUIDITY</p>
              <p className="text-4xl font-black text-white mb-4">$12,450.00</p>

              <div className="space-y-2">
                {[
                  { symbol: 'USD Coin', color: '#2775CA', abbr: 'U', amount: '$4,200' },
                  { symbol: 'Ethereum', color: '#627EEA', abbr: 'E', amount: '$8,250' },
                ].map(t => (
                  <div key={t.symbol} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: t.color }}>
                      {t.abbr}
                    </div>
                    <span className="text-sm font-medium text-white flex-1">{t.symbol}</span>
                    <span className="text-sm font-bold text-white">{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment sent notification */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ ...cardGlass, background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.3)' }}>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Payment Sent</p>
                <p className="text-[10px] text-slate-400">₹481 converted by FlowAI</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Illusion of Wealth ── */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black text-white mb-3">The Illusion of Wealth</h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Having assets isn&apos;t the same as having spending power. Traditional wallets trap your value in silos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-5"
            style={cardGlass}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-400">✕</span>
              <span className="text-sm font-bold text-white">The Old Way</span>
            </div>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-white">Send ₹1,000</span>
                <span className="text-xs text-slate-500">Polygon</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-slate-400">USDC</span>
                <span className="text-xs text-slate-300">$10.00</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="text-red-400 text-xs">●</span>
              <span className="text-xs text-red-400">Insufficient Balance</span>
            </div>
          </motion.div>

          {/* FlowPay Routing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-5"
            style={cardGlass}
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: '#A99BFF' }}>✦</span>
              <span className="text-sm font-bold text-white">FlowPay Routing</span>
              <span className="ml-auto text-xs rounded-full px-2 py-0.5 font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>AI Routing</span>
            </div>
            <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-white">Send ₹1,000</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">USES FROM ALL ASSETS</p>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-slate-400">• USDC (Polygon)</span>
                <span className="text-xs text-slate-300">$10.01</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-slate-400">• MATIC (Polygon)</span>
                <span className="text-xs text-slate-300">-$1.18</span>
              </div>
            </div>
            <button
              onClick={handleDemo}
              className="w-full py-3 font-bold text-white text-sm rounded-full"
              style={{ background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 100%)' }}
            >
              Swipe to Pay ✓
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Infrastructure ── */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="text-5xl font-black text-white leading-tight">
            Infrastructure for<br />
            the{' '}
            <span style={{ background: 'linear-gradient(135deg, #A99BFF 0%, #7C6EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              liquid era.
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl group cursor-pointer transition-all"
              style={cardGlass}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,110,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(22,20,42,0.9)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,110,255,0.15)'; (e.currentTarget as HTMLElement).style.background = 'rgba(18, 16, 34, 0.8)'; }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
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
  );
}
