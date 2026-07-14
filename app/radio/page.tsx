"use client";

import { useState } from "react";
import { Radio as RadioIcon, Shuffle } from "lucide-react";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function RadioPage() {
  const pushToast = useToast();
  const { playQueue } = usePlayer();
  const [loading, setLoading] = useState(false);

  async function startRadio() {
    setLoading(true);
    try {
      const res = await fetch("/api/songs?limit=50");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const songs = shuffle<PlayableSong>(data.songs);
      if (songs.length === 0) {
        pushToast("error", "Pas encore assez de sons publiés pour lancer la radio.");
        return;
      }
      playQueue(songs, 0);
      pushToast("success", "Radio lancée — lecture aléatoire en continu.");
    } catch {
      pushToast("error", "Impossible de lancer la radio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-16 md:px-10 flex flex-col items-center text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-surface border border-border mb-6">
        <RadioIcon size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-display mb-2">Radio Moziik</h1>
      <p className="text-sm text-ink-muted max-w-sm mb-8">
        Une sélection aléatoire et continue parmi tous les sons publiés
        sur la plateforme. Parfait pour découvrir de nouveaux artistes.
      </p>

      <button
        onClick={startRadio}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-base hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? <EqualizerLoader size="sm" /> : <Shuffle size={16} />}
        Lancer la radio
      </button>
    </div>
  );
}
