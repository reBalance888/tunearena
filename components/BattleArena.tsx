"use client";

import { useState, useEffect } from "react";
import { Music2, Trophy, Flame, TrendingUp, RefreshCw, Check } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import VoteButton from "./BetButton";
import PastBattles from "./PastBattles";
import StatsFooter from "./StatsFooter";
import { loadTracks, selectBattleTracks, Track } from "@/lib/trackService";
import { addBattleToHistory } from "@/lib/battleHistory";
import { incrementBattleCount } from "@/lib/stats";
import Link from "next/link";

export default function BattleArena() {
  const [countdown, setCountdown] = useState(60);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [voteLocked, setVoteLocked] = useState(false);
  const [trackA, setTrackA] = useState<Track | null>(null);
  const [trackB, setTrackB] = useState<Track | null>(null);
  const [battleNumber, setBattleNumber] = useState(247);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [eloChanges, setEloChanges] = useState<{ trackA: number; trackB: number } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    loadBattle();
  }, []);

  useEffect(() => {
    if (!trackA || !trackB || !countdownStarted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRevealed(true);
          const winningTrack = Math.random() > 0.5 ? trackA.id : trackB.id;
          setWinner(winningTrack);
          setEloChanges({
            trackA: winningTrack === trackA.id ? 15 : -10,
            trackB: winningTrack === trackB.id ? 15 : -10,
          });

          const winnerModel = winningTrack === trackA.id ? trackA.ai_model : trackB.ai_model;
          const loserModel = winningTrack === trackA.id ? trackB.ai_model : trackA.ai_model;
          addBattleToHistory({
            id: battleNumber,
            winner: winnerModel,
            loser: loserModel,
            prompt: trackA.prompt,
          });

          incrementBattleCount();
          window.dispatchEvent(new Event('battleHistoryUpdate'));

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [trackA, trackB, countdownStarted]);

  const handleTrackPlay = () => {
    if (!countdownStarted) {
      setCountdownStarted(true);
    }
  };

  const loadBattle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await loadTracks();
      const [track1, track2] = selectBattleTracks(data.tracks);
      setTrackA(track1);
      setTrackB(track2);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load battle:", err);
      setError("Failed to load battle. Please refresh.");
      setIsLoading(false);
    }
  };

  const handleNewBattle = () => {
    setCountdown(60);
    setIsRevealed(false);
    setSelectedTrack(null);
    setVoteLocked(false);
    setBattleNumber((prev) => prev + 1);
    setCountdownStarted(false);
    setEloChanges(null);
    setWinner(null);
    loadBattle();
  };

  const handleVote = (trackId: string) => {
    if (voteLocked) return;
    setSelectedTrack(trackId);
    setVoteLocked(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Music2 className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-xl text-gray-400">Loading battle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackA || !trackB) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl text-red-400 mb-4">{error || "Failed to load tracks"}</p>
            <button
              onClick={handleNewBattle}
              className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <Link
          href="/leaderboard"
          className="bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 glow-purple flex items-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          <span>Leaderboard</span>
        </Link>
      </header>

      {/* Battle Info */}
      <div className="bg-zinc-900/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Battle</p>
              <p className="text-xl md:text-2xl font-bold text-white">#{battleNumber}</p>
            </div>
          </div>

          <div className="flex-1 text-center w-full md:w-auto">
            <p className="text-gray-400 text-xs md:text-sm mb-2">Prompt</p>
            <p className="text-base md:text-xl font-semibold text-secondary line-clamp-2">
              {trackA.prompt}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-accent animate-pulse" />
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Countdown</p>
              <p className="text-xl md:text-2xl font-bold text-white tabular-nums">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Track A */}
        <div
          className={`bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
            selectedTrack === trackA.id
              ? "border-primary glow-orange scale-105"
              : "border-primary/30 hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-primary">TRACK A</h2>
            {isRevealed && (
              <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg animate-fadeIn">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold">{trackA.ai_model}</span>
                <span className="text-xs text-gray-400">ELO {trackA.elo}</span>
                {eloChanges && (
                  <span className={`text-sm font-bold animate-bounce ${
                    eloChanges.trackA > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {eloChanges.trackA > 0 ? "+" : ""}{eloChanges.trackA}
                  </span>
                )}
              </div>
            )}
            {!isRevealed && (
              <div className="bg-zinc-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">??? AI</span>
              </div>
            )}
          </div>

          <AudioPlayer
            trackUrl={trackA.file_path}
            trackId={trackA.id}
            onPlay={handleTrackPlay}
          />

          <div className="mt-6">
            {voteLocked && selectedTrack === trackA.id ? (
              <div className="w-full py-4 px-6 rounded-lg bg-primary/20 border border-primary flex items-center justify-center gap-2">
                <Check className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold text-primary">Voted!</span>
              </div>
            ) : (
              <VoteButton
                trackId={trackA.id}
                label="Track A"
                onVote={handleVote}
                disabled={isRevealed || voteLocked}
              />
            )}
          </div>
        </div>

        {/* Track B */}
        <div
          className={`bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${
            selectedTrack === trackB.id
              ? "border-secondary glow-cyan scale-105"
              : "border-secondary/30 hover:border-secondary/50"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-secondary">TRACK B</h2>
            {isRevealed && (
              <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg animate-fadeIn">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">{trackB.ai_model}</span>
                <span className="text-xs text-gray-400">ELO {trackB.elo}</span>
                {eloChanges && (
                  <span className={`text-sm font-bold animate-bounce ${
                    eloChanges.trackB > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {eloChanges.trackB > 0 ? "+" : ""}{eloChanges.trackB}
                  </span>
                )}
              </div>
            )}
            {!isRevealed && (
              <div className="bg-zinc-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">??? AI</span>
              </div>
            )}
          </div>

          <AudioPlayer
            trackUrl={trackB.file_path}
            trackId={trackB.id}
            onPlay={handleTrackPlay}
          />

          <div className="mt-6">
            {voteLocked && selectedTrack === trackB.id ? (
              <div className="w-full py-4 px-6 rounded-lg bg-secondary/20 border border-secondary flex items-center justify-center gap-2">
                <Check className="w-6 h-6 text-secondary" />
                <span className="text-lg font-bold text-secondary">Voted!</span>
              </div>
            ) : (
              <VoteButton
                trackId={trackB.id}
                label="Track B"
                onVote={handleVote}
                disabled={isRevealed || voteLocked}
                variant="secondary"
              />
            )}
          </div>
        </div>
      </div>

      {/* Vote Result */}
      {isRevealed && voteLocked && (
        <div className={`mb-6 md:mb-8 p-4 md:p-6 rounded-2xl border-2 text-center animate-fadeIn ${
          selectedTrack === winner
            ? "bg-green-900/20 border-green-500"
            : "bg-red-900/20 border-red-500"
        }`}>
          <h3 className={`text-2xl md:text-3xl font-black mb-2 ${
            selectedTrack === winner ? "text-green-400" : "text-red-400"
          }`}>
            {selectedTrack === winner ? "Nice pick!" : "Better luck next time!"}
          </h3>
          <p className="text-gray-400 text-sm">
            {selectedTrack === winner
              ? "You correctly predicted the winner!"
              : "The other track won this round."}
          </p>
        </div>
      )}

      {/* New Battle Button */}
      {isRevealed && (
        <div className="flex justify-center mb-6 md:mb-8">
          <button
            onClick={handleNewBattle}
            className="bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl flex items-center gap-2 md:gap-3 transition-all duration-300 hover:scale-105 glow-purple w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-base md:text-lg">New Battle</span>
          </button>
        </div>
      )}

      {/* Stats Footer */}
      <StatsFooter />

      {/* Past Battles */}
      <div className="mt-12">
        <PastBattles
          onReplay={(battle) => {
            alert(
              `Battle #${battle.id}\n${battle.winner} vs ${battle.loser}\n\nPrompt: ${battle.prompt}`
            );
          }}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Built with AI · No wallet required · Free to play</p>
      </footer>
    </div>
  );
}
