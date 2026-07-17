"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, Search, Library, Radio, CalendarDays, User, CreditCard, Trophy } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigProvider";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/classements", label: "Classements", icon: Trophy },
  { href: "/evenements", label: "Évènements", icon: CalendarDays },
  { href: "/abonnement", label: "Premium", icon: CreditCard },
  { href: "/compte", label: "Compte", icon: User },
];

export function Sidebar() {
  const siteConfig = useSiteConfig();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border h-screen sticky top-0 px-4 py-6">
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-2">
          {siteConfig.logoUrl ? (
            <Image src={siteConfig.logoUrl} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" priority />
          ) : (
            <EqualizerLoader size="sm" />
          )}
          <span className="font-display text-lg tracking-tight">
            {siteConfig.siteName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>
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

      <div className="mt-auto pt-6 px-3 flex flex-col gap-1 text-xs text-ink-muted">
        <div className="flex gap-3">
          <Link href="/contact" className="hover:text-ink">Contact</Link>
          <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
        </div>
        <p>© {new Date().getFullYear()} {siteConfig.siteName}</p>
      </div>
    </aside>
  );
}
