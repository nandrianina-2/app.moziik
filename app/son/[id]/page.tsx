"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Pause, BadgeCheck } from "lucide-react";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { CommentsSection } from "@/components/music/CommentsSection";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pushToast = useToast();
  const { currentSong, isPlaying, playQueue, togglePlay } = usePlayer();
  const [song, setSong] = useState<PlayableSong | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/songs/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSong(data.song);
      } catch {
        pushToast("error", "Impossible de charger ce son.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, pushToast]);

  if (loading) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  if (!song) {
    return <p className="px-6 py-10 text-sm text-ink-muted">Ce son est introuvable.</p>;
  }

  const isCurrent = currentSong?._id === song._id;

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <div className="flex items-center gap-5 mb-10">
        <Image src={song.coverUrl} alt={song.title} width={120} height={120} className="rounded-xl2 object-cover shadow-lg" />
        <div>
          <h1 className="text-xl font-display mb-1">{song.title}</h1>
          <p className="flex items-center gap-1 text-sm text-ink-muted mb-4">
            {song.artist.stageName}
            {song.artist.verified && <BadgeCheck size={14} className="text-verified" />}
          </p>
          <button
            onClick={() => (isCurrent ? togglePlay() : playQueue([song], 0))}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-base hover:bg-accent-hover"
          >
            {isCurrent && isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {isCurrent && isPlaying ? "Pause" : "Écouter"}
          </button>
        </div>
      </div>

      <CommentsSection songId={song._id} />
    </div>
  );
}
