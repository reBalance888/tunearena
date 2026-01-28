"use client";

import { useRealtimeBattle } from "@/hooks/useRealtimeBattle";
import { Activity, Users, Flame } from "lucide-react";

export default function LiveBattleFeed() {
  const { currentBattle, recentVotes, isConnected } = useRealtimeBattle();

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-accent animate-pulse" />
          <h2 className="text-2xl font-black">Live Activity</h2>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Current Battle Info */}
      {currentBattle && (
        <div className="bg-black/30 border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-400">
              Battle #{currentBattle.battleNumber}
            </span>
          </div>
          <p className="text-white font-semibold line-clamp-2">
            {currentBattle.prompt}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-400">
              {recentVotes.length} recent votes
            </span>
          </div>
        </div>
      )}

      {/* Recent Votes Feed */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Recent Votes
        </h3>

        {recentVotes.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Waiting for votes...
            </p>
          </div>
        ) : (
          recentVotes.map((vote) => (
            <div
              key={vote.id}
              className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-accent/30 transition-all duration-300 animate-fadeIn"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String(vote.id).slice(-2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      Player
                    </p>
                    <p className="text-xs text-gray-400">
                      voted {vote.choice === "trackA" ? "Track A" : "Track B"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(vote.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Summary */}
      {recentVotes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Votes</p>
              <p className="text-lg font-bold text-gradient">
                {recentVotes.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Track A vs B</p>
              <p className="text-lg font-bold text-gradient">
                {recentVotes.filter(v => v.choice === "trackA").length} : {recentVotes.filter(v => v.choice !== "trackA").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
