'use client';

import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  motion, useScroll, useTransform,
  useMotionValue, useSpring, AnimatePresence,
  useMotionTemplate,
} from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Zap, Shield,
  ChevronRight, Sparkles, Lock, Wallet, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// ─── Constants ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Lock className="w-5 h-5" />, title: 'Deposit as Collateral', desc: 'Lock ETH at 40% LTV or USDC at 80% LTV. Your assets stay on-chain — you stay in control.', color: '#00D4AA', bg: 'rgba(0,212,170,0.1)' },
  { icon: <TrendingUp className="w-5 h-5" />, title: 'Borrow Instantly', desc: 'Draw a line of credit against your collateral in seconds. No credit score. No paperwork.', color: '#B87333', bg: 'rgba(184,115,51,0.1)' },
  { icon: <Wallet className="w-5 h-5" />, title: 'Spend in INR', desc: 'Borrowed funds land straight in your FlowPay wallet as spendable INR — ready for real-world payments.', color: '#00FF87', bg: 'rgba(0,255,135,0.1)' },
  { icon: <Shield className="w-5 h-5" />, title: 'Real-Time Risk Engine', desc: 'Chainlink price feeds update your health factor live. Get alerts before you ever approach liquidation.', color: '#C25A2A', bg: 'rgba(194,90,42,0.1)' },
];

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

const RING_TOKENS = [
  { label: 'ETH', icon: '⟠', color: '#627EEA', info: 'Ethereum' },
  { label: 'USDC', icon: '$', color: '#2775CA', info: 'USD Coin' },
  { label: '₹INR', icon: '₹', color: '#00D4AA', info: 'Rupees' },
  { label: 'LINK', icon: '🔗', color: '#375BD2', info: 'Chainlink Oracle' },
  { label: 'MATIC', icon: '⬡', color: '#8247E5', info: 'Polygon Network' },
  { label: 'BTC', icon: '₿', color: '#F7931A', info: 'Bitcoin' },
];

const FLOATING_TOKENS = [
  { symbol: 'ETH', icon: '⟠', color: '#627EEA', glow: 'rgba(98,126,234,0.5)', x: 8, y: 20, delay: 0, layer: 0.4 },
  { symbol: 'USDC', icon: '$', color: '#2775CA', glow: 'rgba(39,117,202,0.5)', x: 85, y: 15, delay: 0.8, layer: 0.6 },
  { symbol: 'MATIC', icon: '⬡', color: '#8247E5', glow: 'rgba(130,71,229,0.5)', x: 5, y: 65, delay: 1.6, layer: 0.3 },
  { symbol: 'INR', icon: '₹', color: '#00D4AA', glow: 'rgba(0,212,170,0.5)', x: 88, y: 70, delay: 2.4, layer: 0.5 },
  { symbol: 'BTC', icon: '₿', color: '#F7931A', glow: 'rgba(247,147,26,0.5)', x: 50, y: 18, delay: 3.2, layer: 0.7 },
];

