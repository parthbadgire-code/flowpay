import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { FlowPayProvider } from '@/lib/flowpayContext';
import { CreditLineProvider } from '@/lib/creditLineContext';
import { AuthProvider } from '@/lib/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FlowPay — Crypto-Backed Credit Line',
  description:
    'Deposit ETH or USDC as collateral and borrow instantly. No credit score. Non-custodial DeFi credit powered by Chainlink price feeds.',
  keywords: ['crypto', 'DeFi', 'credit line', 'lending', 'ETH', 'USDC', 'Chainlink', 'FlowPay'],
  openGraph: {
    title: 'FlowPay — Crypto-Backed Credit Line',
    description: 'Your crypto. Your collateral. Your credit.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning style={{ background: '#0D1412', color: '#E8F5F2' }}>
        <Web3Provider>
          <FlowPayProvider>
            <CreditLineProvider>
              <AuthProvider>
                <Navbar />
                {children}
              </AuthProvider>
            </CreditLineProvider>
          </FlowPayProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
