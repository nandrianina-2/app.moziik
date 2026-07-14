"use client";

import { useEffect, useState } from "react";
import { Users, Mic2, Music, Clock, CalendarClock, CreditCard } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type Stats = {
  members: number;
  artists: number;
  publishedSongs: number;
  pendingSongs: number;
  pendingEvents: number;
  activeSubscriptions: number;
};

export default function AdminDashboardPage() {
  const pushToast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error();
        setStats(await res.json());
      } catch {
        pushToast("error", "Impossible de charger les statistiques.");
      }
    }
    load();
  }, [pushToast]);

  if (!stats) {
    return (
      <div className="py-10 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Membres" value={stats.members} icon={Users} />
      <StatCard label="Artistes" value={stats.artists} icon={Mic2} />
      <StatCard label="Sons publiés" value={stats.publishedSongs} icon={Music} />
      <StatCard label="Sons en attente / planifiés" value={stats.pendingSongs} icon={Clock} />
      <StatCard label="Évènements à valider" value={stats.pendingEvents} icon={CalendarClock} />
      <StatCard label="Abonnements actifs" value={stats.activeSubscriptions} icon={CreditCard} />
    </div>
  );
}
