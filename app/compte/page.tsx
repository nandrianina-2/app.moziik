"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Wallet, Shield, Mic2, Crown, ChevronRight, Pencil } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { SafeImage } from "@/components/ui/SafeImage";

type Subscription = { plan: string; status: string; currentPeriodEnd: string } | null;

const roleLabels: Record<string, string> = { member: "Membre", artist: "Artiste", admin: "Admin" };

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [hasPremium, setHasPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetch("/api/me/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSubscription(data.subscription);
          setHasPremium(data.hasPremium);
        }
      })
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="py-16 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="px-6 py-8 md:px-10 md:py-10">
        <p className="text-sm text-ink-muted">
          <Link href="/connexion" className="text-accent hover:underline">Connecte-toi</Link> pour accéder à ton compte.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-3xl">
      {/* Fil d'Ariane */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/" className="hover:text-ink">Accueil</Link>
        <ChevronRight size={14} />
        <span className="text-ink">Compte</span>
      </nav>

      <h1 className="mb-8 text-2xl font-display font-bold md:text-3xl">Mon compte</h1>

      {/* Profil */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <p className="mb-4 text-base font-semibold text-ink">Profil</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SafeImage
              src={session.user.image}
              alt={session.user.name ?? "Profil"}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="text-base font-semibold text-ink">{session.user.name}</p>
              <p className="text-sm text-ink-muted">{session.user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {roleLabels[session.user.role ?? "member"]}
              </span>
            </div>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted">
            <Pencil size={14} /> Modifier le profil
          </button>
        </div>
      </div>

      {/* Abonnement */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-base font-semibold text-ink">
              <Wallet size={18} className="text-accent" /> Abonnement
            </p>
            {session.user.role === "admin" ? (
              <p className="flex items-center gap-1.5 text-sm text-verified">
                <Crown size={14} /> Accès Premium illimité (compte admin)
              </p>
            ) : subscription ? (
              <p className="text-sm text-ink-muted">
                Plan {subscription.plan === "premium_annual" ? "Premium annuel" : "Premium"} — statut : {subscription.status}
                <br />
                Renouvellement : {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
              </p>
            ) : (
              <p className="text-sm text-ink-muted">Tu n&apos;as pas encore d&apos;abonnement actif.</p>
            )}
          </div>
          {session.user.role !== "admin" && (
            <Link
              href="/abonnement"
              className="shrink-0 rounded-xl border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
            >
              {hasPremium ? "Gérer l'abonnement" : "Passer en Premium"}
            </Link>
          )}
        </div>
      </div>

      {/* Espace artiste / revenus / administration */}
      {session.user.role === "artist" && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-base font-semibold text-ink">
              <Mic2 size={18} className="text-ink-muted" /> Mon espace artiste
            </p>
            <Link
              href="/artiste/gestion"
              className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
            >
              Ouvrir
            </Link>
          </div>
        </div>
      )}

      {session.user.role === "artist" && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-base font-semibold text-ink">
              <Wallet size={18} className="text-ink-muted" /> Mes revenus d&apos;artiste
            </p>
            <Link
              href="/artiste/revenus"
              className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-muted"
            >
              Ouvrir
            </Link>
          </div>
        </div>
      )}

      {session.user.role === "admin" && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 flex items-center gap-2 text-base font-semibold text-ink">
                <Shield size={18} /> Administration
              </p>
              <p className="text-sm text-ink-muted">
                Accès à l&apos;espace d&apos;administration pour gérer les utilisateurs, contenus et paramètres.
              </p>
            </div>
            <Link
              href="/admin"
              className="shrink-0 rounded-xl border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-base"
            >
              Ouvrir l&apos;administration
            </Link>
          </div>
        </div>
      )}

      {/* Déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-4 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
      >
        <LogOut size={16} /> Se déconnecter
      </button>

      <div className="flex gap-4 text-xs text-ink-muted">
        <Link href="/contact" className="hover:text-ink">Contact</Link>
        <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
      </div>
    </div>
  );
}