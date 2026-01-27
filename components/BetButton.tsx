"use client";

import { Coins, Zap } from "lucide-react";

interface BetButtonProps {
  trackId: string;
  amount: number;
  onBet: (trackId: string, amount: number) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export default function BetButton({
  trackId,
  amount,
  onBet,
  disabled = false,
  variant = "primary",
}: BetButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={() => onBet(trackId, amount)}
      disabled={disabled}
      className={`
        w-full py-4 md:py-3 px-6 rounded-lg font-bold text-base md:text-lg
        flex items-center justify-center gap-2 md:gap-3
        transition-all duration-300
        min-h-[56px] md:min-h-0
        ${
          disabled
            ? "bg-zinc-800 text-gray-600 cursor-not-allowed"
            : isPrimary
            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white hover:scale-105 glow-orange"
            : "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white hover:scale-105 glow-cyan"
        }
        ${!disabled && "hover:shadow-2xl"}
      `}
    >
      <Coins className="w-5 h-5 md:w-6 md:h-6" />
      <span>
        BET {amount} <span className="text-xs md:text-sm opacity-80">$TUNE</span>
      </span>
      {!disabled && <Zap className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />}
    </button>
  );
}
