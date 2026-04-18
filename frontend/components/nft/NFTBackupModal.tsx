'use client';

import { motion } from 'framer-motion';
import { Gem, Info, Shield } from 'lucide-react';
import { NFTAsset } from '@/types/wallet';
import { Modal, Badge, Button, Progress } from '@/components/ui';
import { formatINR } from '@/lib/utils';

interface NFTBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  nfts: NFTAsset[];
}

export function NFTBackupModal({ isOpen, onClose, nfts }: NFTBackupModalProps) {
  const totalBackup = nfts.reduce((acc, n) => acc + n.backupLiquidity, 0);
  const totalFloor = nfts.reduce((acc, n) => acc + n.floorPriceINR, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="NFT Backup Liquidity">
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              Total Backup Available: {formatINR(totalBackup)}
            </p>
            <p className="text-xs text-amber-500/80 mt-0.5">
              NFT-backed liquidity is simulated and approval-based.
            </p>
          </div>
        </div>

        {/* NFT Cards */}
        <div className="space-y-3">
          {nfts.map((nft, i) => (
            <motion.div
              key={nft.tokenId}
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(0, 212, 170,0.2), rgba(59,130,246,0.2))' }}
                >
                  🖼️
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{nft.name}</p>
                    {nft.rarity && (
                      <Badge variant={nft.rarity === 'Epic' ? 'purple' : nft.rarity === 'Rare' ? 'blue' : 'gray'} size="sm">
                        {nft.rarity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{nft.collection} · {nft.chain}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/[0.03] rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">Floor Price</p>
                  <p className="text-sm font-bold text-slate-200">{formatINR(nft.floorPriceINR)}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <p className="text-[10px] text-amber-600 uppercase tracking-wide mb-0.5">Backup Value</p>
                  <p className="text-sm font-bold text-amber-400">{formatINR(nft.backupLiquidity)}</p>
                </div>
              </div>

              <Progress
                value={nft.backupLiquidity}
                max={nft.floorPriceINR}
                color="from-amber-500 to-amber-400"
                animated={false}
              />
              <p className="text-[10px] text-slate-600 mt-1 text-right">
                {((nft.backupLiquidity / nft.floorPriceINR) * 100).toFixed(1)}% of floor price
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <p>NFT liquidation requires separate approval. Values update with market floor prices.</p>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
