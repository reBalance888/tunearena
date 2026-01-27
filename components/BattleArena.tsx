"use client";

import { useState, useEffect } from "react";
import { Music2, Trophy, Flame, TrendingUp } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import BetButton from "./BetButton";
import WalletConnect from "./WalletConnect";

const BATTLE_NUMBER = 247;
const PROMPT = "dark phonk beat with heavy 808s";

// Mock tracks - replace with real URLs or use from /public
const TRACK_A = {
  id: "track-a",
  url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3", // Placeholder
  aiModel: "Suno",
  elo: 1542,
};

const TRACK_B = {
  id: "track-b",
  url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_2948d6e39f.mp3", // Placeholder
  aiModel: "Udio",
  elo: 1489,
};

export default function BattleArena() {
  const [countdown, setCountdown] = useState(60);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRevealed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBet = (trackId: string, amount: number) => {
    setSelectedTrack(trackId);
    alert(`🎲 Coming Soon!\n\nYou tried to bet ${amount} $TUNE on ${trackId.toUpperCase()}\n\nWallet integration launching soon!`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div className="flex items-center gap-4">
          <Music2 className="w-12 h-12 text-primary animate-pulse" />
          <div>
            <h1 className="text-5xl font-black text-gradient neon-text">
              TUNE ARENA
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              AI Music Battle Royale
            </p>
          </div>
        </div>
        <WalletConnect />
      </header>

      {/* Battle Info */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-gray-400 text-sm">Battle</p>
              <p className="text-2xl font-bold text-white">#{BATTLE_NUMBER}</p>
            </div>
          </div>

          <div className="flex-1 text-center">
            <p className="text-gray-400 text-sm mb-2">Prompt</p>
            <p className="text-xl font-semibold text-secondary">{PROMPT}</p>
          </div>

          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-accent animate-pulse" />
            <div>
              <p className="text-gray-400 text-sm">Countdown</p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Track A */}
        <div
          className={`bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
            selectedTrack === TRACK_A.id
              ? "border-primary glow-orange scale-105"
              : "border-primary/30 hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black text-primary">TRACK A</h2>
            {isRevealed && (
              <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">{TRACK_A.aiModel}</span>
                <span className="text-xs text-gray-400">ELO {TRACK_A.elo}</span>
              </div>
            )}
            {!isRevealed && (
              <div className="bg-zinc-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">??? AI</span>
              </div>
            )}
          </div>

          <AudioPlayer trackUrl={TRACK_A.url} trackId={TRACK_A.id} />

          <div className="mt-6 space-y-3">
            <BetButton
              trackId={TRACK_A.id}
              amount={10}
              onBet={handleBet}
              disabled={isRevealed}
            />
            <BetButton
              trackId={TRACK_A.id}
              amount={50}
              onBet={handleBet}
              disabled={isRevealed}
            />
            <BetButton
              trackId={TRACK_A.id}
              amount={100}
              onBet={handleBet}
              disabled={isRevealed}
            />
          </div>
        </div>

        {/* Track B */}
        <div
          className={`bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
            selectedTrack === TRACK_B.id
              ? "border-secondary glow-cyan scale-105"
              : "border-secondary/30 hover:border-secondary/50"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-black text-secondary">TRACK B</h2>
            {isRevealed && (
              <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">{TRACK_B.aiModel}</span>
                <span className="text-xs text-gray-400">ELO {TRACK_B.elo}</span>
              </div>
            )}
            {!isRevealed && (
              <div className="bg-zinc-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">??? AI</span>
              </div>
            )}
          </div>

          <AudioPlayer trackUrl={TRACK_B.url} trackId={TRACK_B.id} />

          <div className="mt-6 space-y-3">
            <BetButton
              trackId={TRACK_B.id}
              amount={10}
              onBet={handleBet}
              disabled={isRevealed}
              variant="secondary"
            />
            <BetButton
              trackId={TRACK_B.id}
              amount={50}
              onBet={handleBet}
              disabled={isRevealed}
              variant="secondary"
            />
            <BetButton
              trackId={TRACK_B.id}
              amount={100}
              onBet={handleBet}
              disabled={isRevealed}
              variant="secondary"
            />
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-accent/30 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Battles</p>
            <p className="text-3xl font-black text-gradient">24.7K</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">$TUNE Burned</p>
            <p className="text-3xl font-black text-gradient">1.2M</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Active Players</p>
            <p className="text-3xl font-black text-gradient">3,421</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
            <p className="text-3xl font-black text-gradient">$890K</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>
          Powered by Solana · $TUNE on pump.fun · Built with AI
        </p>
      </footer>
    </div>
  );
}
