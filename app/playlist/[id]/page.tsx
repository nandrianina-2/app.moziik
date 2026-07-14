"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, ListMusic, Globe, Lock } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";

type PlaylistDetail = {
  _id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  owner: { _id: string; name: string };
  songs: PlayableSong[];
};

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const pushToast = useToast();
  const { playQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch(`/api/playlists/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlaylist(data.playlist);
    } catch {
      pushToast("error", "Impossible de charger cette playlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !playlist) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  const isOwner = session?.user?.id === playlist.owner._id;

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <div className="flex items-center gap-5 mb-8">
        {playlist.coverUrl ? (
          <Image src={playlist.coverUrl} alt={playlist.title} width={120} height={120} className="rounded-xl2 object-cover shadow-lg" />
        ) : (
          <div className="h-[120px] w-[120px] rounded-xl2 bg-surface grid place-items-center shrink-0">
            <ListMusic size={28} className="text-ink-muted" />
          </div>
        )}
        <div>
          <p className="flex items-center gap-1 text-xs text-ink-muted mb-1">
            {playlist.isPublic ? <Globe size={11} /> : <Lock size={11} />}
            {playlist.isPublic ? "Playlist publique" : "Playlist privée"}
          </p>
          <h1 className="text-xl font-display mb-1">{playlist.title}</h1>
          {playlist.description && <p className="text-sm text-ink-muted mb-1">{playlist.description}</p>}
          <p className="text-xs text-ink-muted mb-4">
            Par {isOwner ? "toi" : playlist.owner.name} · {playlist.songs.length} son(s)
          </p>

          {playlist.songs.length > 0 && (
            <button
              onClick={() => playQueue(playlist.songs, 0)}
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-base hover:bg-accent-hover"
            >
              <Play size={14} fill="currentColor" /> Écouter tout
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {playlist.songs.map((song, index) => (
          <SongRow key={song._id} song={song} queue={playlist.songs} index={index} onDeleted={load} />
        ))}
        {playlist.songs.length === 0 && (
          <p className="text-sm text-ink-muted">Cette playlist est vide pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
