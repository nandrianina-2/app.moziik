"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ListMusic, Heart, WifiOff, Trash2 } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { listOfflineSongs, removeOfflineSong, type OfflineSongMeta } from "@/lib/offlineCache";
import type { PlayableSong } from "@/context/PlayerProvider";

type Playlist = { _id: string; title: string; coverUrl?: string; songs: string[] };

export default function LibraryPage() {
  const { status } = useSession();
  const [tab, setTab] = useState<"playlists" | "liked" | "offline">("playlists");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<PlayableSong[]>([]);
  const [offlineSongs, setOfflineSongs] = useState<OfflineSongMeta[]>([]);
  const [loading, setLoading] = useState(true);

  function loadOfflineSongs() {
    setOfflineSongs(listOfflineSongs());
  }

  useEffect(() => {
    loadOfflineSongs();
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

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <h1 className="text-2xl font-display mb-6">Ma bibliothèque</h1>

      <div className="flex gap-2 mb-6">
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
      </div>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && tab === "playlists" && status !== "authenticated" && (
        <p className="text-sm text-ink-muted">Connecte-toi pour retrouver tes playlists.</p>
      )}

      {!loading && tab === "playlists" && status === "authenticated" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <div className="space-y-2">
          {offlineSongs.length === 0 && (
            <p className="text-sm text-ink-muted">
              Aucun son téléchargé — utilise &quot;Écouter hors-ligne&quot; dans le menu &quot;...&quot; d&apos;un son.
            </p>
          )}
          {offlineSongs.map((song) => (
            <div key={song._id} className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3">
              <Image src={song.coverUrl} alt={song.title} width={40} height={40} className="rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{song.title}</p>
                <p className="text-xs text-ink-muted truncate">{song.artistName}</p>
              </div>
              <button
                onClick={async () => {
                  await removeOfflineSong(song._id);
                  loadOfflineSongs();
                }}
                aria-label="Retirer du hors-ligne"
                className="text-ink-muted hover:text-accent p-1.5"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
