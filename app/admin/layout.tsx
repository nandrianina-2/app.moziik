import Link from "next/link";
import { LayoutDashboard, Users, Music, Disc3, ListMusic, MessageCircle, CalendarDays, Settings, Award } from "lucide-react";

const links = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/membres", label: "Membres & artistes", icon: Users },
  { href: "/admin/musiques", label: "Musiques", icon: Music },
  { href: "/admin/albums", label: "Albums", icon: Disc3 },
  { href: "/admin/playlists", label: "Playlists", icon: ListMusic },
  { href: "/admin/commentaires", label: "Commentaires", icon: MessageCircle },
  { href: "/admin/evenements", label: "Évènements", icon: CalendarDays },
  { href: "/admin/badges", label: "Badges", icon: Award },
  { href: "/admin/parametres", label: "Paramètres du site", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-display mb-6">Administration</h1>

      <nav className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent hover:text-ink"
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
