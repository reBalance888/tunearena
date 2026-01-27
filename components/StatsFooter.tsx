"use client";

import { useEffect, useState } from "react";
import { getFormattedStats } from "@/lib/stats";

export default function StatsFooter() {
  const [stats, setStats] = useState({
    totalBattles: "24.7K",
    tuneBurned: "1.2M",
    activePlayers: "3,421",
    prizePool: "$890K",
  });

  useEffect(() => {
    // Load stats on mount
    setStats(getFormattedStats());

    // Listen for stats updates
    const handleStatsUpdate = () => {
      setStats(getFormattedStats());
    };

    window.addEventListener('globalStatsUpdate', handleStatsUpdate);

    return () => {
      window.removeEventListener('globalStatsUpdate', handleStatsUpdate);
    };
  }, []);

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <p className="text-gray-400 text-sm mb-1">Total Battles</p>
          <p className="text-3xl font-black text-gradient">{stats.totalBattles}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">$TUNE Burned</p>
          <p className="text-3xl font-black text-gradient">{stats.tuneBurned}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Active Players</p>
          <p className="text-3xl font-black text-gradient">{stats.activePlayers}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
          <p className="text-3xl font-black text-gradient">{stats.prizePool}</p>
        </div>
      </div>
    </div>
  );
}
