"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, Play, DownloadCloud, Loader2 } from "lucide-react";
import { SongRow } from "@/components/music/SongRow";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { downloadAlbumForOffline } from "@/lib/offlineCache";

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
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ done: 0, total: 0 });

  async function handleDownloadAlbum() {
    if (!album) return;
    setDownloading(true);
    try {
      await downloadAlbumForOffline(album._id, (done, total) => setDownloadProgress({ done, total }));
      pushToast("success", "Album disponible hors-ligne.");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Échec du téléchargement.");
    } finally {
      setDownloading(false);
    }
  }

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
        <SafeImage src={album.coverUrl} alt={album.title} width={120} height={120} className="rounded-xl2 object-cover shadow-lg" />
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted mb-1">{album.type}</p>
          <h1 className="text-xl font-display mb-1">{album.title}</h1>
          <Link href={`/artiste/${album.artist._id}`} className="flex items-center gap-1 text-sm text-ink-muted hover:text-accent">
            {album.artist.stageName}
            {album.artist.verified && <BadgeCheck size={13} className="text-verified" />}
          </Link>

          {album.songs.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => playQueue(album.songs, 0)}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-base hover:bg-accent-hover"
              >
                <Play size={14} fill="currentColor" /> Écouter tout
              </button>
              <button
                onClick={handleDownloadAlbum}
                disabled={downloading}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-medium text-ink-muted hover:border-accent hover:text-accent disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {downloadProgress.total > 0 && `${downloadProgress.done}/${downloadProgress.total}`}
                  </>
                ) : (
                  <>
                    <DownloadCloud size={14} /> Télécharger tout
                  </>
                )}
              </button>
            </div>
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
