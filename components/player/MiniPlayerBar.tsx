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
  Heart,
  ListMusic,
  ListPlus,
  Share2,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { useOnlineStatus } from "@/context/OnlineStatusProvider";
import { useSession } from "next-auth/react";
import { SeekBar } from "@/components/player/SeekBar";
import { SongContextMenu } from "@/components/music/SongContextMenu";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { getOfflineSettings } from "@/lib/offlineSettings";
import { downloadSongForOffline, isSongOffline, removeOfflineSong, queuePendingDownload } from "@/lib/offlineCache";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const qualityLabel = { low: "64 kb/s", medium: "128 kb/s", high: "320 kb/s" } as const;

export function MiniPlayerBar() {
  const {
    currentSong,
    queue,
    isPlaying,
    progress,
    volume,
    setVolume,
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
  const { status: authStatus } = useSession();
  const pushToast = useToast();
  const { isOnline } = useOnlineStatus();

  const [offlineState, setOfflineState] = useState<"idle" | "saving" | "saved">("idle");
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [liked, setLiked] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [quality, setQuality] = useState<string>("320 kb/s");

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

  useEffect(() => {
    if (!currentSong || authStatus !== "authenticated") {
      setLiked(false);
      return;
    }
    fetch(`/api/songs/${currentSong._id}/like`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setLiked(data.liked))
      .catch(() => {});
  }, [currentSong, authStatus]);

  useEffect(() => {
    getOfflineSettings().then((s) => setQuality(qualityLabel[s.audioQuality]));
    const handler = () => getOfflineSettings().then((s) => setQuality(qualityLabel[s.audioQuality]));
    window.addEventListener("moziik-offline-settings-change", handler);
    return () => window.removeEventListener("moziik-offline-settings-change", handler);
  }, []);

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

  async function handleToggleLike() {
    if (authStatus !== "authenticated") {
      pushToast("error", "Connecte-toi pour aimer un son.");
      return;
    }
    const next = !liked;
    setLiked(next); // optimiste
    try {
      const res = await fetch(`/api/songs/${currentSong!._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
    } catch {
      setLiked(!next);
      pushToast("error", "Échec de l'action.");
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/son/${currentSong!._id}`;
    if (navigator.share) {
      await navigator.share({ title: currentSong!.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      pushToast("success", "Lien copié dans le presse-papiers.");
    }
  }

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 border-t border-border bg-surface/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)]">
      {/* Ligne fine pleine largeur, uniquement sur mobile — comme le mini-player Spotify mobile */}
      <div className="md:hidden">
        <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="edge" />
      </div>

      {/* ----- Ligne 1 (mobile : seule ligne ; desktop : piste + transport + actions) ----- */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-1.5 md:gap-4 md:px-5 md:pt-3 md:pb-1.5">
        {/* Piste en cours */}
        <button
          onClick={openFullPlayer}
          className="flex min-w-0 flex-1 items-center gap-3 text-left md:w-72 md:flex-none"
        >
          <SafeImage
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-lg object-cover md:h-14 md:w-14"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium md:text-base">{currentSong.title}</span>
            <span className="flex items-center gap-1 truncate text-xs text-ink-muted">
              {currentSong.artist.stageName}
              {currentSong.artist.verified && <BadgeCheck size={12} className="shrink-0 text-verified" />}
            </span>
            <span className="hidden md:flex items-center gap-1.5 mt-1.5">
              <span className="rounded-md bg-base px-1.5 py-0.5 text-[10px] text-ink-muted">Audio</span>
              <span className="rounded-md bg-base px-1.5 py-0.5 text-[10px] text-ink-muted">{quality}</span>
            </span>
          </span>
        </button>

        {/* Coeur — desktop uniquement ici (mobile : dans le lecteur plein écran) */}
        <button
          onClick={handleToggleLike}
          aria-label={liked ? "Ne plus aimer" : "J'aime"}
          className={`hidden md:block shrink-0 transition-colors ${liked ? "text-accent" : "text-ink-muted hover:text-ink"}`}
        >
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Mobile : juste le bouton lecture/pause à droite */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-base transition-colors hover:bg-accent-hover md:hidden"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Desktop : cluster central — transport */}
        <div className="hidden md:flex md:items-center md:gap-5 md:px-6">
          <button
            onClick={toggleShuffle}
            aria-label="Lecture aléatoire"
            aria-pressed={isShuffled}
            className={`transition-colors ${isShuffled ? "text-accent" : "text-ink-muted hover:text-ink"}`}
          >
            <Shuffle size={17} />
          </button>
          <button onClick={playPrevious} aria-label="Précédent" className="text-ink transition-colors hover:text-accent">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Lecture"}
            className="grid h-10 w-10 place-items-center rounded-full bg-ink text-base transition-transform hover:scale-105"
          >
            {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={playNext} aria-label="Suivant" className="text-ink transition-colors hover:text-accent">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            onClick={cycleRepeatMode}
            aria-label="Répéter"
            aria-pressed={repeatMode !== "off"}
            className={`transition-colors ${repeatMode !== "off" ? "text-accent" : "text-ink-muted hover:text-ink"}`}
          >
            <RepeatIcon size={17} />
          </button>
        </div>

        {/* Droite : actions avec libellés, desktop uniquement */}
        <div className="hidden md:flex md:flex-1 md:items-start md:justify-end md:gap-5">
          <button
            onClick={openFullPlayer}
            className="flex flex-col items-center gap-1 text-ink-muted transition-colors hover:text-ink"
          >
            <span className="relative">
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span className="absolute -top-1.5 -right-2 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-accent px-0.5 text-[9px] font-medium text-base">
                  {queue.length}
                </span>
              )}
            </span>
            <span className="text-[11px]">File d&apos;attente</span>
          </button>

          <button
            onClick={() => setShowAddToPlaylist(true)}
            className="flex flex-col items-center gap-1 text-ink-muted transition-colors hover:text-ink"
          >
            <ListPlus size={18} />
            <span className="text-[11px]">Ajouter</span>
          </button>

          <button
            onClick={handleToggleOffline}
            disabled={offlineState === "saving"}
            className={`flex flex-col items-center gap-1 transition-colors ${
              offlineState === "saved" ? "text-accent" : "text-ink-muted hover:text-ink"
            }`}
          >
            {offlineState === "saving" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : offlineState === "saved" ? (
              <Check size={18} />
            ) : (
              <Download size={18} />
            )}
            <span className="text-[11px]">Télécharger</span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 text-ink-muted transition-colors hover:text-ink">
            <Share2 size={18} />
            <span className="text-[11px]">Partager</span>
          </button>

          <button
            onClick={(e) => setMenuPosition({ x: e.clientX, y: e.clientY })}
            className="flex flex-col items-center gap-1 text-ink-muted transition-colors hover:text-ink"
          >
            <MoreHorizontal size={18} />
            <span className="text-[11px]">Plus</span>
          </button>
        </div>
      </div>

      {/* ----- Ligne 2, desktop uniquement : progression + volume + agrandir ----- */}
      <div className="hidden md:flex md:items-center md:gap-4 md:px-5 md:pb-3">
        <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
          {formatTime(progress)}
        </span>
        <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="pill" className="flex-1" />
        <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-muted">
          {formatTime(currentSong.duration)}
        </span>

        <div className="h-4 w-px bg-border mx-1" />

        <div className="flex items-center gap-2 w-36 shrink-0">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            aria-label={volume === 0 ? "Réactiver le son" : "Couper le son"}
            className="text-ink-muted hover:text-ink shrink-0"
          >
            <VolumeIcon size={17} />
          </button>
          <SeekBar progress={volume} duration={1} onSeek={setVolume} variant="pill" />
        </div>

        <button
          onClick={openFullPlayer}
          aria-label="Lecteur plein écran"
          className="text-ink-muted hover:text-ink shrink-0"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {menuPosition && (
        <SongContextMenu
          song={currentSong}
          position={menuPosition}
          hideOffline
          onClose={() => setMenuPosition(null)}
        />
      )}
      {showAddToPlaylist && (
        <AddToPlaylistModal songId={currentSong._id} onClose={() => setShowAddToPlaylist(false)} />
      )}
    </div>
  );
}
