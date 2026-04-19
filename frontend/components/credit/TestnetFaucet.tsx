'use client';

import { useState } from 'react';
import { Database } from 'lucide-react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import mockErc20Artifact from '@/src/contracts/MockERC20.json';

export function TestnetFaucet() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const mintTokens = async () => {
    if (!address || isMinting) return;
    setIsMinting(true);
    try {
      // Mint 100 MATIC
      await writeContractAsync({
        address: ADDRESSES.MockMATIC as `0x${string}`,
        abi: mockErc20Artifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('100', 18)],
      });
      // Mint 5000 USDC
      await writeContractAsync({
        address: ADDRESSES.MockUSDC as `0x${string}`,
        abi: mockErc20Artifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('5000', 18)],
      });
      alert('Mock Tokens Minted! Wait 10 seconds for block execution.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <button
      onClick={mintTokens}
      disabled={isMinting || !address}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
      style={{ border: `1px solid #3B82F640`, color: '#60A5FA', background: `#3B82F610` }}
      title="Mint Sepolia Mock Tokens for Demo"
    >
      <Database className="w-4 h-4" />
      {isMinting ? "Minting..." : "Faucet"}
    </button>
  );
}
