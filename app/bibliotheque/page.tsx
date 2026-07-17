"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ListMusic, Heart, WifiOff, HardDrive, Trash2, Wifi, Gauge } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import {
  listOfflineSongs,
  cleanupUnplayedSince,
  clearAllOfflineSongs,
  getStorageUsage,
  type OfflineSongMeta,
} from "@/lib/offlineCache";
import {
  getOfflineSettings,
  setOfflineSettings,
  type OfflineSettings,
  type AudioQuality,
} from "@/lib/offlineSettings";
import { useToast } from "@/context/ToastProvider";
import type { PlayableSong } from "@/context/PlayerProvider";

type Playlist = { _id: string; title: string; coverUrl?: string; songs: string[] };

export default function LibraryPage() {
  const { status } = useSession();
  const pushToast = useToast();
  const [tab, setTab] = useState<"playlists" | "liked" | "offline" | "storage">("playlists");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<PlayableSong[]>([]);
  const [offlineSongs, setOfflineSongs] = useState<OfflineSongMeta[]>([]);
  const [usage, setUsage] = useState<{ usedMB: number; quotaMB: number } | null>(null);
  const [settings, setSettings] = useState<OfflineSettings | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadOfflineSongs() {
    setOfflineSongs(await listOfflineSongs());
    setUsage(await getStorageUsage());
  }

  useEffect(() => {
    loadOfflineSongs();
    getOfflineSettings().then(setSettings);
    window.addEventListener("moziik-offline-change", loadOfflineSongs);
    return () => window.removeEventListener("moziik-offline-change", loadOfflineSongs);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const [playlistsRes, likedRes] = await Promise.all([
          fetch("/api/playlists?owner=me"),
          fetch("/api/me/liked-songs"),
        ]);
        if (playlistsRes.ok) setPlaylists((await playlistsRes.json()).playlists);
        if (likedRes.ok) setLikedSongs((await likedRes.json()).songs);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [status]);

  async function updateSetting<K extends keyof OfflineSettings>(key: K, value: OfflineSettings[K]) {
    const next = await setOfflineSettings({ [key]: value });
    setSettings(next);
  }

  async function handleCleanup() {
    const removed = await cleanupUnplayedSince(90);
    pushToast("success", `${removed} son(s) non écouté(s) depuis 90 jours supprimé(s).`);
  }

  async function handleClearAll() {
    await clearAllOfflineSongs();
    pushToast("success", "Cache hors-ligne vidé.");
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
      <h1 className="text-2xl font-display mb-6">Ma bibliothèque</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTab("playlists")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "playlists" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <ListMusic size={14} /> Playlists
        </button>
        <button
          onClick={() => setTab("liked")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "liked" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <Heart size={14} /> Sons aimés
        </button>
        <button
          onClick={() => setTab("offline")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "offline" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <WifiOff size={14} /> Hors-ligne
        </button>
        <button
          onClick={() => setTab("storage")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "storage" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <HardDrive size={14} /> Stockage
        </button>
      </div>

      {loading && tab !== "offline" && tab !== "storage" && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && tab === "playlists" && status !== "authenticated" && (
        <p className="text-sm text-ink-muted">Connecte-toi pour retrouver tes playlists.</p>
      )}

      {!loading && tab === "playlists" && status === "authenticated" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.length === 0 && (
            <p className="text-sm text-ink-muted col-span-full">
              Pas encore de playlist — ajoute un son à une playlist depuis son menu &quot;...&quot;.
            </p>
          )}
          {playlists.map((playlist) => (
            <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
              {playlist.coverUrl ? (
                <Image src={playlist.coverUrl} alt={playlist.title} width={140} height={140} className="rounded-xl2 object-cover w-full aspect-square mb-2" />
              ) : (
                <div className="rounded-xl2 bg-surface w-full aspect-square mb-2 grid place-items-center">
                  <ListMusic size={24} className="text-ink-muted" />
                </div>
              )}
              <p className="text-sm truncate">{playlist.title}</p>
              <p className="text-xs text-ink-muted">{playlist.songs.length} son(s)</p>
            </Link>
          ))}
        </div>
      )}

      {!loading && tab === "liked" && status !== "authenticated" && (
        <p className="text-sm text-ink-muted">Connecte-toi pour retrouver tes sons aimés.</p>
      )}

      {!loading && tab === "liked" && status === "authenticated" && (
        <div className="space-y-1">
          {likedSongs.length === 0 && (
            <p className="text-sm text-ink-muted">Aucun son aimé pour l&apos;instant.</p>
          )}
          {likedSongs.map((song, index) => (
            <SongRow key={song._id} song={song} queue={likedSongs} index={index} />
          ))}
        </div>
      )}

      {tab === "offline" && (
        <div className="space-y-1">
          {offlineSongs.length === 0 && (
            <p className="text-sm text-ink-muted">
              Aucun son téléchargé — utilise &quot;Écouter hors-ligne&quot; dans le menu &quot;...&quot; d&apos;un son,
              ou télécharge un album/une playlist entière depuis sa page.
            </p>
          )}
          {offlineSongs.map((song, index) => (
            <SongRow key={song._id} song={song} queue={offlineSongs} index={index} />
          ))}
        </div>
      )}

      {tab === "storage" && settings && (
        <div className="max-w-md space-y-6">
          <div className="rounded-xl2 border border-border bg-surface p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium mb-2">
              <HardDrive size={15} className="text-accent" /> Espace utilisé
            </p>
            {usage ? (
              <>
                <p className="text-xs text-ink-muted mb-2">
                  {usage.usedMB} Mo utilisés sur {usage.quotaMB} Mo disponibles (estimation du navigateur)
                </p>
                <div className="h-2 rounded-full bg-base overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.min(100, (usage.usedMB / Math.max(usage.quotaMB, 1)) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-ink-muted">Estimation non disponible sur ce navigateur.</p>
            )}
            <p className="text-xs text-ink-muted mt-3">{offlineSongs.length} son(s) téléchargé(s)</p>
          </div>

          <div className="rounded-xl2 border border-border bg-surface p-4 space-y-3">
            <p className="text-sm font-medium">Nettoyage</p>
            <button
              onClick={handleCleanup}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs text-ink-muted hover:border-accent hover:text-accent"
            >
              <Trash2 size={13} /> Supprimer les sons non écoutés depuis 90 jours
            </button>
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-accent/40 py-2 text-xs text-accent hover:bg-accent/10"
            >
              <Trash2 size={13} /> Vider tout le cache hors-ligne
            </button>
          </div>

          <div className="rounded-xl2 border border-border bg-surface p-4 space-y-4">
            <p className="text-sm font-medium">Paramètres de téléchargement</p>

            <label className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Wifi size={14} /> Télécharger uniquement en Wi-Fi
              </span>
              <input
                type="checkbox"
                checked={settings.wifiOnlyDownload}
                onChange={(e) => updateSetting("wifiOnlyDownload", e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Télécharger auto. favoris & récents</span>
              <input
                type="checkbox"
                checked={settings.autoDownloadFavorites}
                onChange={(e) => updateSetting("autoDownloadFavorites", e.target.checked)}
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-1.5 text-sm text-ink-muted mb-1.5">
                <Gauge size={14} /> Qualité audio hors-ligne
              </span>
              <select
                value={settings.audioQuality}
                onChange={(e) => updateSetting("audioQuality", e.target.value as AudioQuality)}
                className="w-full rounded-xl border border-border bg-base px-3.5 py-2 text-sm outline-none"
              >
                <option value="low">Faible (64 kb/s)</option>
                <option value="medium">Moyenne (128 kb/s)</option>
                <option value="high">Élevée (320 kb/s)</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
