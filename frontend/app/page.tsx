'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wallet, QrCode, BarChart3, Shield, Zap, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button, Card, Badge } from '@/components/ui';
import { useWallet } from '@/hooks/useWallet';
import { formatINR } from '@/lib/utils';

const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Unified INR Balance',
    desc: 'See all your crypto assets as one spendable ₹ balance. No more juggling wallets.',
    color: 'text-primary-400',
    bg: 'bg-primary-600/10',
    border: 'border-primary-500/20',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Smart Asset Routing',
    desc: 'Our algorithm picks the best combination of your assets for each deposit. Stablecoins first.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    border: 'border-accent-500/20',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'QR Payments',
    desc: 'Scan any UPI QR code and pay with your FlowPay balance. Feels just like PhonePe.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'NFT Backup Liquidity',
    desc: 'Use your NFT floor value as backup spending power. Approval-based and secure.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

const DEMO_TOKENS = [
  { symbol: 'USDC', amount: '₹200', logo: '💵', color: '#2775CA' },
  { symbol: 'MATIC', amount: '₹150', logo: '🔷', color: '#8247E5' },
  { symbol: 'ETH', amount: '₹100', logo: '⟠', color: '#627EEA' },
];

const STEPS = [
  { n: '01', title: 'Connect Wallet', desc: 'Link your Polygon wallet. We detect your USDC, MATIC, ETH & NFT balances automatically.' },
  { n: '02', title: 'Deposit to FlowPay', desc: 'Choose an INR amount. Our router selects the best asset combination so you never need to swap manually.' },
  { n: '03', title: 'Spend with QR', desc: 'Pay any merchant instantly using your unified FlowPay balance. Enter the reward pool with every payment.' },
];

export default function LandingPage() {
  const router = useRouter();
  const { tryDemo, isConnected } = useWallet();

  const handleDemo = async () => {
    await tryDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-x-hidden">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="purple" size="md" className="mb-6 mx-auto">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              Built on Polygon Amoy · Hackathon 2026
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Turning fragmented
            <br />
            <span className="gradient-text">crypto into</span>
            <br />
            usable money.
          </motion.h1>

          <motion.p
            className="text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Wallets show what you own.{' '}
            <strong className="text-white">We show what you can spend.</strong>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="brand"
              size="lg"
              icon={<Wallet className="w-5 h-5" />}
              onClick={handleDemo}
              id="hero-connect-wallet"
            >
              Connect Wallet
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={handleDemo}
              id="hero-try-demo"
            >
              Try Demo
            </Button>
          </motion.div>

          {/* Floating wallet cards */}
          <div className="flex justify-center gap-3 flex-wrap">
            {DEMO_TOKENS.map((token, i) => (
              <motion.div
                key={token.symbol}
                className="glass rounded-2xl px-5 py-4 flex items-center gap-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: [0, 1, 1], y: [30, 0, -6, 0] }}
                transition={{ delay: 0.5 + i * 0.15, duration: 1, repeat: Infinity, repeatDelay: 2 + i }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border"
                  style={{ background: `${token.color}20`, borderColor: `${token.color}40` }}
                >
                  {token.logo}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">{token.symbol}</p>
                  <p className="font-bold text-white">{token.amount}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="glass-strong rounded-2xl px-5 py-4 flex items-center gap-3 border border-primary-500/30 glow-purple"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-black text-xs">FP</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-primary-400">FlowPay Balance</p>
                <p className="font-black text-white gradient-text">₹450</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-6 h-6 text-slate-600" />
          </motion.div>
        </div>
      </section>

      {/* ─── Problem Section ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="red" className="mb-4">The Problem</Badge>
          <h2 className="text-4xl font-black text-white mb-4">Your money is trapped.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            You have ₹200 in USDC, ₹150 in MATIC, and ₹100 in ETH — but every wallet says{' '}
            <strong className="text-red-400">"Insufficient Balance"</strong> when you try to use any of it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {DEMO_TOKENS.map((token, i) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center py-6">
                <div className="text-4xl mb-2">{token.logo}</div>
                <p className="text-2xl font-black text-white">{token.amount}</p>
                <p className="text-sm text-slate-500">{token.symbol} balance</p>
                <p className="text-xs text-red-400 mt-2 bg-red-500/10 rounded-lg px-2 py-1">
                  Cannot spend directly
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="glass-strong border border-primary-500/30 rounded-2xl p-6 text-center max-w-sm glow-purple">
            <span className="text-3xl mb-2 block">⚡</span>
            <p className="text-2xl font-black gradient-text mb-1">₹450</p>
            <p className="text-sm text-slate-400">FlowPay Unified Balance</p>
            <p className="text-xs text-emerald-400 mt-2">Ready to spend anywhere</p>
          </div>
        </motion.div>
      </section>

      {/* ─── How it Works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="blue" className="mb-4">How It Works</Badge>
          <h2 className="text-4xl font-black text-white">Three steps to spendable crypto.</h2>
        </motion.div>

        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className="flex gap-6 items-start"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
                <span className="text-white font-black text-sm">{step.n}</span>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="green" className="mb-4">Features</Badge>
          <h2 className="text-4xl font-black text-white">Built for the future of spending.</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full">
                <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} border ${f.border} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="glass-strong rounded-3xl p-12 border border-primary-500/20 glow-purple">
            <span className="text-5xl mb-4 block">🚀</span>
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to unify your crypto?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands of users turning fragmented assets into real spending power.
            </p>
            <Button
              variant="brand"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={handleDemo}
              id="cta-try-flowpay"
            >
              Start with FlowPay
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">FP</span>
            </div>
            <span className="font-bold text-white">FlowPay</span>
          </div>
          <p className="text-xs text-slate-600">
            Built on Polygon Amoy · Hackathon 2026 · Simulation only — not financial advice
          </p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Dashboard</Link>
            <Link href="/deposit" className="hover:text-slate-400 transition-colors">Deposit</Link>
            <Link href="/payment" className="hover:text-slate-400 transition-colors">Pay</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
