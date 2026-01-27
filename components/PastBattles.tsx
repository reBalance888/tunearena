"use client";

import { useEffect, useState } from "react";
import { History, Trophy } from "lucide-react";
import { getBattleHistory, BattleRecord } from "@/lib/battleHistory";

interface PastBattlesProps {
  onReplay?: (battle: BattleRecord) => void;
}

export default function PastBattles({ onReplay }: PastBattlesProps) {
  const [history, setHistory] = useState<BattleRecord[]>([]);

  useEffect(() => {
    // Load history on mount
    setHistory(getBattleHistory());

    // Listen for storage changes (when battles are added)
    const handleStorageChange = () => {
      setHistory(getBattleHistory());
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('battleHistoryUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('battleHistoryUpdate', handleStorageChange);
    };
  }, []);

  if (history.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-black">Past Battles</h2>
        </div>
        <p className="text-gray-400 text-center py-8">
          No battles yet. Place your first bet to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-black">Past Battles</h2>
        <span className="text-sm text-gray-400">({history.length} battles)</span>
      </div>

      <div className="space-y-3">
        {history.map((battle) => (
          <button
            key={battle.id}
            onClick={() => onReplay?.(battle)}
            className="w-full text-left bg-black/30 hover:bg-black/50 border border-white/10 hover:border-accent/50 rounded-lg p-4 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-accent group-hover:text-primary transition-colors" />
                  <span className="font-bold text-white">Battle #{battle.id}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(battle.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  <span className="text-green-400 font-semibold">{battle.winner}</span>
                  {" won vs "}
                  <span className="text-red-400">{battle.loser}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {battle.prompt}
                </p>
              </div>
              <div className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Replay →
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
