"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MapPin, CalendarDays, Ticket, Plus, BadgeCheck, Pencil, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { CreateEventModal } from "@/components/modals/CreateEventModal";
import { useToast } from "@/context/ToastProvider";

type EventItem = {
  _id: string;
  title: string;
  description: string;
  coverUrl?: string;
  location: string;
  date: string;
  ticketUrl?: string;
  price?: number;
  createdBy: string;
  artist?: { stageName: string; verified?: boolean };
};

export default function EventsPage() {
  const { data: session } = useSession();
  const pushToast = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  async function deleteEvent(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("error", "La suppression a échoué.");
      return;
    }
    pushToast("success", "Évènement supprimé.");
    setEvents((prev) => prev.filter((e) => e._id !== id));
  }

  async function load() {
    try {
      const res = await fetch("/api/events");
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

  useEffect(() => {
    async function checkPermission() {
      if (session?.user?.role === "admin") {
        setCanCreate(true);
        return;
      }
      if (session?.user?.role === "artist") {
        const res = await fetch("/api/artist/me");
        if (res.ok) {
          const data = await res.json();
          setCanCreate(!!data.artist?.eventPublishingAuthorized);
        }
      }
    }
    checkPermission();
  }, [session]);

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display">Évènements</h1>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-base hover:bg-accent-hover"
          >
            <Plus size={16} /> Créer
          </button>
        )}
      </header>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && events.length === 0 && (
        <p className="text-sm text-ink-muted">Aucun évènement à venir pour l&apos;instant.</p>
      )}

      <div className="space-y-3">
        {events.map((event) => {
          const canManage = session?.user?.role === "admin" || session?.user?.id === event.createdBy;
          return (
            <div key={event._id} className="flex gap-4 rounded-xl2 border border-border bg-surface p-4">
              <SafeImage src={event.coverUrl} alt={event.title} width={88} height={88} className="rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium truncate">{event.title}</h3>
                {event.artist && (
                  <p className="flex items-center gap-1 text-xs text-ink-muted mt-0.5">
                    {event.artist.stageName}
                    {event.artist.verified && <BadgeCheck size={11} className="text-verified" />}
                  </p>
                )}
                <p className="flex items-center gap-3 text-xs text-ink-muted mt-1.5">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} /> {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {event.location}
                  </span>
                </p>
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                  >
                    <Ticket size={12} /> Billetterie{event.price ? ` — ${event.price} $` : ""}
                  </a>
                )}
              </div>
              {canManage && (
                <div className="flex flex-col gap-1 shrink-0">
                  <Link
                    href={`/evenements/${event._id}/modifier`}
                    aria-label="Modifier"
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-base hover:text-accent"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => deleteEvent(event._id)}
                    aria-label="Supprimer"
                    className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-base hover:text-accent"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
