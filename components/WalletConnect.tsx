"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

export default function WalletConnect() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="hidden md:flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg border border-accent/30">
          <Wallet className="w-5 h-5 text-accent" />
          <div className="text-sm">
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="font-bold text-white">0 $TUNE</p>
          </div>
        </div>
      )}
      <WalletMultiButton className="wallet-adapter-button-custom" />
    </div>
  );
}
