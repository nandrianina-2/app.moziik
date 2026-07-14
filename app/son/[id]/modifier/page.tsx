"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormField } from "@/components/ui/FormField";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";
import type { PlayableSong } from "@/context/PlayerProvider";

const GENRES = ["Afrobeat", "Salegy", "Hip-hop", "R&B", "Pop", "Zouk", "Reggae", "Autre"];

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const pushToast = useToast();

  const [song, setSong] = useState<PlayableSong | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [lyrics, setLyrics] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [releaseDate, setReleaseDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/songs/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSong(data.song);
        setTitle(data.song.title);
        setGenre(data.song.genre);
        setLyrics(data.song.lyrics ?? "");
        setExplicit(data.song.explicit);
        setReleaseDate(new Date(data.song.releaseDate).toISOString().slice(0, 16));
      } catch {
        pushToast("error", "Impossible de charger ce son.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, pushToast]);

  const canManage =
    session?.user?.role === "admin" ||
    (session?.user?.role === "artist" && song && session.user.id === song.artist._id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, lyrics, explicit, releaseDate: new Date(releaseDate).toISOString() }),
      });
      if (!res.ok) throw new Error();
      pushToast("success", "Son mis à jour.");
      router.push(`/son/${id}`);
    } catch {
      pushToast("error", "La mise à jour a échoué.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  if (!song) {
    return <p className="px-6 py-10 text-sm text-ink-muted">Ce son est introuvable.</p>;
  }

  if (!canManage) {
    return <p className="px-6 py-10 text-sm text-ink-muted">Tu n&apos;as pas accès à cette page.</p>;
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-md">
      <h1 className="text-2xl font-display mb-6">Modifier le son</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Titre" required value={title} onChange={(e) => setTitle(e.target.value)} />

        <label className="block">
          <span className="text-sm text-ink-muted mb-1.5 block">Genre</span>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-xl border border-border bg-base px-4 py-2.5 text-sm outline-none focus:border-accent"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-ink-muted mb-1.5 block">Paroles (optionnel)</span>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-border bg-base px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
          />
        </label>

        <FormField
          label="Date de sortie"
          type="datetime-local"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input type="checkbox" checked={explicit} onChange={(e) => setExplicit(e.target.checked)} />
          Contenu explicite
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-base hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
