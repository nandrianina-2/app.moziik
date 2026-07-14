"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SongRow } from "@/components/music/SongRow";
import { UploadModal } from "@/components/modals/UploadModal";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export default function HomePage() {
  const { data: session } = useSession();
  const pushToast = useToast();
  const siteConfig = useSiteConfig();
  const [songs, setSongs] = useState<PlayableSong[]>([]);
  const [recommended, setRecommended] = useState<PlayableSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  async function loadRecommendations() {
    try {
      const res = await fetch("/api/recommendations");
      if (!res.ok) return;
      const data = await res.json();
      setRecommended(data.songs);
    } catch {
      // Silencieux : les recommandations sont un bonus, pas une donnée critique.
    }
  }

  async function loadSongs() {
    setLoading(true);
    try {
      const res = await fetch("/api/songs?limit=20");
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
    loadSongs();
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canPublish = session?.user?.role === "artist" || session?.user?.role === "admin";

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display">
            Bon retour sur {siteConfig.siteName}
          </h1>
          <p className="text-ink-muted text-sm mt-1">{siteConfig.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          {canPublish && (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-base hover:bg-accent-hover"
            >
              <Plus size={16} /> Publier
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      <section>
        <h3 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Dernières sorties</h3>

        {loading && (
          <div className="py-10 grid place-items-center">
            <EqualizerLoader />
          </div>
        )}

        {!loading && songs.length === 0 && (
          <p className="text-sm text-ink-muted">
            Aucun son publié pour l&apos;instant. Reviens bientôt !
          </p>
        )}

        <div className="space-y-1 max-w-xl">
          {songs.map((song, index) => (
            <SongRow key={song._id} song={song} queue={songs} index={index} onDeleted={loadSongs} />
          ))}
        </div>
      </section>

      {recommended.length > 0 && (
        <section className="mt-10">
          <h3 className="text-sm uppercase tracking-wide text-ink-muted mb-4">Recommandé pour toi</h3>
          <div className="space-y-1 max-w-xl">
            {recommended.map((song, index) => (
              <SongRow key={song._id} song={song} queue={recommended} index={index} />
            ))}
          </div>
        </section>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={loadSongs} />}
    </div>
  );
}
