"use client";

import { Trophy, TrendingUp, Music2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AIModel {
  rank: number;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

// Hardcoded data for now
const leaderboardData: AIModel[] = [
  { rank: 1, name: "Suno", elo: 1542, wins: 847, losses: 623, winRate: 57.6 },
  { rank: 2, name: "Udio", elo: 1489, wins: 782, losses: 688, winRate: 53.2 },
  { rank: 3, name: "Stable Audio", elo: 1435, wins: 701, losses: 645, winRate: 52.1 },
  { rank: 4, name: "ElevenLabs Music", elo: 1398, wins: 645, losses: 678, winRate: 48.7 },
  { rank: 5, name: "MusicGen", elo: 1356, wins: 589, losses: 712, winRate: 45.3 },
  { rank: 6, name: "AudioCraft", elo: 1312, wins: 534, losses: 743, winRate: 41.8 },
  { rank: 7, name: "Mubert", elo: 1278, wins: 489, losses: 789, winRate: 38.3 },
  { rank: 8, name: "Soundraw", elo: 1245, wins: 456, losses: 823, winRate: 35.6 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-primary animate-pulse" />
            <div>
              <h1 className="text-5xl font-black text-gradient neon-text">
                LEADERBOARD
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                AI Music Model Rankings
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 glow-purple flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Arena
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-primary/30 rounded-xl p-4 text-center">
            <Music2 className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Models</p>
            <p className="text-2xl font-black text-gradient">{leaderboardData.length}</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Top ELO</p>
            <p className="text-2xl font-black text-gradient">{leaderboardData[0].elo}</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-secondary/30 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total Battles</p>
            <p className="text-2xl font-black text-gradient">
              {leaderboardData.reduce((sum, model) => sum + model.wins + model.losses, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-primary/30 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-gray-400 text-sm mb-1">Best Win Rate</p>
            <p className="text-2xl font-black text-gradient">
              {Math.max(...leaderboardData.map(m => m.winRate))}%
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-accent/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    AI Model
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                    ELO
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Losses
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leaderboardData.map((model) => (
                  <tr
                    key={model.rank}
                    className="hover:bg-black/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {model.rank === 1 && (
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        )}
                        {model.rank === 2 && (
                          <Trophy className="w-5 h-5 text-gray-400" />
                        )}
                        {model.rank === 3 && (
                          <Trophy className="w-5 h-5 text-orange-600" />
                        )}
                        <span className="text-2xl font-bold text-white">
                          #{model.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Music2 className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold text-white">
                          {model.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xl font-bold text-gradient">
                        {model.elo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-semibold text-green-400">
                        {model.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-semibold text-red-400">
                        {model.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-primary"
                            style={{ width: `${model.winRate}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-white">
                          {model.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Rankings updated in real-time · Based on ELO rating system</p>
          <p className="mt-2">Powered by Solana · $TUNE on pump.fun · Built with AI</p>
        </footer>
      </div>
    </main>
  );
}
