import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl2 border border-border bg-surface p-5">
      <Icon size={18} className="text-accent mb-3" />
      <p className="text-2xl font-display">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}
