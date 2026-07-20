"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { useSession } from "next-auth/react";
import { Music, Disc3, Users2, Plus, Pencil, Trash2, Check, X, BadgeCheck } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { UploadModal } from "@/components/modals/UploadModal";
import { CreateAlbumModal } from "@/components/modals/CreateAlbumModal";
import { useToast } from "@/context/ToastProvider";

type OwnSong = {
  _id: string;
  title: string;
  coverUrl: string;
  status: "draft" | "scheduled" | "published" | "rejected";
};

type OwnAlbum = { _id: string; title: string; coverUrl: string; type: string; songs: string[] };

type FeaturingSong = {
  _id: string;
  title: string;
  coverUrl: string;
  confirmed: boolean;
  artist: { stageName: string; verified?: boolean };
};

const statusLabel: Record<OwnSong["status"], string> = {
  draft: "En attente",
  scheduled: "Planifié",
  published: "Publié",
  rejected: "Rejeté",
};
const statusColor: Record<OwnSong["status"], string> = {
  draft: "text-ink-muted",
  scheduled: "text-accent",
  published: "text-verified",
  rejected: "text-accent",
};

export default function ArtistManagementPage() {
  const { status } = useSession();
  const pushToast = useToast();
  const [tab, setTab] = useState<"songs" | "albums" | "featurings">("songs");
  const [songs, setSongs] = useState<OwnSong[]>([]);
  const [albums, setAlbums] = useState<OwnAlbum[]>([]);
  const [featurings, setFeaturings] = useState<FeaturingSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  async function loadSongs() {
    const res = await fetch("/api/artist/me/songs");
    if (res.ok) setSongs((await res.json()).songs);
  }
  async function loadAlbums() {
    const res = await fetch("/api/artist/me");
    if (res.ok) {
      const { artist } = await res.json();
      if (artist) {
        const albumsRes = await fetch(`/api/albums?artist=${artist._id}`);
        if (albumsRes.ok) setAlbums((await albumsRes.json()).albums);
      }
    }
  }
  async function loadFeaturings() {
    const res = await fetch("/api/artist/me/featurings");
    if (res.ok) setFeaturings((await res.json()).songs);
  }

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    Promise.all([loadSongs(), loadAlbums(), loadFeaturings()]).finally(() => setLoading(false));
  }, [status]);

  async function deleteSong(id: string) {
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Son supprimé.");
    setSongs((prev) => prev.filter((s) => s._id !== id));
  }

  async function respondFeaturing(id: string, decision: "confirm" | "remove") {
    const res = await fetch(`/api/songs/${id}/featuring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) {
      pushToast("error", "L'action a échoué.");
      return;
    }
    pushToast("success", decision === "confirm" ? "Featuring confirmé." : "Featuring retiré.");
    loadFeaturings();
  }

  if (status !== "authenticated") {
    return (
      <div className="px-6 py-8 md:px-10 md:py-10">
        <p className="text-sm text-ink-muted">Connecte-toi avec ton compte artiste pour accéder à cet espace.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
      <h1 className="text-2xl font-display mb-6">Mon espace artiste</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setTab("songs")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "songs" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <Music size={14} /> Mes sons
        </button>
        <button
          onClick={() => setTab("albums")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "albums" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <Disc3 size={14} /> Mes albums
        </button>
        <button
          onClick={() => setTab("featurings")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            tab === "featurings" ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <Users2 size={14} /> Featurings
        </button>
      </div>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && tab === "songs" && (
        <div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-base hover:bg-accent-hover mb-4"
          >
            <Plus size={16} /> Publier un son
          </button>

          <div className="space-y-2">
            {songs.length === 0 && <p className="text-sm text-ink-muted">Tu n&apos;as encore publié aucun son.</p>}
            {songs.map((song) => (
              <div key={song._id} className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3">
                <SafeImage src={song.coverUrl} alt={song.title} width={40} height={40} className="rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{song.title}</p>
                  <p className={`text-[11px] ${statusColor[song.status]}`}>{statusLabel[song.status]}</p>
                </div>
                <Link href={`/son/${song._id}/modifier`} aria-label="Modifier" className="text-ink-muted hover:text-accent p-1.5 shrink-0">
                  <Pencil size={15} />
                </Link>
                <button onClick={() => deleteSong(song._id)} aria-label="Supprimer" className="text-ink-muted hover:text-accent p-1.5 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === "albums" && (
        <div>
          <button
            onClick={() => setShowCreateAlbum(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-base hover:bg-accent-hover mb-4"
          >
            <Plus size={16} /> Nouvel album
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albums.length === 0 && <p className="text-sm text-ink-muted col-span-full">Pas encore d&apos;album.</p>}
            {albums.map((album) => (
              <Link key={album._id} href={`/album/${album._id}`}>
                <SafeImage src={album.coverUrl} alt={album.title} width={140} height={140} className="rounded-xl2 object-cover w-full aspect-square mb-2" />
                <p className="text-sm truncate">{album.title}</p>
                <p className="text-xs text-ink-muted">{album.songs.length} son(s)</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === "featurings" && (
        <div className="space-y-2">
          {featurings.length === 0 && (
            <p className="text-sm text-ink-muted">Aucun featuring pour l&apos;instant.</p>
          )}
          {featurings.map((song) => (
            <div key={song._id} className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3">
              <SafeImage src={song.coverUrl} alt={song.title} width={40} height={40} className="rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{song.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-muted truncate">
                  {song.artist.stageName}
                  {song.artist.verified && <BadgeCheck size={11} className="text-verified shrink-0" />}
                  {" · "}{song.confirmed ? "Confirmé" : "En attente de ta confirmation"}
                </p>
              </div>
              {!song.confirmed && (
                <button
                  onClick={() => respondFeaturing(song._id, "confirm")}
                  aria-label="Confirmer"
                  className="grid h-9 w-9 place-items-center rounded-full border border-verified text-verified hover:bg-verified/10 shrink-0"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                onClick={() => respondFeaturing(song._id, "remove")}
                aria-label="Retirer ce crédit"
                className="grid h-9 w-9 place-items-center rounded-full border border-accent text-accent hover:bg-accent/10 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={loadSongs} />}
      {showCreateAlbum && <CreateAlbumModal onClose={() => setShowCreateAlbum(false)} onCreated={loadAlbums} />}
    </div>
  );
}
