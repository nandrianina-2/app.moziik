"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Smile, Meh, Frown, Send, Clock } from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { useOnlineStatus } from "@/context/OnlineStatusProvider";
import { enqueueSyncAction } from "@/lib/syncQueue";

type SongComment = {
  _id: string;
  text: string;
  sentiment?: "positive" | "neutral" | "negative";
  createdAt: string;
  user: { name: string; avatarUrl?: string };
  pending?: boolean; // écrit hors-ligne, pas encore synchronisé
};

const sentimentIcon = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

const sentimentColor = {
  positive: "text-verified",
  neutral: "text-ink-muted",
  negative: "text-accent",
};

export function CommentsSection({ songId }: { songId: string }) {
  const { status, data: session } = useSession();
  const pushToast = useToast();
  const { isOnline } = useOnlineStatus();
  const [comments, setComments] = useState<SongComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/songs/${songId}/comments`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data.comments);
    } catch {
      pushToast("error", "Impossible de charger les commentaires.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    if (!isOnline) {
      setComments((prev) => [
        {
          _id: `local-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
          user: { name: session?.user?.name ?? "Toi" },
          pending: true,
        },
        ...prev,
      ]);
      await enqueueSyncAction({ type: "add_comment", songId, text });
      setText("");
      pushToast("info", "Commentaire enregistré, sera publié à la reconnexion.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/songs/${songId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch {
      pushToast("error", "Le commentaire n'a pas pu être envoyé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="text-sm uppercase tracking-wide text-ink-muted mb-4">
        Commentaires {comments.length > 0 && `(${comments.length})`}
      </h3>

      {status === "authenticated" && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dis ce que tu penses de ce son..."
            className="flex-1 rounded-xl border border-border bg-base px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={submitting}
            aria-label="Envoyer"
            className="grid h-10 w-10 place-items-center rounded-full bg-accent text-base hover:bg-accent-hover disabled:opacity-60"
          >
            <Send size={16} />
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-ink-muted">Chargement...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-sm text-ink-muted">Sois le premier à commenter.</p>
      )}

      <ul className="space-y-3">
        {comments.map((comment) => {
          const Icon = comment.sentiment ? sentimentIcon[comment.sentiment] : Meh;
          return (
            <li key={comment._id} className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-xs font-medium">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{comment.user.name}</span>{" "}
                  <span className="text-ink-muted">{comment.text}</span>
                </p>
                {comment.pending && (
                  <p className="flex items-center gap-1 text-[11px] text-ink-muted mt-0.5">
                    <Clock size={10} /> En attente de connexion
                  </p>
                )}
              </div>
              {comment.sentiment && (
                <Icon size={14} className={`shrink-0 mt-1 ${sentimentColor[comment.sentiment]}`} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
