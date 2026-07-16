"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, Play } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";

type AlbumDetail = {
  _id: string;
  title: string;
  coverUrl: string;
  type: string;
  releaseDate: string;
  artist: { _id: string; stageName: string; verified?: boolean };
  songs: PlayableSong[];
};

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pushToast = useToast();
  const { playQueue } = usePlayer();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch(`/api/albums/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAlbum(data.album);
    } catch {
      pushToast("error", "Impossible de charger cet album.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !album) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
      <div className="flex items-center gap-5 mb-8">
        <Image src={album.coverUrl} alt={album.title} width={120} height={120} className="rounded-xl2 object-cover shadow-lg" />
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted mb-1">{album.type}</p>
          <h1 className="text-xl font-display mb-1">{album.title}</h1>
          <Link href={`/artiste/${album.artist._id}`} className="flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
            {album.artist.stageName}
            {album.artist.verified && <BadgeCheck size={13} className="text-verified" />}
          </Link>

          {album.songs.length > 0 && (
            <button
              onClick={() => playQueue(album.songs, 0)}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-base hover:bg-accent-hover mt-4"
            >
              <Play size={14} fill="currentColor" /> Écouter tout
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {album.songs.map((song, index) => (
          <SongRow key={song._id} song={song} queue={album.songs} index={index} onDeleted={load} />
        ))}
      </div>
    </div>
  );
}
