"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Download,
  Check,
  Loader2,
  MoreHorizontal,
  BadgeCheck,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { useOnlineStatus } from "@/context/OnlineStatusProvider";
import { SeekBar } from "@/components/player/SeekBar";
import { SongContextMenu } from "@/components/music/SongContextMenu";
import { downloadSongForOffline, isSongOffline, removeOfflineSong, queuePendingDownload } from "@/lib/offlineCache";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayerBar() {
  const {
    currentSong,
    isPlaying,
    progress,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    openFullPlayer,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
  } = usePlayer();
  const pushToast = useToast();
  const { isOnline } = useOnlineStatus();

  const [offlineState, setOfflineState] = useState<"idle" | "saving" | "saved">("idle");
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!currentSong) return;
    let cancelled = false;
    isSongOffline(currentSong._id).then((offline) => {
      if (!cancelled) setOfflineState(offline ? "saved" : "idle");
    });
    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  if (!currentSong) return null;

  async function handleToggleOffline() {
    if (!currentSong || offlineState === "saving") return;
    try {
      if (offlineState === "saved") {
        await removeOfflineSong(currentSong._id);
        setOfflineState("idle");
        pushToast("success", "Retiré du mode hors-ligne.");
      } else if (!isOnline) {
        await queuePendingDownload({
          _id: currentSong._id,
          title: currentSong.title,
          coverUrl: currentSong.coverUrl,
          audioUrl: currentSong.audioUrl,
          duration: currentSong.duration,
          artist: currentSong.artist,
        });
        pushToast("info", "En attente — le téléchargement démarrera à la reconnexion.");
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

  return (
    <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)]">
      {/* Ligne fine pleine largeur, uniquement sur mobile — comme le mini-player Spotify mobile */}
      <div className="md:hidden">
        <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="edge" />
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 md:gap-4 md:px-4 md:py-3">
        {/* Piste en cours */}
        <button
          onClick={openFullPlayer}
          className="flex min-w-0 flex-1 items-center gap-3 text-left md:w-64 md:flex-none"
        >
          <SafeImage
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-lg object-cover md:h-12 md:w-12"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{currentSong.title}</span>
            <span className="flex items-center gap-1 truncate text-xs text-ink-muted">
              {currentSong.artist.stageName}
              {currentSong.artist.verified && <BadgeCheck size={12} className="shrink-0 text-verified" />}
            </span>
          </span>
        </button>

        {/* Mobile : juste le bouton lecture/pause à droite */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-base transition-colors hover:bg-accent-hover md:hidden"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Desktop : cluster central — aléatoire, transport, répétition + barre de progression avec temps, comme Spotify */}
        <div className="hidden md:flex md:flex-1 md:max-w-2xl md:flex-col md:items-center md:gap-1.5">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              aria-label="Lecture aléatoire"
              aria-pressed={isShuffled}
              className={`transition-colors ${isShuffled ? "text-accent" : "text-ink-muted hover:text-ink"}`}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={playPrevious} aria-label="Précédent" className="text-ink-muted transition-colors hover:text-ink">
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Lecture"}
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-base transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={playNext} aria-label="Suivant" className="text-ink-muted transition-colors hover:text-ink">
              <SkipForward size={18} />
            </button>
            <button
              onClick={cycleRepeatMode}
              aria-label="Répéter"
              aria-pressed={repeatMode !== "off"}
              className={`transition-colors ${repeatMode !== "off" ? "text-accent" : "text-ink-muted hover:text-ink"}`}
            >
              <RepeatIcon size={16} />
            </button>
          </div>

          <div className="flex w-full items-center gap-2">
            <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
              {formatTime(progress)}
            </span>
            <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="pill" />
            <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-muted">
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Droite : téléchargement hors-ligne + autres options, desktop uniquement */}
        <div className="hidden md:flex md:w-64 md:items-center md:justify-end md:gap-3">
          <button
            onClick={handleToggleOffline}
            aria-label={offlineState === "saved" ? "Retirer du hors-ligne" : "Écouter hors-ligne"}
            title={offlineState === "saved" ? "Disponible hors-ligne" : "Télécharger pour écouter hors-ligne"}
            disabled={offlineState === "saving"}
            className={`transition-colors ${offlineState === "saved" ? "text-accent" : "text-ink-muted hover:text-ink"}`}
          >
            {offlineState === "saving" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : offlineState === "saved" ? (
              <Check size={18} />
            ) : (
              <Download size={18} />
            )}
          </button>

          <button
            onClick={(e) => setMenuPosition({ x: e.clientX, y: e.clientY })}
            aria-label="Autres options"
            title="Autres options"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <MoreHorizontal size={18} />
          </button>
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
