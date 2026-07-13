"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notificationIcons, notificationLabels } from "@/lib/notificationMeta";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";
import type { INotification, NotificationType } from "@/models/Notification";

type NotificationItem = INotification & { _id: string };

const filters: Array<{ value: NotificationType | "all"; label: string }> = [
  { value: "all", label: "Tout" },
  { value: "new_song", label: notificationLabels.new_song },
  { value: "new_follower", label: notificationLabels.new_follower },
  { value: "comment", label: notificationLabels.comment },
  { value: "event", label: notificationLabels.event },
  { value: "payment", label: notificationLabels.payment },
  { value: "system", label: notificationLabels.system },
];

export function NotificationsPageContent() {
  const pushToast = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setItems(data.notifications);
      } catch {
        pushToast("error", "Impossible de charger les notifications.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pushToast]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  }

  const visible = filter === "all" ? items : items.filter((n) => n.type === filter);

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <h1 className="text-2xl font-display mb-6">Notifications</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border ${
              filter === f.value
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

      {!loading && visible.length === 0 && (
        <p className="text-sm text-ink-muted">Rien à afficher pour ce filtre.</p>
      )}

      <ul className="space-y-2">
        {visible.map((n) => {
          const Icon = notificationIcons[n.type];
          return (
            <li key={n._id}>
              <Link
                href={n.link ?? "#"}
                onClick={() => !n.read && markRead(n._id)}
                className={`flex items-start gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5 transition-colors hover:border-accent ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <Icon size={18} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{n.message}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
