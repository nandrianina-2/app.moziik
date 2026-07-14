"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Play, Pause, SkipBack, SkipForward, BadgeCheck, Sliders, ListMusic } from "lucide-react";
import { usePlayer } from "@/context/PlayerProvider";
import { EQPanel } from "@/components/player/panels/EQPanel";
import { QueuePanel } from "@/components/player/panels/QueuePanel";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FullPlayerPage() {
  const { currentSong, isPlaying, progress, togglePlay, playNext, playPrevious, seek, isFullPlayerOpen, closeFullPlayer } =
    usePlayer();
  const [tab, setTab] = useState<"eq" | "queue">("eq");

  if (!isFullPlayerOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-base flex flex-col animate-toast-in">
      <header className="flex items-center justify-between px-6 py-4">
        <button onClick={closeFullPlayer} aria-label="Fermer le lecteur" className="text-ink-muted hover:text-ink">
          <ChevronDown size={22} />
        </button>
        <span className="text-xs uppercase tracking-wide text-ink-muted">En cours de lecture</span>
        <span className="w-[22px]" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
        <Image
          src={currentSong.coverUrl}
          alt={currentSong.title}
          width={280}
          height={280}
          className="rounded-xl2 object-cover shadow-2xl mb-6"
        />

        <h1 className="text-xl font-display text-center">{currentSong.title}</h1>
        <p className="flex items-center gap-1 text-sm text-ink-muted mb-6">
          {currentSong.artist.stageName}
          {currentSong.artist.verified && <BadgeCheck size={14} className="text-verified" />}
        </p>

        <div className="w-full max-w-md">
          <input
            type="range"
            min={0}
            max={currentSong.duration}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Progression de la lecture"
          />
          <div className="flex justify-between text-xs text-ink-muted mb-6">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-6 mb-10">
            <button onClick={playPrevious} aria-label="Précédent" className="text-ink hover:text-accent">
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Lecture"}
              className="grid h-16 w-16 place-items-center rounded-full bg-accent text-base hover:bg-accent-hover"
            >
              {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
            </button>
            <button onClick={playNext} aria-label="Suivant" className="text-ink hover:text-accent">
              <SkipForward size={24} />
            </button>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setTab("eq")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                tab === "eq" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
              }`}
            >
              <Sliders size={14} /> Égaliseur
            </button>
            <button
              onClick={() => setTab("queue")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                tab === "queue" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
              }`}
            >
              <ListMusic size={14} /> File d&apos;attente
            </button>
          </div>

          {tab === "eq" ? <EQPanel /> : <QueuePanel />}
        </div>
      </div>
    </div>
  );
}
