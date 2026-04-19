'use client';

import { useState } from 'react';
import { Database } from 'lucide-react';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { ADDRESSES } from '@/src/contracts/addresses';
import mockErc20Artifact from '@/src/contracts/MockERC20.json';
import mockNftArtifact from '@/src/contracts/MockNFT.json';
import mInrArtifact from '@/src/contracts/MockINR.json';

export function TestnetFaucet() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const publicClient = usePublicClient();

  const mintTokens = async () => {
    if (!address || isMinting) return;
    setIsMinting(true);
    try {
      // 1. Mint 10000 MATIC (COMMENTED OUT)
      /*
      let hash = await writeContractAsync({
        address: ADDRESSES.MockMATIC as `0x${string}`,
        abi: mockErc20Artifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('10000', 18)],
      });
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      else await new Promise(r => setTimeout(r, 6000));
      */

      // 2. Mint 10000 USDC
      let hash = await writeContractAsync({
        address: ADDRESSES.MockUSDC as `0x${string}`,
        abi: mockErc20Artifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('10000', 18)],
      });
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      else await new Promise(r => setTimeout(r, 6000));

      // 3. Mint 100 ETH (COMMENTED OUT)
      /*
      hash = await writeContractAsync({
        address: ADDRESSES.MockETH as `0x${string}`,
        abi: mockErc20Artifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('100', 18)],
      });
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      else await new Promise(r => setTimeout(r, 6000));
      */

      // 4. Mint 1 NFT (COMMENTED OUT)
      /*
      const randomTokenId = BigInt(Math.floor(Math.random() * 1000000));
      hash = await writeContractAsync({
        address: ADDRESSES.MockNFT as `0x${string}`,
        abi: mockNftArtifact.abi,
        functionName: 'mint',
        args: [address, randomTokenId],
      });
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      else await new Promise(r => setTimeout(r, 6000));
      */

      // 5. Mint 100000 MockINR (COMMENTED OUT)
      /*
      hash = await writeContractAsync({
        address: ADDRESSES.MockINR as `0x${string}`,
        abi: mInrArtifact.abi,
        functionName: 'mint',
        args: [address, parseUnits('100000', 18)],
      });
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
      */

      alert('Mock Tokens Minted Successfully!');
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
