"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Pencil, Trash2, MapPin, CalendarDays } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminEvent = {
  _id: string;
  title: string;
  coverUrl?: string;
  location: string;
  date: string;
  status: "pending" | "published" | "rejected";
  artist?: { stageName: string };
};

const statusFilters: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "published", label: "Publiés" },
  { value: "rejected", label: "Rejetés" },
];

const statusLabel: Record<AdminEvent["status"], string> = {
  pending: "En attente",
  published: "Publié",
  rejected: "Rejeté",
};
const statusColor: Record<AdminEvent["status"], string> = {
  pending: "text-ink-muted",
  published: "text-verified",
  rejected: "text-accent",
};

export default function AdminEventsPage() {
  const pushToast = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/events${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(data.events);
    } catch {
      pushToast("error", "Impossible de charger les évènements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function moderate(id: string, decision: "approve" | "reject") {
    const res = await fetch(`/api/admin/events/${id}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) {
      pushToast("error", "L'action a échoué.");
      return;
    }
    pushToast("success", decision === "approve" ? "Évènement publié." : "Évènement rejeté.");
    load();
  }

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Évènement supprimé.");
    setEvents((prev) => prev.filter((e) => e._id !== id));
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
        {!loading && events.length === 0 && (
          <p className="text-sm text-ink-muted">Aucun évènement pour ce filtre.</p>
        )}

        {events.map((event) => (
          <div
            key={event._id}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
          >
            <SafeImage src={event.coverUrl} alt={event.title} width={44} height={44} className="rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{event.title}</p>
              <p className="flex items-center gap-3 text-xs text-ink-muted mt-0.5">
                <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
                <span className="flex items-center gap-1"><CalendarDays size={11} /> {new Date(event.date).toLocaleDateString("fr-FR")}</span>
              </p>
              {event.artist && <p className="text-xs text-ink-muted">Par {event.artist.stageName}</p>}
              <p className={`text-[11px] mt-0.5 ${statusColor[event.status]}`}>{statusLabel[event.status]}</p>
            </div>

            {event.status === "pending" && (
              <>
                <button
                  onClick={() => moderate(event._id, "approve")}
                  aria-label="Approuver"
                  className="grid h-9 w-9 place-items-center rounded-full border border-verified text-verified hover:bg-verified/10 shrink-0"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => moderate(event._id, "reject")}
                  aria-label="Rejeter"
                  className="grid h-9 w-9 place-items-center rounded-full border border-accent text-accent hover:bg-accent/10 shrink-0"
                >
                  <X size={16} />
                </button>
              </>
            )}

            <Link
              href={`/evenements/${event._id}/modifier`}
              aria-label="Modifier"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent shrink-0"
            >
              <Pencil size={15} />
            </Link>
            <button
              onClick={() => deleteEvent(event._id)}
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
