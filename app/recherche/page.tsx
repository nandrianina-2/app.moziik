"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, BadgeCheck } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import type { PlayableSong } from "@/context/PlayerProvider";

type ArtistResult = { _id: string; stageName: string; verified?: boolean; coverUrl?: string };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<PlayableSong[]>([]);
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSongs([]);
      setArtists([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSongs(data.songs);
          setArtists(data.artists);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <h1 className="text-2xl font-display mb-6">Recherche</h1>

      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 mb-8">
        <SearchIcon size={18} className="text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un son ou un artiste..."
          className="flex-1 bg-transparent text-sm outline-none"
          autoFocus
        />
      </label>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && query.trim().length >= 2 && artists.length === 0 && songs.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun résultat pour &quot;{query}&quot;.</p>
      )}

      {artists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Artistes</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {artists.map((artist) => (
              <Link key={artist._id} href={`/artiste/${artist._id}`} className="shrink-0 w-20 text-center">
                {artist.coverUrl ? (
                  <Image src={artist.coverUrl} alt={artist.stageName} width={64} height={64} className="rounded-full object-cover mx-auto mb-2" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-surface mx-auto mb-2" />
                )}
                <p className="text-xs truncate flex items-center justify-center gap-1">
                  {artist.stageName}
                  {artist.verified && <BadgeCheck size={11} className="text-verified shrink-0" />}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {songs.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Sons</h2>
          <div className="space-y-1">
            {songs.map((song, index) => (
              <SongRow key={song._id} song={song} queue={songs} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
