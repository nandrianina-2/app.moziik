"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  Home,
  Search,
  Library,
  Radio,
  Trophy,
  CalendarDays,
  CreditCard,
  User,
  Mic2,
  Wallet,
  Shield,
  Mail,
  FileText,
  LogOut,
} from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const siteConfig = useSiteConfig();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  const artistLinks =
    session?.user?.role === "artist"
      ? [
          { href: "/artiste/gestion", label: "Mon espace artiste", icon: Mic2 },
          { href: "/artiste/revenus", label: "Mes revenus", icon: Wallet },
        ]
      : [];

  const adminLinks =
    session?.user?.role === "admin" ? [{ href: "/admin", label: "Administration", icon: Shield }] : [];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-surface border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-display text-lg">{siteConfig.siteName}</span>
          <button onClick={onClose} aria-label="Fermer le menu" className="text-ink-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-base hover:text-ink"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {(artistLinks.length > 0 || adminLinks.length > 0) && (
            <div className="my-2 h-px bg-border" />
          )}

          {artistLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-base hover:text-ink"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-base hover:text-ink"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="my-2 h-px bg-border" />

          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-base hover:text-ink"
          >
            <Mail size={18} />
            Contact
          </Link>
          <Link
            href="/mentions-legales"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-base hover:text-ink"
          >
            <FileText size={18} />
            Mentions légales
          </Link>
        </nav>

        {session?.user && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-6 py-4 border-t border-border text-sm text-accent"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        )}
      </div>
    </div>
  );
}
