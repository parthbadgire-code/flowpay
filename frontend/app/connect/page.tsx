'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Login } from '@/components/auth/Login';

export default function ConnectPage() {
  return (
    <div
      className="flex flex-col min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0D0D14' }}
    >
      {/* Background glows */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,184,146,0.12) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '0', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 70%)' }} />

      {/* FlowPay logo above card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Link href="/">
          <span
            className="text-3xl font-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00B892 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            FlowPay
          </span>
        </Link>
      </motion.div>

      {/* Auth Component */}
      <Login />
    </div>
  );
}
