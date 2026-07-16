"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListPlus,
  ListMusic,
  Heart,
  DownloadCloud,
  Info,
  Mic2,
  Disc3,
  Share2,
  Trash2,
  Pencil,
  MessageCircle,
} from "lucide-react";
import { usePlayer, type PlayableSong } from "@/context/PlayerProvider";
import { useToast } from "@/context/ToastProvider";
import { AddToPlaylistModal } from "@/components/modals/AddToPlaylistModal";
import { CreditsModal } from "@/components/modals/CreditsModal";
import { downloadSongForOffline, isSongOffline, removeOfflineSong } from "@/lib/offlineCache";

type Position = { x: number; y: number };

export function SongContextMenu({
  song,
  position,
  canManage,
  hideOffline,
  onClose,
  onDeleted,
}: {
  song: PlayableSong;
  position: Position;
  canManage?: boolean;
  /** Masque l'entrée "Écouter hors-ligne" quand un bouton dédié l'affiche déjà ailleurs (ex. mini-player). */
  hideOffline?: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const pushToast = useToast();
  const { enqueue } = usePlayer();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [liked, setLiked] = useState(false);
  const [offline, setOffline] = useState(false);

  // Tant qu'une sous-modale (playlist / crédits) est ouverte, le petit
  // panneau de menu n'est pas rendu — menuRef.current devient donc
  // null, ce qui désactive automatiquement la détection de clic
  // extérieur ci-dessous. Sans ça, tout clic dans la sous-modale était
  // interprété comme un clic "en dehors" et fermait tout instantanément.
  const showSubModal = showAddToPlaylist || showCredits;

  useEffect(() => {
    setOffline(isSongOffline(song._id));
  }, [song._id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [onClose]);

  // Le menu reste dans le viewport même s'il est ouvert près d'un bord.
  const clampedStyle = {
    top: Math.min(position.y, window.innerHeight - 340),
    left: Math.min(position.x, window.innerWidth - 240),
  };

  async function handleLike() {
    try {
      const res = await fetch(`/api/songs/${song._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      pushToast("success", data.liked ? "Ajouté à tes favoris." : "Retiré de tes favoris.");
    } catch {
      pushToast("error", "Connecte-toi pour aimer un son.");
    }
    onClose();
  }

  async function handleToggleOffline() {
    try {
      if (offline) {
        await removeOfflineSong(song._id);
        pushToast("success", "Retiré du mode hors-ligne.");
      } else {
        await downloadSongForOffline({
          _id: song._id,
          title: song.title,
          coverUrl: song.coverUrl,
          audioUrl: song.audioUrl,
          duration: song.duration,
          artist: song.artist,
        });
        pushToast("success", "Disponible hors-ligne.");
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Échec du mode hors-ligne.");
    }
    onClose();
  }

  async function handleShare() {
    const url = `${window.location.origin}/son/${song._id}`;
    if (navigator.share) {
      await navigator.share({ title: song.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      pushToast("success", "Lien copié dans le presse-papiers.");
    }
    onClose();
  }

  async function handleDelete() {
    const res = await fetch(`/api/songs/${song._id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Son supprimé.");
    onDeleted?.();
    onClose();
  }

  const albumId = typeof song.album === "object" ? song.album?._id : song.album;

  return (
    <>
      {!showSubModal && (
        <div
          ref={menuRef}
          style={clampedStyle}
          className="fixed z-50 w-56 rounded-xl2 border border-border bg-surface py-1.5 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <MenuItem icon={ListPlus} label="Ajouter à la file d'attente" onClick={() => { enqueue(song); onClose(); }} />
          <MenuItem icon={ListMusic} label="Ajouter à une playlist" onClick={() => setShowAddToPlaylist(true)} />
          <MenuItem icon={Heart} label={liked ? "Ne plus aimer" : "J'aime"} onClick={handleLike} />
          {!hideOffline && (
            <MenuItem
              icon={DownloadCloud}
              label={offline ? "Retirer du hors-ligne" : "Écouter hors-ligne"}
              onClick={handleToggleOffline}
            />
          )}
          <MenuItem icon={Share2} label="Partager" onClick={handleShare} />

          <div className="my-1.5 h-px bg-border" />

          <MenuItem
            icon={MessageCircle}
            label="Voir le son et les commentaires"
            onClick={() => { router.push(`/son/${song._id}`); onClose(); }}
          />
          <MenuItem icon={Info} label="Voir les crédits" onClick={() => setShowCredits(true)} />
          <MenuItem
            icon={Mic2}
            label="Aller à l'artiste"
            onClick={() => { router.push(`/artiste/${song.artist._id}`); onClose(); }}
          />
          {albumId && (
            <MenuItem
              icon={Disc3}
              label="Aller à l'album"
              onClick={() => { router.push(`/album/${albumId}`); onClose(); }}
            />
          )}

          {canManage && (
            <>
              <div className="my-1.5 h-px bg-border" />
              <MenuItem
                icon={Pencil}
                label="Modifier"
                onClick={() => { router.push(`/son/${song._id}/modifier`); onClose(); }}
              />
              <MenuItem icon={Trash2} label="Supprimer" danger onClick={handleDelete} />
            </>
          )}
        </div>
      )}

      {showAddToPlaylist && (
        <AddToPlaylistModal songId={song._id} onClose={() => { setShowAddToPlaylist(false); onClose(); }} />
      )}
      {showCredits && (
        <CreditsModal song={song} onClose={() => { setShowCredits(false); onClose(); }} />
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof ListPlus;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-base ${
        danger ? "text-accent" : ""
      }`}
    >
      <Icon size={15} className={danger ? "text-accent" : "text-ink-muted"} />
      {label}
    </button>
  );
}