const cardGlass = { background: 'rgba(10,10,10,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' };
const cardBrown = { background: 'rgba(10,7,5,0.9)', border: '1px solid rgba(184,115,51,0.15)', borderRadius: '1.25rem', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' };

// ─── Global Mouse Tracker ──────────────────────────────────────────────────────
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

// ─── Cursor Glow Trail ─────────────────────────────────────────────────────────
function CursorGlow({ smoothX, smoothY }: { smoothX: ReturnType<typeof useSpring>; smoothY: ReturnType<typeof useSpring> }) {
  const [dots, setDots] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let id = 0;
    const handler = (e: MouseEvent) => {
      const dot = { id: id++, x: e.clientX, y: e.clientY };
      setDots(prev => [...prev.slice(-12), dot]);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main cursor glow */}
      <motion.div
        style={{
          position: 'fixed',
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,115,51,0.06) 0%, rgba(0,212,170,0.03) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
      {/* Trail dots */}
      <AnimatePresence>
        {dots.map((dot, i) => (
          <motion.div
            key={dot.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: dot.x,
              top: dot.y,
              x: '-50%',
              y: '-50%',
              width: 6 - i * 0.3,
              height: 6 - i * 0.3,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#B87333' : '#00D4AA',
              boxShadow: `0 0 6px ${i % 2 === 0 ? '#B87333' : '#00D4AA'}`,
              pointerEvents: 'none',
              zIndex: 49,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Click Shockwave ──────────────────────────────────────────────────────────
function ShockwaveEffect() {
  const [waves, setWaves] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let id = 0;
    const handler = (e: MouseEvent) => {
      setWaves(prev => [...prev, { id: id++, x: e.clientX, y: e.clientY }]);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {waves.map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0.8, scale: 0, x: '-50%', y: '-50%' }}
            animate={{ opacity: 0, scale: 4 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setWaves(prev => prev.filter(x => x.id !== w.id))}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: w.x,
              top: w.y,
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid rgba(184,115,51,0.6)',
              boxShadow: '0 0 20px rgba(184,115,51,0.3)',
              pointerEvents: 'none',
            }}
          />
        ))}
        {waves.map(w => (
          <motion.div
            key={`inner-${w.id}`}
            initial={{ opacity: 0.5, scale: 0, x: '-50%', y: '-50%' }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: w.x,
              top: w.y,
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '2px solid rgba(0,212,170,0.5)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Magnetic Button Hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.4) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 80;
      if (dist < maxDist) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const reset = () => { x.set(0); y.set(0); };

    window.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', reset);
    };
  }, [x, y, strength]);

  return { ref, springX, springY };
}

// ─── 3D Card Tilt Hook ────────────────────────────────────────────────────────
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
    rotateX.set(0);
    rotateY.set(0);
    gX.set(50);
    gY.set(50);
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

// ─── Parallax Layer ──────────────────────────────────────────────────────────
function useParallaxLayer(depth: number) {
  const { smoothX, smoothY } = useGlobalMouse();
  const x = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1440], [-depth * 30, depth * 30]);
  const y = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 900], [-depth * 20, depth * 20]);
  return { x, y };
}

