"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { usePlayer } from "@/context/PlayerProvider";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";

export function QueuePanel() {
  const { queue, currentSong, isPlaying, playQueue } = usePlayer();

  if (queue.length === 0) {
    return <p className="text-sm text-ink-muted">La file d&apos;attente est vide.</p>;
  }

  return (
    <ul className="space-y-1">
      {queue.map((song, index) => {
        const isCurrent = song._id === currentSong?._id;
        return (
          <li key={song._id}>
            <button
              onClick={() => playQueue(queue, index)}
              className={`w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface ${
                isCurrent ? "bg-surface" : ""
              }`}
            >
              <SafeImage src={song.coverUrl} alt={song.title} width={36} height={36} className="rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm truncate ${isCurrent ? "text-accent" : ""}`}>{song.title}</span>
                <span className="block text-xs text-ink-muted truncate">{song.artist.stageName}</span>
              </span>
              {isCurrent && isPlaying && <EqualizerLoader size="sm" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
