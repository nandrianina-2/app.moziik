"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, Globe, Lock, ListMusic } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminPlaylist = {
  _id: string;
  title: string;
  isPublic: boolean;
  songs: string[];
  owner: { name: string; email: string };
};

export default function AdminPlaylistsPage() {
  const pushToast = useToast();
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/playlists${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlaylists(data.playlists);
    } catch {
      pushToast("error", "Impossible de charger les playlists.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function deletePlaylist(id: string) {
    const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Playlist supprimée.");
    setPlaylists((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div>
      <label className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 mb-6 max-w-sm">
        <Search size={16} className="text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une playlist..."
          className="bg-transparent text-sm outline-none flex-1"
        />
      </label>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      <div className="space-y-2">
        {!loading && playlists.length === 0 && (
          <p className="text-sm text-ink-muted">Aucune playlist ne correspond.</p>
        )}

        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-base">
              <ListMusic size={18} className="text-ink-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium truncate">
                {playlist.title}
                {playlist.isPublic ? (
                  <Globe size={11} className="text-verified shrink-0" />
                ) : (
                  <Lock size={11} className="text-ink-muted shrink-0" />
                )}
              </p>
              <p className="text-xs text-ink-muted truncate">
                {playlist.owner?.name ?? "Utilisateur supprimé"} · {playlist.songs.length} son(s)
              </p>
            </div>
            <Link
              href={`/playlist/${playlist._id}`}
              aria-label="Voir"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent shrink-0"
            >
              <ListMusic size={15} />
            </Link>
            <button
              onClick={() => deletePlaylist(playlist._id)}
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
