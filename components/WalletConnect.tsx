"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { getBalance, formatAddress } from "@/lib/walletBalance";

export default function WalletConnect() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(150);

  // Load balance from localStorage on mount and update on connection changes
  useEffect(() => {
    if (connected && publicKey) {
      const walletBalance = getBalance(publicKey.toString());
      setBalance(walletBalance);
    }
  }, [connected, publicKey]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      {connected && publicKey && (
        <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-accent/20 to-primary/20 px-3 sm:px-4 py-2 rounded-lg border border-accent/40 backdrop-blur-sm">
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
          <div className="text-xs sm:text-sm min-w-0">
            <p className="text-gray-400 text-xs font-medium truncate">
              [{formatAddress(publicKey.toString())}]
            </p>
            <p className="font-bold text-white whitespace-nowrap">
              Balance: {balance} $TUNE
            </p>
          </div>
        </div>
      )}
      <WalletMultiButton className="wallet-adapter-button-custom !py-3 !text-sm sm:!text-base" />
    </div>
  );
}
