"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Trophy } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { useToast } from "@/context/ToastProvider";

type Period = "day" | "week" | "month" | "year";
type ChartType = "songs" | "artists" | "listeners";

const periods: { value: Period; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "year", label: "Année" },
];

const types: { value: ChartType; label: string }[] = [
  { value: "songs", label: "Sons" },
  { value: "artists", label: "Artistes" },
  { value: "listeners", label: "Auditeurs" },
];

type RankingItem = {
  _id: string;
  plays: number;
  title?: string;
  stageName?: string;
  name?: string;
  coverUrl?: string;
  avatarUrl?: string;
  artistName?: string;
  verified?: boolean;
};

const medalColor = ["text-[#F5C542]", "text-[#C7C7C7]", "text-[#C08A50]"];

export default function ChartsPage() {
  const pushToast = useToast();
  const [period, setPeriod] = useState<Period>("week");
  const [type, setType] = useState<ChartType>("songs");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/charts?period=${period}&type=${type}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRanking(data.ranking);
      } catch {
        pushToast("error", "Impossible de charger le classement.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period, type, pushToast]);

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
      <h1 className="text-2xl font-display mb-6">Classements</h1>

      <div className="flex flex-wrap gap-2 mb-3">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              type === t.value ? "bg-accent text-base border-accent" : "border-border text-ink-muted hover:border-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              period === p.value ? "border-verified text-verified" : "border-border text-ink-muted hover:border-accent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-10 grid place-items-center">
          <EqualizerLoader />
        </div>
      )}

      {!loading && ranking.length === 0 && (
        <p className="text-sm text-ink-muted">Pas encore assez d&apos;écoutes sur cette période.</p>
      )}

      <ol className="space-y-1">
        {ranking.map((item, index) => (
          <li
            key={item._id}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3"
          >
            <span className="w-6 text-center text-sm font-display text-ink-muted flex items-center justify-center">
              {index < 3 ? <Trophy size={16} className={medalColor[index]} /> : index + 1}
            </span>

            {(item.coverUrl || item.avatarUrl) && (
              <Image
                src={item.coverUrl ?? item.avatarUrl ?? ""}
                alt=""
                width={36}
                height={36}
                className="rounded-lg object-cover"
              />
            )}

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm truncate">
                {item.title ?? item.stageName ?? item.name}
                {item.verified && <BadgeCheck size={12} className="text-verified shrink-0" />}
              </span>
              {item.artistName && (
                <span className="block text-xs text-ink-muted truncate">{item.artistName}</span>
              )}
            </span>

            <span className="text-xs text-ink-muted shrink-0">{item.plays} écoutes</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
