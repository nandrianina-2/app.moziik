"use client";

import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward, ChevronUp, BadgeCheck } from "lucide-react";
import { usePlayer } from "@/context/PlayerProvider";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayerBar() {
  const { currentSong, isPlaying, progress, togglePlay, playNext, playPrevious, seek, openFullPlayer } =
    usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
      <input
        type="range"
        min={0}
        max={currentSong.duration}
        value={progress}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full h-1 accent-accent cursor-pointer"
        aria-label="Progression de la lecture"
      />
      <div className="flex items-center gap-3 px-4 py-2 md:px-6">
        <button onClick={openFullPlayer} className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <Image
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={40}
            height={40}
            className="rounded-lg object-cover shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium truncate">{currentSong.title}</span>
            <span className="flex items-center gap-1 text-xs text-ink-muted truncate">
              {currentSong.artist.stageName}
              {currentSong.artist.verified && <BadgeCheck size={12} className="text-verified shrink-0" />}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={playPrevious} aria-label="Précédent" className="text-ink-muted hover:text-ink hidden sm:block">
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Lecture"}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-base hover:bg-accent-hover"
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button onClick={playNext} aria-label="Suivant" className="text-ink-muted hover:text-ink hidden sm:block">
            <SkipForward size={18} />
          </button>
          <button onClick={openFullPlayer} aria-label="Ouvrir le lecteur complet" className="text-ink-muted hover:text-ink hidden md:block">
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
