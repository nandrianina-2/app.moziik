"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminSong = {
  _id: string;
  title: string;
  coverUrl: string;
  genre: string;
  status: string;
  releaseDate: string;
  artist: { stageName: string };
};

export default function AdminSongsModerationPage() {
  const pushToast = useToast();
  const [songs, setSongs] = useState<AdminSong[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/songs?status=draft");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSongs(data.songs);
    } catch {
      pushToast("error", "Impossible de charger les sons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function moderate(id: string, decision: "approve" | "reject") {
    const res = await fetch(`/api/admin/songs/${id}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) {
      pushToast("error", "L'action a échoué.");
      return;
    }
    pushToast("success", decision === "approve" ? "Son approuvé." : "Son rejeté.");
    setSongs((prev) => prev.filter((s) => s._id !== id));
  }

  if (loading) {
    return (
      <div className="py-10 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun son en attente de modération.</p>
      )}

      {songs.map((song) => (
        <div
          key={song._id}
          className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
        >
          <Image src={song.coverUrl} alt={song.title} width={44} height={44} className="rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{song.title}</p>
            <p className="text-xs text-ink-muted truncate">
              {song.artist.stageName} · {song.genre}
            </p>
          </div>
          <button
            onClick={() => moderate(song._id, "approve")}
            aria-label="Approuver"
            className="grid h-9 w-9 place-items-center rounded-full border border-verified text-verified hover:bg-verified/10"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => moderate(song._id, "reject")}
            aria-label="Rejeter"
            className="grid h-9 w-9 place-items-center rounded-full border border-accent text-accent hover:bg-accent/10"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
