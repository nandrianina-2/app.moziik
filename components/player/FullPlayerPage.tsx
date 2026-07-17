"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BadgeCheck,
  Sliders,
  ListMusic,
  Shuffle,
  Repeat,
  Repeat1,
  Download,
  Check,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { SeekBar } from "@/components/player/SeekBar";
import { EQPanel } from "@/components/player/panels/EQPanel";
import { QueuePanel } from "@/components/player/panels/QueuePanel";
import { SongContextMenu } from "@/components/music/SongContextMenu";
import { downloadSongForOffline, isSongOffline, removeOfflineSong } from "@/lib/offlineCache";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Distance de glissement (px) à partir de laquelle le lecteur se ferme au relâchement.
const CLOSE_THRESHOLD = 120;

export function FullPlayerPage() {
  const {
    currentSong,
    isPlaying,
    progress,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    isFullPlayerOpen,
    closeFullPlayer,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = usePlayer();
  const pushToast = useToast();
  const [tab, setTab] = useState<"eq" | "queue">("eq");

  const [offlineState, setOfflineState] = useState<"idle" | "saving" | "saved">("idle");
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Glissement vers le bas pour fermer (zone d'en-tête + pochette/titre).
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!currentSong) return;
    setOfflineState(isSongOffline(currentSong._id) ? "saved" : "idle");
  }, [currentSong]);

  function handlePointerDown(e: React.PointerEvent) {
    startYRef.current = e.clientY;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) setDragY(delta);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) {
      closeFullPlayer();
    }
    setDragY(0);
  }

  if (!isFullPlayerOpen || !currentSong) return null;

  async function handleToggleOffline() {
    if (!currentSong || offlineState === "saving") return;
    try {
      if (offlineState === "saved") {
        await removeOfflineSong(currentSong._id);
        setOfflineState("idle");
        pushToast("success", "Retiré du mode hors-ligne.");
      } else {
        setOfflineState("saving");
        await downloadSongForOffline({
          _id: currentSong._id,
          title: currentSong.title,
          coverUrl: currentSong.coverUrl,
          audioUrl: currentSong.audioUrl,
          duration: currentSong.duration,
          artist: currentSong.artist,
        });
        setOfflineState("saved");
        pushToast("success", "Disponible hors-ligne.");
      }
    } catch (err) {
      setOfflineState("idle");
      pushToast("error", err instanceof Error ? err.message : "Échec du mode hors-ligne.");
    }
  }

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const dragProgress = Math.min(1, dragY / (CLOSE_THRESHOLD * 2));

  return (
    <div
      className="fixed inset-0 z-50 bg-base flex flex-col animate-toast-in"
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: 1 - dragProgress * 0.4,
        transition: dragging ? "none" : "transform 0.25s ease, opacity 0.25s ease",
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="touch-none"
      >
        <header className="flex items-center justify-between px-6 py-4 cursor-grab active:cursor-grabbing">
          <button onClick={closeFullPlayer} aria-label="Fermer le lecteur" className="text-ink-muted hover:text-ink">
            <ChevronDown size={22} />
          </button>
          <span className="text-xs uppercase tracking-wide text-ink-muted">En cours de lecture</span>
          <button
            onClick={(e) => setMenuPosition({ x: e.clientX, y: e.clientY })}
            aria-label="Autres options"
            className="text-ink-muted hover:text-ink"
          >
            <MoreHorizontal size={20} />
          </button>
        </header>

        {/* Poignée visuelle indiquant que la zone se glisse */}
        <div className="flex justify-center pb-2 -mt-2">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <Image
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={280}
            height={280}
            className="rounded-xl2 object-cover shadow-2xl mb-6"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-display">{currentSong.title}</h1>
              <p className="flex items-center gap-1 text-sm text-ink-muted">
                {currentSong.artist.stageName}
                {currentSong.artist.verified && <BadgeCheck size={14} className="text-verified" />}
              </p>
            </div>
            <button
              onClick={handleToggleOffline}
              aria-label={offlineState === "saved" ? "Retirer du hors-ligne" : "Écouter hors-ligne"}
              title={offlineState === "saved" ? "Disponible hors-ligne" : "Télécharger pour écouter hors-ligne"}
              disabled={offlineState === "saving"}
              className={`shrink-0 transition-colors ${
                offlineState === "saved" ? "text-accent" : "text-ink-muted hover:text-ink"
              }`}
            >
              {offlineState === "saving" ? (
                <Loader2 size={22} className="animate-spin" />
              ) : offlineState === "saved" ? (
                <Check size={22} />
              ) : (
                <Download size={22} />
              )}
            </button>
          </div>

          <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="pill" />
          <div className="flex justify-between text-xs text-ink-muted mb-6 -mt-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-5 mb-10">
            <button
              onClick={toggleShuffle}
              aria-label="Lecture aléatoire"
              aria-pressed={isShuffled}
              className={`transition-colors ${isShuffled ? "text-accent" : "text-ink-muted hover:text-ink"}`}
            >
              <Shuffle size={18} />
            </button>
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
            <button
              onClick={cycleRepeatMode}
              aria-label="Répéter"
              aria-pressed={repeatMode !== "off"}
              className={`transition-colors ${repeatMode !== "off" ? "text-accent" : "text-ink-muted hover:text-ink"}`}
            >
              <RepeatIcon size={18} />
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

      {menuPosition && (
        <SongContextMenu
          song={currentSong}
          position={menuPosition}
          hideOffline
          onClose={() => setMenuPosition(null)}
        />
      )}
    </div>
  );
}
