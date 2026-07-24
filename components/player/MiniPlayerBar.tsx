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

const bitrateLabel = { low: "64 kbps", medium: "128 kbps", high: "320 kbps" } as const;

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
  const [bitrate, setBitrate] = useState<string>(bitrateLabel.high);

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
    getOfflineSettings().then((s) => setBitrate(bitrateLabel[s.audioQuality]));
    const handler = () => getOfflineSettings().then((s) => setBitrate(bitrateLabel[s.audioQuality]));
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
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface shadow-[0_-8px_32px_-16px_rgba(0,0,0,0.25)] md:inset-x-4 md:bottom-4 md:rounded-[28px] md:border md:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] lg:inset-x-8">
      {/* Filet de progression, mobile uniquement */}
      <div className="md:hidden">
        <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="edge" />
      </div>

      {/* Ligne mobile : piste + lecture (remplacée par la ligne unique desktop ci-dessous) */}
      <div className="flex items-center gap-3 px-3 py-2.5 md:hidden">
        <button
          onClick={openFullPlayer}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <SafeImage
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 rounded-xl object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{currentSong.title}</span>
            <span className="flex items-center gap-1 truncate text-xs text-ink-muted">
              {currentSong.artist.stageName}
              {currentSong.artist.verified && <BadgeCheck size={12} className="shrink-0 text-verified" />}
            </span>
          </span>
        </button>

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-base transition-colors hover:bg-accent-hover"
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>

      {/* Ligne desktop : tout tient sur une seule ligne, à la manière d'un lecteur premium */}
      <div className="hidden items-center gap-4 px-5 py-3 md:flex lg:gap-5 lg:px-6">
        {/* Piste en cours */}
        <button
          onClick={openFullPlayer}
          className="flex w-60 min-w-0 shrink-0 items-center gap-3 text-left lg:w-72"
        >
          <SafeImage
            src={currentSong.coverUrl}
            alt={currentSong.title}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{currentSong.title}</span>
            <span className="flex items-center gap-1 truncate text-xs text-ink-muted">
              {currentSong.artist.stageName}
              {currentSong.artist.verified && <BadgeCheck size={12} className="shrink-0 text-verified" />}
            </span>
            <span className="mt-1.5 flex items-center gap-1.5">
              <span className="rounded-md bg-base px-2 py-0.5 text-[10px] font-medium text-ink-muted">MP3</span>
              <span className="rounded-md bg-base px-2 py-0.5 text-[10px] font-medium text-ink-muted">{bitrate}</span>
              <span className="rounded-md bg-base px-2 py-0.5 text-[10px] font-medium text-ink-muted">44.1 kHz</span>
            </span>
          </span>
        </button>

        {/* Coeur */}
        <button
          onClick={handleToggleLike}
          aria-label={liked ? "Ne plus aimer" : "J'aime"}
          className={`shrink-0 transition-colors ${liked ? "text-accent" : "text-ink-muted hover:text-ink"}`}
        >
          <Heart size={22} fill={liked ? "currentColor" : "none"} />
        </button>

        <div className="h-8 w-px shrink-0 bg-border" />

        {/* Transport */}
        <div className="flex shrink-0 items-center gap-5">
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

        <div className="h-8 w-px shrink-0 bg-border" />

        {/* Progression */}
        <div className="flex min-w-[160px] flex-1 items-center gap-3">
          <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-ink-muted">
            {formatTime(progress)}
          </span>
          <SeekBar progress={progress} duration={currentSong.duration} onSeek={seek} variant="pill" className="flex-1" />
          <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-muted">
            {formatTime(currentSong.duration)}
          </span>
        </div>

        <div className="h-8 w-px shrink-0 bg-border" />

        {/* Actions avec libellés */}
        <div className="flex shrink-0 items-start gap-5">
          <button
            onClick={openFullPlayer}
            className="flex flex-col items-center gap-1 text-ink-muted transition-colors hover:text-ink"
          >
            <span className="relative inline-flex">
              <ListMusic size={18} />
              {queue.length > 0 && (
                <span
                  className="absolute grid place-items-center rounded-full bg-ink font-semibold text-base"
                  style={{
                    top: -6,
                    right: -8,
                    height: 16,
                    minWidth: 16,
                    padding: "0 4px",
                    fontSize: 9,
                    lineHeight: 1,
                  }}
                >
                  {queue.length > 9 ? "9+" : queue.length}
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

        <div className="h-8 w-px shrink-0 bg-border" />

        {/* Volume */}
        <div className="flex w-28 shrink-0 items-center gap-2 lg:w-32">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            aria-label={volume === 0 ? "Réactiver le son" : "Couper le son"}
            className="shrink-0 text-ink-muted hover:text-ink"
          >
            <VolumeIcon size={17} />
          </button>
          <SeekBar progress={volume} duration={1} onSeek={setVolume} variant="pill" />
        </div>

        {/* Plein écran */}
        <button
          onClick={openFullPlayer}
          aria-label="Lecteur plein écran"
          className="shrink-0 text-ink-muted hover:text-ink"
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