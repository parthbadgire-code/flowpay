'use client';

import { useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { NFTBackupModal } from '@/components/nft/NFTBackupModal';
import { Card, Badge } from '@/components/ui';
import { formatINR } from '@/lib/utils';
import { useState } from 'react';
import { Shield, Info } from 'lucide-react';

export default function NFTsPage() {
  const { nfts, isConnected, tryDemo } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) { tryDemo(); }
  }, [isConnected, tryDemo]);

  const totalBackup = nfts.reduce((a, n) => a + n.backupLiquidity, 0);

  return (
    <div className="flex min-h-screen bg-[#0A0A0F] pt-20">
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">NFT Backup Liquidity</h1>
            <p className="text-sm text-slate-500">Use your NFT floor value as backup spending power</p>
          </div>
          <Badge variant="yellow" size="md">
            <Shield className="w-3.5 h-3.5" />
            Total: {formatINR(totalBackup)}
          </Badge>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300/80">
              NFT-backed liquidity is <strong>simulated and approval-based</strong>. Floor prices are fetched from collection data and do not constitute financial advice.
            </p>
          </div>

          {/* NFT Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {nfts.map(nft => (
              <Card key={nft.tokenId} hover onClick={() => setModalOpen(true)} className="cursor-pointer">
                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center text-5xl mb-3">
                  🖼️
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-bold text-white">{nft.name}</p>
                  {nft.rarity && (
                    <Badge variant={nft.rarity === 'Epic' ? 'purple' : nft.rarity === 'Rare' ? 'blue' : 'gray'} size="sm">
                      {nft.rarity}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3">{nft.collection} · {nft.chain}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.03] rounded-lg p-2.5">
                    <p className="text-[10px] text-slate-600">Floor Price</p>
                    <p className="text-sm font-bold text-white">{formatINR(nft.floorPriceINR)}</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                    <p className="text-[10px] text-amber-600">Backup Value</p>
                    <p className="text-sm font-bold text-amber-400">{formatINR(nft.backupLiquidity)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <NFTBackupModal isOpen={modalOpen} onClose={() => setModalOpen(false)} nfts={nfts} />
    </div>
  );
}
