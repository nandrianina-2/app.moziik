"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, BadgeCheck, Disc3 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminAlbum = {
  _id: string;
  title: string;
  coverUrl: string;
  type: string;
  songs: string[];
  releaseDate: string;
  artist: { stageName: string; verified?: boolean };
};

export default function AdminAlbumsPage() {
  const pushToast = useToast();
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/albums");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAlbums(data.albums);
    } catch {
      pushToast("error", "Impossible de charger les albums.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteAlbum(id: string) {
    const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Album supprimé.");
    setAlbums((prev) => prev.filter((a) => a._id !== id));
  }

  const filtered = albums.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.artist.stageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 mb-6 max-w-sm">
        <Search size={16} className="text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un album ou un artiste..."
          className="bg-transparent text-sm outline-none flex-1"
        />
      </label>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      <div className="space-y-2">
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-ink-muted">Aucun album ne correspond.</p>
        )}

        {filtered.map((album) => (
          <div
            key={album._id}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
          >
            <SafeImage src={album.coverUrl} alt={album.title} width={44} height={44} className="rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{album.title}</p>
              <p className="flex items-center gap-1 text-xs text-ink-muted truncate">
                {album.artist.stageName}
                {album.artist.verified && <BadgeCheck size={11} className="text-verified shrink-0" />}
                {" · "}{album.type} · {album.songs.length} son(s)
              </p>
            </div>
            <Link
              href={`/album/${album._id}`}
              aria-label="Voir"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent shrink-0"
            >
              <Disc3 size={15} />
            </Link>
            <button
              onClick={() => deleteAlbum(album._id)}
              aria-label="Supprimer"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
