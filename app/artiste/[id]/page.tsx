"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { BadgeCheck, Users, Disc3 } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";
import type { PlayableSong } from "@/context/PlayerProvider";

type ArtistProfile = {
  _id: string;
  stageName: string;
  bio?: string;
  coverUrl?: string;
  genres: string[];
  verified: boolean;
  followersCount: number;
};

type AlbumSummary = { _id: string; title: string; coverUrl: string };

export default function ArtistProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const pushToast = useToast();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [songs, setSongs] = useState<PlayableSong[]>([]);
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch(`/api/artists/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArtist(data.artist);
      setSongs(data.songs);
      setAlbums(data.albums);
    } catch {
      pushToast("error", "Impossible de charger ce profil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleFollow() {
    if (status !== "authenticated") {
      pushToast("error", "Connecte-toi pour suivre un artiste.");
      return;
    }
    const res = await fetch(`/api/artists/${id}/follow`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setFollowing(data.following);
    setArtist((prev) => (prev ? { ...prev, followersCount: data.followersCount } : prev));
  }

  if (loading || !artist) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <div className="flex items-center gap-5 mb-6">
        {artist.coverUrl && (
          <Image src={artist.coverUrl} alt={artist.stageName} width={96} height={96} className="rounded-full object-cover" />
        )}
        <div>
          <h1 className="flex items-center gap-1.5 text-xl font-display">
            {artist.stageName}
            {artist.verified && <BadgeCheck size={16} className="text-verified" />}
          </h1>
          <p className="flex items-center gap-1 text-xs text-ink-muted mt-1">
            <Users size={12} /> {artist.followersCount} abonné(s)
          </p>
        </div>
      </div>

      {artist.bio && <p className="text-sm text-ink-muted mb-4">{artist.bio}</p>}

      {artist.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {artist.genres.map((genre) => (
            <span key={genre} className="rounded-full border border-border px-3 py-1 text-xs text-ink-muted">
              {genre}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={toggleFollow}
        className={`rounded-full px-5 py-2 text-sm font-medium mb-8 transition-colors ${
          following ? "border border-border text-ink-muted hover:border-accent" : "bg-accent text-base hover:bg-accent-hover"
        }`}
      >
        {following ? "Abonné" : "Suivre"}
      </button>

      {albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Albums</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {albums.map((album) => (
              <Link key={album._id} href={`/album/${album._id}`} className="shrink-0 w-32">
                <Image src={album.coverUrl} alt={album.title} width={128} height={128} className="rounded-xl2 object-cover mb-2" />
                <p className="text-xs truncate flex items-center gap-1">
                  <Disc3 size={11} className="shrink-0" /> {album.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Sons</h2>
        <div className="space-y-1">
          {songs.map((song, index) => (
            <SongRow key={song._id} song={song} queue={songs} index={index} onDeleted={load} />
          ))}
          {songs.length === 0 && <p className="text-sm text-ink-muted">Pas encore de son publié.</p>}
        </div>
      </section>
    </div>
  );
}
