"use client";

import { Music2, Zap } from "lucide-react";

interface VoteButtonProps {
  trackId: string;
  label: string;
  onVote: (trackId: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export default function VoteButton({
  trackId,
  label,
  onVote,
  disabled = false,
  variant = "primary",
}: VoteButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={() => onVote(trackId)}
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
      <Music2 className="w-5 h-5 md:w-6 md:h-6" />
      <span>Vote {label}</span>
      {!disabled && <Zap className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />}
    </button>
  );
}
