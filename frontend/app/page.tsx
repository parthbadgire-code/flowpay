'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, QrCode, BarChart3, ChevronRight, Sparkles, Network, Activity } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { CryptoPriceCard } from '@/components/ui/CryptoPriceCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Gasless by Default',
    desc: 'Never worry about native gas tokens again. We sponsor or abstract gas fees across all supported chains.',
    color: '#00D4AA',
    bg: 'rgba(0,212,170,0.1)',
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Instant INR',
    desc: 'Convert crypto to fiat instantly for real-world merchant payments.',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.1)',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'NFT Liquidity',
    desc: 'Borrow against blue-chip NFTs instantly to fund your transactions without selling.',
    color: '#00D4AA',
    bg: 'rgba(0,212,170,0.1)',
  },
  {
    icon: <Network className="w-5 h-5" />,
    title: 'Cross-Chain Routing',
    desc: 'Our algorithm automatically bridges and swaps assets behind the scenes to fulfil your payment requires.',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.1)',
  },
];

const cardGlass = {
  background: 'rgba(20, 32, 29, 0.7)',
  border: '1px solid rgba(0,212,170,0.15)',
  borderRadius: '1.25rem',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
};

const BackgroundEffects = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)' }} />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)' }} />
    {/* Grid Floor */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-[0.03]"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,212,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        transform: 'perspective(1000px) rotateX(80deg) scale(2)',
        transformOrigin: 'bottom',
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
    <div className="min-h-screen overflow-x-hidden selection:bg-[#00D4AA]/30 text-slate-200" style={{ background: '#0D1412' }}>
      
      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-16 pt-24 overflow-hidden">
        <BackgroundEffects />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <motion.div style={{ y: yOffset }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{ background: 'rgba(0,212,170,0.1)', borderColor: 'rgba(0,212,170,0.2)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D4AA]">FlowPay V2 is live</span>
            </motion.div>
            
            <motion.h1
              className="text-5xl sm:text-7xl lg:text-[5rem] font-black leading-[1.05] tracking-tight mb-6"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Turning<br />
              fragmented<br />
              crypto into<br />
              <span className="relative">
                <span className="absolute -inset-1 blur-lg opacity-30" style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)' }} />
                <span className="relative" style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  usable money.
                </span>
              </span>
            </motion.h1>

            <motion.p
              className="text-[#80E9D5]/60 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Wallets show what you own. We show what you can spend. Experience frictionless liquidity across chains, tokens, and real-world assets.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {user ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="group relative px-8 py-4 font-bold text-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3)' }}
                    >
                      <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                      Connect Wallet
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <button
                  onClick={() => router.push('/connect')}
                  className="group relative px-8 py-4 font-bold text-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3)' }}
                >
                  <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                  Sign In to Connect
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={handleDemo}
                className="px-8 py-4 font-bold rounded-full transition-all flex items-center gap-2 group"
                style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,170,0.1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,212,170,0.2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,170,0.05)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                Explore Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Floating Visuals */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:flex relative h-full min-h-[500px] w-full"
          >
            {/* Ambient rotating glowing orb */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none"
              style={{ background: 'conic-gradient(from 0deg, #00D4AA, #00FF87, #00D4AA)' }}
            />

            {/* Main Mockup Card */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotateX: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute top-[10%] right-[10%] w-full max-w-[360px] p-6"
              style={{ ...cardGlass, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', transformStyle: 'preserve-3d' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] text-[#00D4AA] font-bold uppercase tracking-[0.2em] mb-1">Total Liquid Power</p>
                  <p className="text-4xl font-black text-white">$12,450.00</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00D4AA]/20 border border-[#00D4AA]/30">
                  <span className="text-[#00D4AA] font-bold">FL</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {[
                  { symbol: 'USD Coin', color: '#2775CA', abbr: 'U', amount: '$4,200', change: '+1.2%' },
                  { symbol: 'Ethereum', color: '#627EEA', abbr: 'E', amount: '$8,250', change: '+4.5%' },
                ].map(t => (
                  <div key={t.symbol} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors cursor-default">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-lg" style={{ background: t.color }}>
                      {t.abbr}
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-white mb-0.5">{t.symbol}</span>
                      <span className="block text-[10px] font-medium text-[#00D4AA]">{t.change}</span>
                    </div>
                    <span className="text-sm font-black text-white">{t.amount}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Secondary Floating Notification */}
            <motion.div
              animate={{ y: [10, -10, 10], x: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-[20%] left-[-10%] flex items-center gap-3 px-5 py-4 rounded-2xl z-20 backdrop-blur-xl"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#00FF87]/20 shadow-[0_0_15px_rgba(0,255,135,0.4)]">
                <ArrowRight className="w-4 h-4 text-[#00FF87]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Payment Routed</p>
                <p className="text-[11px] text-[#00FF87]/80">Optimized via Cross-Chain Swaps</p>
              </div>
            </motion.div>

            {/* Tertiary Element: Microchart */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 2 }}
              className="absolute top-[5%] left-[5%] rounded-xl p-3 z-0"
              style={{ background: 'rgba(20, 32, 29, 0.4)', border: '1px solid rgba(0,212,170,0.1)', backdropFilter: 'blur(10px)' }}
            >
              <Activity className="w-6 h-6 text-[#00D4AA] opacity-50" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Core Value Prop ── */}
      <section className="py-32 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">The Illusion of Wealth</h2>
          <p className="text-[#80E9D5]/60 text-lg max-w-2xl mx-auto">
            Traditional wallets trap your value in isolated silos. We break down the barriers using intent-based unified routing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -20, rotateY: 10 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 relative overflow-hidden group"
            style={cardGlass}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/30" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-black">×</div>
              <span className="text-lg font-bold text-white">The Old Way</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl p-5 bg-black/20 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-bold text-white">Send ₹10,000</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-md text-slate-400">Polygon</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-slate-400">USDC Balance</span>
                  <span className="text-sm font-bold text-white">$100.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 text-red-400">
                  <span className="text-sm font-medium">Missing Native Gas (MATIC)</span>
                  <span className="text-xs px-2 py-1 bg-red-500/10 rounded-md">Transaction Failed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FlowPay Routing */}
          <motion.div
            initial={{ opacity: 0, x: 20, rotateY: -10 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 relative overflow-hidden group hover:border-[#00D4AA]/50 transition-colors"
            style={{ ...cardGlass, boxShadow: '0 0 40px rgba(0,212,170,0.05)' }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D4AA] to-[#00FF87]" />
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#00D4AA]/10 rounded-full blur-[60px] group-hover:bg-[#00D4AA]/20 transition-all pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#00D4AA]/20 flex items-center justify-center text-[#00D4AA]">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">FlowPay Intent Routing</span>
              <span className="ml-auto text-[10px] rounded-full px-3 py-1 font-black bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20">AI POWERED</span>
            </div>

            <div className="rounded-2xl p-5 bg-black/20 border border-white/5 relative z-10 mb-6 group-hover:border-[#00D4AA]/20 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-white">Send ₹10,000</span>
                <span className="text-xs font-bold text-[#00D4AA]">Any Token, Any Chain</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-xs font-medium text-slate-300">Extracting from ETH (Base)</span>
                  <span className="text-xs font-bold text-white">~$100.20</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                  <span className="text-xs font-medium text-slate-300">Auto-bridging Gas</span>
                  <span className="text-xs font-bold text-[#00FF87]">Abstracted</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDemo}
              className="w-full py-4 font-black text-black text-sm rounded-xl relative overflow-hidden group/btn"
              style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)' }}
            >
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
              <span className="relative flex justify-center items-center gap-2">
                Approve Payment <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#00D4AA]/20 to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Built for the{' '}
            <span style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              liquid era
            </span>
          </h2>
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
              style={cardGlass}
            >
              <div className="absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${f.bg}, transparent)` }} />
              
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110"
                style={{ background: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{f.title}</h3>
              <p className="text-sm text-[#80E9D5]/50 leading-relaxed relative z-10 font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 mt-12 relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00D4AA] to-[#00FF87] rounded-lg shadow-[0_0_15px_rgba(0,212,170,0.5)]" />
            <p className="text-white font-black text-xl tracking-tight">FlowPay</p>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <button className="hover:text-[#00D4AA] transition-colors">Protocol</button>
            <button className="hover:text-[#00D4AA] transition-colors">Security</button>
            <button className="hover:text-[#00D4AA] transition-colors">SDK</button>
            <button className="hover:text-[#00D4AA] transition-colors">Privacy</button>
          </div>
          
          <p className="text-xs text-slate-600 font-medium">© 2026 FlowPay. Unified Liquidity.</p>
        </div>
      </footer>
    </div>
  );
}
