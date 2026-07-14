"use client";

import { useEffect, useState } from "react";
import { Check, X, MapPin, CalendarDays } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type AdminEvent = {
  _id: string;
  title: string;
  location: string;
  date: string;
  artist?: { stageName: string };
};

export default function AdminEventsModerationPage() {
  const pushToast = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events?status=pending");
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
  }, []);

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
    setEvents((prev) => prev.filter((e) => e._id !== id));
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
      {events.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun évènement en attente de validation.</p>
      )}

      {events.map((event) => (
        <div
          key={event._id}
          className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{event.title}</p>
            <p className="flex items-center gap-3 text-xs text-ink-muted mt-1">
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {event.location}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> {new Date(event.date).toLocaleDateString("fr-FR")}
              </span>
            </p>
            {event.artist && (
              <p className="text-xs text-ink-muted mt-0.5">Par {event.artist.stageName}</p>
            )}
          </div>
          <button
            onClick={() => moderate(event._id, "approve")}
            aria-label="Approuver"
            className="grid h-9 w-9 place-items-center rounded-full border border-verified text-verified hover:bg-verified/10"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => moderate(event._id, "reject")}
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
