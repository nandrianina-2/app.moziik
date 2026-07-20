"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, X, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminSong = {
  _id: string;
  title: string;
  coverUrl: string;
  genre: string;
  status: "draft" | "scheduled" | "published" | "rejected";
  releaseDate: string;
  artist: { stageName: string; verified?: boolean };
};

const statusFilters: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "draft", label: "En attente" },
  { value: "published", label: "Publiés" },
  { value: "scheduled", label: "Planifiés" },
  { value: "rejected", label: "Rejetés" },
];

const statusLabel: Record<AdminSong["status"], string> = {
  draft: "En attente",
  scheduled: "Planifié",
  published: "Publié",
  rejected: "Rejeté",
};

const statusColor: Record<AdminSong["status"], string> = {
  draft: "text-ink-muted",
  scheduled: "text-accent",
  published: "text-verified",
  rejected: "text-accent",
};

export default function AdminSongsPage() {
  const pushToast = useToast();
  const [songs, setSongs] = useState<AdminSong[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/songs${params}`);
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
  }, [statusFilter]);

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
    load();
  }

  async function deleteSong(id: string) {
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Son supprimé.");
    setSongs((prev) => prev.filter((s) => s._id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? "bg-accent text-base border-accent"
                : "border-border text-ink-muted hover:border-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      <div className="space-y-2">
        {!loading && songs.length === 0 && (
          <p className="text-sm text-ink-muted">Aucun son pour ce filtre.</p>
        )}

        {songs.map((song) => (
          <div
            key={song._id}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
          >
            {song.coverUrl ? (
              <Image src={song.coverUrl} alt={song.title} width={44} height={44} className="rounded-lg object-cover shrink-0" />
            ) : (
              <div className="h-11 w-11 rounded-lg bg-base shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{song.title}</p>
              <p className="flex items-center gap-1 text-xs text-ink-muted truncate">
                {song.artist?.stageName ?? "Artiste inconnu"}
                {song.artist?.verified && <BadgeCheck size={11} className="text-verified shrink-0" />}
                {" · "}{song.genre}
              </p>
              <p className={`text-[11px] mt-0.5 ${statusColor[song.status]}`}>{statusLabel[song.status]}</p>
            </div>

            {song.status === "draft" && (
              <>
                <button
                  onClick={() => moderate(song._id, "approve")}
                  aria-label="Approuver"
                  className="grid h-9 w-9 place-items-center rounded-full border border-verified text-verified hover:bg-verified/10 shrink-0"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => moderate(song._id, "reject")}
                  aria-label="Rejeter"
                  className="grid h-9 w-9 place-items-center rounded-full border border-accent text-accent hover:bg-accent/10 shrink-0"
                >
                  <X size={16} />
                </button>
              </>
            )}

            <Link
              href={`/son/${song._id}/modifier`}
              aria-label="Modifier"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent shrink-0"
            >
              <Pencil size={15} />
            </Link>
            <button
              onClick={() => deleteSong(song._id)}
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
