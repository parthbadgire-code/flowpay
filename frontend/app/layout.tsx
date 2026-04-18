import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { FlowPayProvider } from '@/lib/flowpayContext';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FlowPay — Unified Crypto Spending in INR',
  description:
    'Turn your fragmented crypto assets into one spendable INR balance. Deposit USDC, MATIC, ETH and spend instantly via QR payments. Powered by Polygon.',
  keywords: ['crypto', 'payments', 'INR', 'DeFi', 'Polygon', 'Web3', 'FlowPay'],
  openGraph: {
    title: 'FlowPay — Unified Crypto Spending in INR',
    description: 'Wallets show what you own. We show what you can spend.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[#0A0A0F] text-slate-100 antialiased" suppressHydrationWarning>
        <Web3Provider>
          <FlowPayProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </FlowPayProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
