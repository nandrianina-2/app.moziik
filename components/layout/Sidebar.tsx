import Link from "next/link";
import { Home, Search, Library, Radio, CalendarDays, User } from "lucide-react";
import { defaultSiteConfig } from "@/config/site";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { NotificationBell } from "@/components/ui/NotificationBell";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/evenements", label: "Évènements", icon: CalendarDays },
  { href: "/compte", label: "Compte", icon: User },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border h-screen sticky top-0 px-4 py-6">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2">
          <EqualizerLoader size="sm" />
          <span className="font-display text-lg tracking-tight">
            {defaultSiteConfig.siteName}
          </span>
        </div>
        <NotificationBell />
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
