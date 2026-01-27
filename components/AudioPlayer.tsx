"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  trackUrl: string;
  trackId: string;
  onPlay?: () => void;
}

export default function AudioPlayer({ trackUrl, trackId, onPlay }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      // Notify parent component that playback started
      if (onPlay) {
        onPlay();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black/50 rounded-xl p-4 md:p-6 border border-white/10">
      <audio ref={audioRef} src={trackUrl} preload="metadata" />

      {/* Waveform Visualization (Fake) */}
      <div className="flex items-center justify-center h-16 md:h-24 mb-3 md:mb-4 bg-zinc-900/50 rounded-lg overflow-hidden">
        <div className="flex items-end gap-1 h-full px-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-300 ${
                isPlaying ? "animate-pulse" : ""
              }`}
              style={{
                height: `${Math.random() * 80 + 20}%`,
                backgroundColor:
                  trackId === "track-a"
                    ? `rgba(255, 107, 53, ${Math.random() * 0.5 + 0.3})`
                    : `rgba(0, 217, 255, ${Math.random() * 0.5 + 0.3})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 md:gap-4 mb-3">
        <button
          onClick={togglePlay}
          className={`w-14 h-14 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            trackId === "track-a"
              ? "bg-primary hover:bg-primary/80 glow-orange"
              : "bg-secondary hover:bg-secondary/80 glow-cyan"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 md:w-6 md:h-6 text-white" />
          ) : (
            <Play className="w-7 h-7 md:w-6 md:h-6 text-white ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${
                trackId === "track-a" ? "#FF6B35" : "#00D9FF"
              } 0%, ${
                trackId === "track-a" ? "#FF6B35" : "#00D9FF"
              } ${(currentTime / duration) * 100}%, #3f3f46 ${
                (currentTime / duration) * 100
              }%, #3f3f46 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 md:w-5 md:h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-6 h-6 md:w-5 md:h-5 text-white" />
          )}
        </button>
      </div>

      {/* Progress Bar Visual */}
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${
            trackId === "track-a" ? "bg-primary" : "bg-secondary"
          }`}
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}
