"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastProvider";
import { notificationIcons } from "@/lib/notificationMeta";
import type { INotification } from "@/models/Notification";

type NotificationItem = INotification & { _id: string };

export function NotificationBell() {
  const { status } = useSession();
  const pushToast = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (status !== "authenticated") return;
    async function load() {
      setLoading(true);
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
  }, [status, pushToast]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status !== "authenticated") return null;

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-accent"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-medium text-base">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl2 border border-border bg-surface shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-accent hover:underline">
                Tout marquer comme lu
              </button>
            )}
          </div>

          {loading && <p className="px-4 py-6 text-sm text-ink-muted">Chargement...</p>}
          {!loading && items.length === 0 && (
            <p className="px-4 py-6 text-sm text-ink-muted">Aucune notification pour l&apos;instant.</p>
          )}

          <ul>
            {items.slice(0, 8).map((n) => {
              const Icon = notificationIcons[n.type];
              return (
                <li key={n._id}>
                  <Link
                    href={n.link ?? "/notifications"}
                    className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-base transition-colors ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
                    <span>
                      <span className="block font-medium">{n.title}</span>
                      <span className="block text-ink-muted text-xs">{n.message}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/notifications"
            className="block px-4 py-3 text-center text-xs text-accent border-t border-border hover:underline"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