// ─── Interactive Floating Token ───────────────────────────────────────────────
function InteractiveToken({ symbol, icon, color, glow, x: initX, y: initY, delay, layer }: typeof FLOATING_TOKENS[0]) {
  const [isHovered, setIsHovered] = useState(false);
  const tokenX = useMotionValue(0);
  const tokenY = useMotionValue(0);
  const springX = useSpring(tokenX, { stiffness: 80, damping: 12 });
  const springY = useSpring(tokenY, { stiffness: 80, damping: 12 });

  // Mouse repulsion
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        tokenX.set((dx / dist) * force * 40);
        tokenY.set((dy / dist) * force * 40);
      } else {
        tokenX.set(0);
        tokenY.set(0);
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [tokenX, tokenY]);

  return (
    <motion.div
      ref={divRef}
      className="absolute pointer-events-auto hidden lg:flex flex-col items-center gap-1 cursor-pointer"
      style={{
        left: `${initX}%`,
        top: `${initY}%`,
        x: springX,
        y: springY,
        zIndex: 30,
      }}
      animate={{
        opacity: isHovered ? 1 : [0.45, 0.85, 0.45],
        scale: isHovered ? 1.3 : [0.95, 1.05, 0.95],
      }}
      transition={{ opacity: { duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 5, delay, repeat: Infinity, ease: 'easeInOut' } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ rotateY: isHovered ? [0, 360] : 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          width: isHovered ? 56 : 48,
          height: isHovered ? 56 : 48,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${color}dd 0%, ${color}44 100%)`,
          boxShadow: isHovered
            ? `0 0 30px ${glow}, 0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.35)`
            : `0 0 20px ${glow}, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: '#fff',
          border: `1px solid ${isHovered ? color + 'aa' : color + '55'}`,
          transition: 'all 0.3s ease',
        }}
      >
        {icon}
      </motion.div>
      <motion.span
        animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 0 }}
        style={{ fontSize: '9px', color, fontWeight: 700, letterSpacing: '0.1em' }}
      >
        {symbol}
      </motion.span>
      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              marginTop: 6,
              background: 'rgba(8,8,8,0.95)',
              border: `1px solid ${color}44`,
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 10,
              color,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 16px ${color}30`,
            }}
          >
            {symbol}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Hero Background with Parallax Orbs ──────────────────────────────────────
function ParallaxBackground({ smoothX, smoothY }: {
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
}) {
  const orbs = [
    { cx: 5, cy: 10, size: 350, color: '#B87333', depth: 0.2 },
    { cx: 75, cy: 5, size: 220, color: '#00D4AA', depth: 0.5 },
    { cx: 85, cy: 55, size: 280, color: '#627EEA', depth: 0.35 },
    { cx: 40, cy: 75, size: 200, color: '#C25A2A', depth: 0.6 },
    { cx: 60, cy: 30, size: 150, color: '#8247E5', depth: 0.45 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb, i) => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
        const h = typeof window !== 'undefined' ? window.innerHeight : 900;
        const x = useTransform(smoothX, [0, w], [-orb.depth * 40, orb.depth * 40]);
        const y = useTransform(smoothY, [0, h], [-orb.depth * 30, orb.depth * 30]);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${orb.cx}%`,
              top: `${orb.cy}%`,
              x, y,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${orb.color}22 0%, ${orb.color}08 50%, transparent 100%)`,
              filter: `blur(${orb.size * 0.25}px)`,
            }}
          />
        );
      })}

      {/* Perspective grid */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '55vh' }}>
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: ['linear-gradient(rgba(184,115,51,0.5) 1px, transparent 1px)', 'linear-gradient(90deg, rgba(184,115,51,0.5) 1px, transparent 1px)'].join(', '),
            backgroundSize: '60px 60px',
            transform: 'perspective(800px) rotateX(82deg) scaleX(2.5) translateY(30%)',
            transformOrigin: 'bottom center',
            opacity: 0.07,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 70%)',
          }}
        />
        <div style={{ position: 'absolute', bottom: '40%', left: '-20%', right: '-20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,115,51,0.4), rgba(0,212,170,0.3), rgba(184,115,51,0.4), transparent)', filter: 'blur(1px)' }} />
      </div>
    </div>
  );
}

// ─── Credit Flow Pipeline with 3D Tilt ────────────────────────────────────────
function CreditFlowPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [logIdx, setLogIdx] = useState(0);
  const [ltvPct, setLtvPct] = useState(0);
  const [hf, setHf] = useState(0);
  const { ref, springX, springY, glare } = use3DTilt(10);

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
    const t = setInterval(() => { v += 1.2; setLtvPct(Math.min(v, 39.7)); if (v >= 39.7) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    let v = 0;
    const t = setInterval(() => { v += 0.04; setHf(Math.min(v, 2.14)); if (v >= 2.14) clearInterval(t); }, 30);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
        willChange: 'transform',
      }}
      className="hidden lg:flex flex-col justify-center w-full max-w-[440px] ml-auto gap-0"
    >
      {/* Terminal header */}
      <div
        className="rounded-t-2xl px-4 py-2.5 flex items-center gap-2"
        style={{ background: 'rgba(6,6,6,0.98)', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', transform: 'translateZ(16px)' }}
      >
        <div className="flex gap-1.5">
          {['#FF5E5E', '#FFA858', '#00FF87'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] ml-2" style={{ color: '#B87333' }}>flowpay · credit engine · live</p>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF87' }} />
          <span className="text-[9px]" style={{ color: '#00FF87' }}>ACTIVE</span>
        </div>
      </div>

      {/* Main panel with glare */}
      <motion.div
        className="rounded-b-2xl p-5 space-y-4 relative overflow-hidden"
        style={{
          background: 'rgba(6,6,6,0.98)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(184,115,51,0.08)',
          transform: 'translateZ(8px)',
        }}
      >
        {/* Moving glare overlay */}
        <motion.div className="absolute inset-0 pointer-events-none rounded-b-2xl" style={{ background: glare, zIndex: 1 }} />

        <div className="space-y-2 relative z-10">
          {STEPS.map((step, i) => (
            <div key={step.id}>
              <motion.div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                animate={{ background: activeStep === i ? `${step.color}12` : 'rgba(255,255,255,0.02)' }}
                style={{ border: `1px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.05)'}` }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-black flex-shrink-0"
                  style={{ background: activeStep === i ? `${step.color}20` : 'rgba(255,255,255,0.04)', boxShadow: activeStep === i ? `0 0 14px ${step.glow}` : 'none', color: activeStep === i ? step.color : '#64748B', border: `1px solid ${activeStep === i ? step.color + '40' : 'rgba(255,255,255,0.06)'}` }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: activeStep === i ? '#FFFFFF' : '#475569' }}>{step.label}</p>
                  <p className="text-[10px] truncate" style={{ color: activeStep === i ? step.color : '#334155' }}>{step.sub}</p>
                </div>
                {activeStep === i && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: step.color, boxShadow: `0 0 8px ${step.glow}` }} />
                )}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center pl-7 py-0.5">
                  <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} className="text-[8px] pl-1" style={{ color: 'rgba(255,255,255,0.15)' }}>▼</motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="h-px relative z-10" style={{ background: 'rgba(184,115,51,0.15)' }} />

        <div className="grid grid-cols-2 gap-3 relative z-10">
          {[
            { label: 'Current LTV', val: `${ltvPct.toFixed(1)}%`, color: '#B87333', pct: ltvPct, max: 40, grad: 'linear-gradient(90deg, #B87333, #C25A2A)', sub: 'Max: 40%' },
            { label: 'Health Factor', val: hf.toFixed(2), color: '#00FF87', pct: Math.min((hf / 3) * 100, 100), max: 100, grad: 'linear-gradient(90deg, #00FF87, #00D4AA)', sub: '>1.5 = Safe ✓' },
          ].map(m => (
            <div key={m.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1.5">{m.label}</p>
              <p className="text-lg font-black mb-2" style={{ color: m.color, fontFamily: "'Space Grotesk', sans-serif" }}>{m.val}</p>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ background: m.grad, width: `${m.pct}%` }} />
              </div>
              <p className="text-[9px] text-slate-700 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl px-3 py-2.5 relative z-10" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>
          <p className="text-[9px] uppercase tracking-wider text-slate-700 mb-2">// system log</p>
          <div className="space-y-1 h-[60px] overflow-hidden">
            {[...LIVE_LOG, ...LIVE_LOG].slice(logIdx, logIdx + 4).map((entry, i) => (
              <motion.p key={`${logIdx}-${i}`} initial={{ opacity: 0, x: -4 }} animate={{ opacity: i === 0 ? 1 : Math.max(0, 0.35 - i * 0.08) }} className="text-[10px] flex gap-2">
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>[{entry.t}]</span>
                <span style={{ color: entry.c }}>{entry.msg}</span>
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Draggable + Interactive Orbit Ring ───────────────────────────────────────
function OrbitRing() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [speed, setSpeed] = useState(1);
  const dragStart = useRef({ x: 0, angle: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);

  // Auto-spin
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        rotRef.current += 0.3 * speed * (isHovered ? 2 : 1);
        setRotation(rotRef.current);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isDragging, isHovered, speed]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = containerRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    dragStart.current = {
      x: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
      angle: rotRef.current,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotRef.current = dragStart.current.angle + (angle - dragStart.current.x);
    setRotation(rotRef.current);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const radius = 120;

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        ref={containerRef}
        className="relative flex items-center justify-center select-none"
        style={{ width: 300, height: 300, cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Orbit tracks */}
        {[radius, radius - 30].map((r, i) => (
          <div key={r} className="absolute rounded-full"
            style={{
              width: r * 2, height: r * 2,
              border: `1px solid rgba(${i === 0 ? '184,115,51' : '0,212,170'},${isHovered ? 0.25 : 0.12})`,
              transform: `perspective(600px) rotateX(55deg)`,
              transition: 'border-color 0.3s ease',
            }} />
        ))}

        {/* Central orb */}
        <motion.div
          className="absolute z-10"
          animate={{ scale: isHovered ? 1.1 : 1, rotate: -rotation * 0.5 }}
          style={{
            width: 90, height: 90, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(184,115,51,0.9) 0%, rgba(0,212,170,0.4) 60%, transparent 100%)',
            boxShadow: isHovered
              ? '0 0 60px rgba(184,115,51,0.7), 0 0 120px rgba(0,212,170,0.25), inset 0 0 30px rgba(255,255,255,0.15)'
              : '0 0 40px rgba(184,115,51,0.5), 0 0 80px rgba(0,212,170,0.15), inset 0 0 20px rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute" style={{ top: '20%', left: '24%', width: '26%', height: '20%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 100%)', filter: 'blur(2px)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))' }}>⚡</span>
          </div>
        </motion.div>

        {/* Orbiting tokens */}
        {RING_TOKENS.map((token, i) => {
          const angle = ((i / RING_TOKENS.length) * 360 + rotation) * (Math.PI / 180);
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius * 0.45; // squish for perspective
          const zDepth = Math.sin(angle);
          const isActive = activeToken === i;
          return (
            <motion.div
              key={token.label}
              className="absolute z-20 flex flex-col items-center gap-1"
              style={{
                x: tx,
                y: ty,
                translateX: '-50%',
                translateY: '-50%',
                scale: 0.75 + (zDepth + 1) * 0.18,
                opacity: 0.5 + (zDepth + 1) * 0.25,
                zIndex: Math.round((zDepth + 1) * 10),
                cursor: 'pointer',
              }}
              onHoverStart={(e) => { (e as unknown as MouseEvent).stopPropagation(); setActiveToken(i); }}
              onHoverEnd={() => setActiveToken(null)}
              onClick={(e) => { e.stopPropagation(); setActiveToken(isActive ? null : i); }}
            >
              <motion.div
                whileHover={{ scale: 1.4 }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, ${token.color}ee 0%, ${token.color}44 100%)`,
                  boxShadow: isActive
                    ? `0 0 24px ${token.color}aa, inset 0 1px 0 rgba(255,255,255,0.4)`
                    : `0 0 12px ${token.color}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: '#fff',
                  border: `1px solid ${token.color}${isActive ? '88' : '44'}`,
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {token.icon}
              </motion.div>
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', marginTop: 6,
                      background: 'rgba(8,8,8,0.97)',
                      border: `1px solid ${token.color}44`,
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 10, color: token.color, fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: `0 4px 20px ${token.color}30`,
                      pointerEvents: 'none',
                    }}
                  >
                    {token.info}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Drag hint */}
        <AnimatePresence>
          {!isDragging && !isHovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-medium tracking-wider"
            >
              DRAG TO SPIN
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Speed controls */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Speed:</span>
        {[0.5, 1, 2, 3].map(s => (
          <motion.button
            key={s}
            onClick={() => setSpeed(s)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: speed === s ? 'rgba(184,115,51,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${speed === s ? 'rgba(184,115,51,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: speed === s ? '#B87333' : '#475569',
            }}
          >
            {s}×
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Magnetic CTA Button ──────────────────────────────────────────────────────
function MagneticButton({ children, onClick, style, className }: {
  children: React.ReactNode; onClick: () => void; style?: React.CSSProperties; className?: string;
}) {
  const { ref, springX, springY } = useMagnetic(0.5);
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{ x: springX, y: springY, ...style }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ─── Scroll-Reactive 3D Feature Card ─────────────────────────────────────────
function FeatureCard3D({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const { ref, springX, springY, glare } = use3DTilt(12);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, type: 'spring', stiffness: 80, damping: 15 }}
      style={{
        ...(i % 2 === 0 ? cardGlass : cardBrown),
        rotateX: springX,
        rotateY: springY,
        transformStyle: 'preserve-3d',
        transformPerspective: 800,
        willChange: 'transform',
      }}
      className="p-8 rounded-3xl group cursor-pointer relative overflow-hidden"
    >
      {/* Moving glare */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-3xl z-10" style={{ background: glare }} />

      {/* Hover bg */}
      <div className="absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${f.bg}, transparent)` }} />

      {/* Icon floating in z-space */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-20"
        style={{ background: f.bg, color: f.color, border: `1px solid ${f.color}30`, transform: 'translateZ(24px)', boxShadow: `0 8px 28px ${f.color}30` }}
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {f.icon}
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-3 relative z-20" style={{ fontFamily: "'Space Grotesk', sans-serif", transform: 'translateZ(16px)' }}>{f.title}</h3>
      <p className="text-sm leading-relaxed relative z-20 font-medium" style={{ color: 'rgba(240,235,227,0.45)' }}>{f.desc}</p>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${f.color}, transparent)` }} />

      {/* Bottom edge glow */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${f.color}66, transparent)` }} />
    </motion.div>
  );
}

// ─── Animated Stats ────────────────────────────────────────────────────────────
function AnimatedStat({ val, label, color }: { val: string; label: string; color?: string }) {
  const { ref, springX, springY } = use3DTilt(20);
  return (
    <motion.div ref={ref} className="text-center px-4 cursor-default" style={{ rotateX: springX, rotateY: springY, transformPerspective: 400 }}>
      <p className="text-sm font-black" style={{ color: color || '#F0EBE3', fontFamily: "'Space Grotesk', sans-serif", textShadow: color ? `0 0 16px ${color}88` : undefined }}>{val}</p>
      <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
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
  const { smoothX, smoothY } = useGlobalMouse();

  const handleDemo = async () => {
    await tryDemo();
    router.push('/dashboard');
  };

  // Parallax layers for hero content
  const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const h = typeof window !== 'undefined' ? window.innerHeight : 900;
  const deepX = useTransform(smoothX, [0, w], [-8, 8]);
  const deepY = useTransform(smoothY, [0, h], [-6, 6]);

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-[#00D4AA]/30 text-slate-200" style={{ background: '#080808' }}>
      {/* ── Global FX ─────────────────────────────────────────────────────── */}
      <CursorGlow smoothX={smoothX} smoothY={smoothY} />
      <ShockwaveEffect />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-16 pt-24 overflow-hidden">
        <ParallaxBackground smoothX={smoothX} smoothY={smoothY} />

        {/* Floating 3D token bubbles — rendered above hero content */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          {FLOATING_TOKENS.map(t => (
            <InteractiveToken key={t.symbol} {...t} />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left copy — parallax layer */}
          <motion.div style={{ y: yOffset }}>
            <motion.div style={{ x: deepX, y: deepY }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
                style={{ background: 'rgba(184,115,51,0.1)', borderColor: 'rgba(184,115,51,0.25)', boxShadow: '0 0 20px rgba(184,115,51,0.1)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#B87333' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B87333' }}>Crypto-Backed Credit · Live on Polygon</span>
              </motion.div>

              {/* 3D Depth Headline */}
              <motion.h1
                className="text-5xl sm:text-7xl lg:text-[5rem] font-black leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              >
                {['Your crypto.', 'Your collateral.'].map((line, i) => (
                  <motion.span
                    key={line}
                    className="block"
                    style={{
                      color: '#F0EBE3',
                      textShadow: '0 1px 0 rgba(220,220,220,0.4), 0 2px 0 rgba(180,180,180,0.3), 0 3px 0 rgba(130,130,130,0.2), 0 4px 0 rgba(80,80,80,0.15), 0 8px 20px rgba(0,0,0,0.7)',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.12 }}
                  >
                    {line}
                  </motion.span>
                ))}
                <motion.span className="relative block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                  <span className="absolute -inset-1 blur-xl opacity-30" style={{ background: 'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)' }} />
                  <span className="relative" style={{ background: 'linear-gradient(135deg, #B87333 0%, #C25A2A 40%, #00D4AA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 4px 12px rgba(184,115,51,0.4))' }}>
                    Your credit.
                  </span>
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg font-medium"
                style={{ color: 'rgba(240,235,227,0.5)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
              >
                Deposit ETH or USDC as collateral. Borrow instantly against it.
                Spend as INR directly from your FlowPay wallet — no bank, no credit score.
              </motion.p>

              {/* Magnetic CTAs */}
              <motion.div className="flex flex-wrap items-center gap-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                {user ? (
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <MagneticButton
                        onClick={openConnectModal}
                        className="group relative px-8 py-4 font-black rounded-full overflow-hidden flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3), 0 0 0 1px rgba(0,212,170,0.2)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                        Connect Wallet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </MagneticButton>
                    )}
                  </ConnectButton.Custom>
                ) : (
                  <MagneticButton
                    onClick={() => router.push('/connect')}
                    className="group relative px-8 py-4 font-black rounded-full overflow-hidden flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', boxShadow: '0 8px 30px rgba(0,212,170,0.3), 0 0 0 1px rgba(0,212,170,0.2)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <span className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 skew-x-12" />
                    Get Started Free <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </MagneticButton>
                )}
                <MagneticButton
                  onClick={handleDemo}
                  className="px-8 py-4 font-bold rounded-full flex items-center gap-2"
                  style={{ background: 'rgba(184,115,51,0.07)', border: '1px solid rgba(184,115,51,0.25)', color: '#B87333', boxShadow: '0 0 20px rgba(184,115,51,0.05)' }}
                >
                  Try Demo
                </MagneticButton>
              </motion.div>

              {/* Trust strip */}
              <motion.div className="flex items-center gap-0 mt-10 divide-x divide-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <AnimatedStat val="40%" label="ETH LTV" color="#627EEA" />
                <AnimatedStat val="80%" label="USDC LTV" color="#2775CA" />
                <AnimatedStat val="₹83.5" label="per USD" color="#00D4AA" />
                <AnimatedStat val="Live" label="Chainlink feeds" color="#B87333" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: 3D tilt + glare pipeline card */}
          <CreditFlowPipeline />
        </div>
      </section>

      {/* ── Draggable Orbit Section ─────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-shrink-0"
          >
            <OrbitRing />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#B87333' }}>Multi-Asset Collateral</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F0EBE3', textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.6)' }}>
              One protocol.<br />
              <span style={{ background: 'linear-gradient(135deg, #B87333, #00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 2px 8px rgba(184,115,51,0.3))' }}>All your assets.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(240,235,227,0.45)', maxWidth: 480 }}>
              Drag the orbit ring — each token is an asset you can deposit. Click a token to see its details in real-time.
              FlowPay calculates your blended LTV across all assets using Chainlink price feeds.
            </p>
            <div className="flex flex-wrap gap-3">
              {RING_TOKENS.map(t => (
                <motion.div key={t.label} whileHover={{ scale: 1.12, y: -4 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                  style={{ background: `${t.color}14`, border: `1px solid ${t.color}33`, color: t.color, boxShadow: `0 0 12px ${t.color}20` }}
                >
                  <span>{t.icon}</span> {t.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#B87333' }}>How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#F0EBE3', fontFamily: "'Space Grotesk', sans-serif", textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.5)' }}>
            Three steps to liquid credit
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(240,235,227,0.4)' }}>
            From cold wallet to spendable INR in under 60 seconds. No KYC. No waiting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without FlowPay */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl p-8 relative overflow-hidden" style={cardGlass}>
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
          {(() => {
            const { ref, springX, springY, glare } = use3DTilt(8);
            return (
              <motion.div ref={ref} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                style={{ ...cardBrown, boxShadow: '0 0 40px rgba(184,115,51,0.08)', rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d', transformPerspective: 800 }}
                className="rounded-3xl p-8 relative overflow-hidden group"
              >
                <motion.div className="absolute inset-0 pointer-events-none rounded-3xl" style={{ background: glare }} />
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #B87333, #C25A2A, #00D4AA)' }} />
                <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-all pointer-events-none" style={{ background: '#B87333' }} />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA' }}><Zap className="w-4 h-4" /></div>
                  <span className="text-lg font-bold text-white">With FlowPay</span>
                  <span className="ml-auto text-[10px] rounded-full px-3 py-1 font-black" style={{ background: 'rgba(184,115,51,0.15)', color: '#B87333', border: '1px solid rgba(184,115,51,0.25)' }}>NON-CUSTODIAL</span>
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
                    ].map((row, ri) => (
                      <motion.div key={row.step} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: ri * 0.1 }}
                      >
                        <span className="text-[10px] font-black w-5 text-center" style={{ color: row.color }}>{row.step}</span>
                        <span className="text-xs text-slate-300 flex-1">{row.label}</span>
                        <span className="text-xs font-black" style={{ color: row.color }}>{row.val}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <MagneticButton onClick={handleDemo}
                  className="w-full py-4 font-black text-sm rounded-xl relative overflow-hidden group/btn z-10"
                  style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00FF87 100%)', color: '#080808', fontFamily: "'Space Grotesk', sans-serif", display: 'block' }}
                >
                  <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                  <span className="relative flex justify-center items-center gap-2">Try the Demo <ArrowRight className="w-4 h-4" /></span>
                </MagneticButton>
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-16 max-w-7xl mx-auto relative z-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#B87333]/20 to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F0EBE3', textShadow: '0 2px 0 rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.5)' }}>
            Built for the{' '}
            <span style={{ background: 'linear-gradient(135deg, #B87333 0%, #C25A2A 40%, #00D4AA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 2px 8px rgba(184,115,51,0.3))' }}>credit era</span>
          </h2>
          <p className="text-base mt-4 max-w-xl mx-auto" style={{ color: 'rgba(240,235,227,0.4)' }}>
            DeFi credit without selling. Spend without losing exposure. Repay when you want.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => <FeatureCard3D key={f.title} f={f} i={i} />)}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-12 mt-12 relative z-10" style={{ borderTop: '1px solid rgba(184,115,51,0.1)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #B87333 0%, #00D4AA 100%)', boxShadow: '0 0 15px rgba(184,115,51,0.4)' }} />
            <p className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FlowPay</p>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
            {['Protocol', 'Risk Docs', 'Chainlink', 'Privacy'].map(l => (
              <motion.button key={l} whileHover={{ color: '#B87333', y: -1 }} className="transition-colors">{l}</motion.button>
            ))}
          </div>
          <p className="text-xs text-slate-700 font-medium">© 2026 FlowPay. Non-custodial credit.</p>
        </div>
      </footer>
    </div>
  );
}
