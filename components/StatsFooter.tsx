"use client";

import { useEffect, useState } from "react";
import { getFormattedStats } from "@/lib/stats";

export default function StatsFooter() {
  const [stats, setStats] = useState({
    totalBattles: "24.7K",
    totalVotes: "89.4K",
  });

  useEffect(() => {
    setStats(getFormattedStats());

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
      <div className="grid grid-cols-2 gap-6 text-center">
        <div>
          <p className="text-gray-400 text-sm mb-1">Total Battles</p>
          <p className="text-3xl font-black text-gradient">{stats.totalBattles}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Total Votes</p>
          <p className="text-3xl font-black text-gradient">{stats.totalVotes}</p>
        </div>
      </div>
    </div>
  );
}
