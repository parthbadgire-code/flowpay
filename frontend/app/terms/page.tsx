'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, useMotionTemplate } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, AlertTriangle, Scale, Lock, Info, ExternalLink, TrendingUp } from 'lucide-react';

// --- Constants & Styles ---
const cardGlass = {
  background: 'rgba(10,10,10,0.85)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '1.25rem',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
};

const SECTIONS = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: '1. Acceptance of Terms',
    content: 'By accessing or using the FlowPay protocol, you agree to be bound by these Terms and Conditions. The protocol is a decentralized, non-custodial software system that allows users to deposit crypto-assets as collateral and borrow funds based on those assets.',
    color: '#00D4AA',
    bg: 'rgba(0,212,170,0.1)',
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: '2. Risk Disclosure',
    content: 'Markets for digital assets are highly volatile and unpredictable. Price fluctuations can lead to the liquidation of your collateral. You acknowledge that you are solely responsible for monitoring your positions and maintaining a healthy health factor.',
    color: '#B87333',
    bg: 'rgba(184,115,51,0.1)',
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: '3. Non-Custodial Nature',
    content: 'FlowPay does not take custody of your assets. All transactions are governed by smart contracts on the Ethereum/Ethereum-compatible networks. You are solely responsible for the security of your private keys and wallet interactions.',
    color: '#627EEA',
    bg: 'rgba(98,126,234,0.1)',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: '4. Liquidation Policy',
    content: 'If the value of your collateral drops below the required threshold (Minimum Health Factor of 1.0), your position may be liquidated by third-party liquidators to ensure the stability of the protocol. Liquidation involves the sale of your collateral at a discount.',
    color: '#FF5E5E',
    bg: 'rgba(255,94,94,0.1)',
  },
  {
    icon: <Info className="w-5 h-5" />,
    title: '5. No Financial Advice',
    content: 'The information provided on the FlowPay platform does not constitute financial, investment, or legal advice. You should perform your own research and consult with professionals before making any decisions related to digital assets.',
    color: '#00FF87',
    bg: 'rgba(0,255,135,0.1)',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: '6. Profit Commission',
    content: 'In the event that the market value of your collateralized assets increases significantly, FlowPay reserves the right to retain a certain portion of the profit as a commission fee. This fee is calculated based on the net appreciation of the assets while they are deposited in the protocol.',
    color: '#F7931A',
    bg: 'rgba(247,147,26,0.1)',
  },
];

// --- Premium Hooks (copied from landing page for consistency) ---
function useGlobalMouse() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY, smoothX, smoothY };
}

function use3DTilt(strength = 15) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const gX = useMotionValue(50);
  const gY = useMotionValue(50);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * strength);
    rotateY.set(dx * strength);
    gX.set(((e.clientX - rect.left) / rect.width) * 100);
    gY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [rotateX, rotateY, gX, gY, strength]);

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0); rotateY.set(0); gX.set(50); gY.set(50);
  }, [rotateX, rotateY, gX, gY]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const glare = useMotionTemplate`radial-gradient(circle at ${gX}% ${gY}%, rgba(255,255,255,0.07) 0%, transparent 60%)`;
  return { ref, springX, springY, glare };
}

function ParallaxBackground({ smoothX, smoothY }: { smoothX: any; smoothY: any }) {
  const orbs = [
    { cx: 10, cy: 15, size: 400, color: '#B87333', depth: 0.15 },
    { cx: 80, cy: 10, size: 300, color: '#00D4AA', depth: 0.4 },
    { cx: 50, cy: 70, size: 350, color: '#627EEA', depth: 0.25 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => {
        const x = useTransform(smoothX, [0, 1440], [-orb.depth * 40, orb.depth * 40]);
        const y = useTransform(smoothY, [0, 900], [-orb.depth * 30, orb.depth * 30]);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${orb.cx}%`, top: `${orb.cy}%`,
              x, y,
              width: orb.size, height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${orb.color}15 0%, ${orb.color}05 50%, transparent 100%)`,
              filter: `blur(${orb.size * 0.3}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

// --- Components ---
function SectionCard({ s, i }: { s: typeof SECTIONS[0]; i: number }) {
  const { ref, springX, springY, glare } = use3DTilt(10);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      style={{
        ...cardGlass,
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      className="p-8 relative overflow-hidden group mb-6"
    >
      <motion.div className="absolute inset-0 pointer-events-none z-10" style={{ background: glare }} />

      <div className="flex items-start gap-6 relative z-20">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, boxShadow: `0 8px 24px ${s.color}20` }}>
          {s.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</h3>
          <p className="text-sm leading-relaxed text-slate-400 font-medium">{s.content}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent)` }} />
    </motion.div>
  );
}

export default function TermsPage() {
  const router = useRouter();
  const { smoothX, smoothY } = useGlobalMouse();

  return (
    <div className="min-h-screen selection:bg-[#00D4AA]/30 text-slate-200 pt-32 pb-24" style={{ background: '#080808' }}>
      <ParallaxBackground smoothX={smoothX} smoothY={smoothY} />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/')}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#B87333' }}>Legal Documentation</p>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F0EBE3' }}>
            Terms & <br />
            <span style={{ background: 'linear-gradient(135deg, #B87333, #00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Conditions</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            Please read these terms carefully before using the FlowPay protocol. By using the platform, you acknowledge that you understand and accept the risks associated with decentralized finance.
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-6">
          {SECTIONS.map((s, i) => <SectionCard key={i} s={s} i={i} />)}
        </div>

        {/* Footer info (matches layout) */}
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="9" fill="url(#terms-logo-grad)" />
              <path d="M8 16L13 11L16 14L20 10L24 16L20 20L16 17L13 20L8 16Z" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="terms-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D4AA" />
                  <stop offset="1" stopColor="#00FF87" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00D4AA' }}>FlowPay</span>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© 2026 FlowPay. Non-custodial credit.</p>
        </div>
      </div>
    </div>
  );
}
