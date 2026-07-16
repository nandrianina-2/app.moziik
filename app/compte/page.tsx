"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Wallet, Shield, Mic2, Crown } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { BadgeChip } from "@/components/ui/BadgeChip";

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
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-lg">
      <h1 className="text-2xl font-display mb-6">Mon compte</h1>

      <div className="rounded-xl2 border border-border bg-surface p-5 mb-6">
        <p className="text-sm font-medium">{session.user.name}</p>
        <p className="text-xs text-ink-muted mb-3">{session.user.email}</p>
        <span className="inline-block rounded-full border border-border px-3 py-1 text-xs text-ink-muted">
          {roleLabels[session.user.role ?? "member"]}
        </span>
      </div>

      <div className="rounded-xl2 border border-border bg-surface p-5 mb-6">
        <p className="flex items-center gap-1.5 text-sm font-medium mb-2">
          <Wallet size={15} className="text-accent" /> Abonnement
        </p>
        {session.user.role === "admin" ? (
          <p className="flex items-center gap-1.5 text-xs text-verified">
            <Crown size={13} /> Accès Premium illimité (compte admin)
          </p>
        ) : subscription ? (
          <p className="text-xs text-ink-muted">
            Plan {subscription.plan === "premium_annual" ? "Premium annuel" : "Premium"} — statut : {subscription.status}
            <br />
            Renouvellement : {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
          </p>
        ) : (
          <p className="text-xs text-ink-muted mb-3">Tu n&apos;as pas encore d&apos;abonnement actif.</p>
        )}
        {session.user.role !== "admin" && (
          <Link href="/abonnement" className="inline-block text-xs text-accent hover:underline mt-2">
            {hasPremium ? "Gérer mon abonnement" : "Passer en Premium"}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2 mb-6">
        {session.user.role === "artist" && (
          <Link
            href="/artiste/gestion"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-accent"
          >
            <Mic2 size={15} className="text-ink-muted" /> Mon espace artiste
          </Link>
        )}
        {session.user.role === "artist" && (
          <Link
            href="/artiste/revenus"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-accent"
          >
            <Wallet size={15} className="text-ink-muted" /> Mes revenus d&apos;artiste
          </Link>
        )}
        {session.user.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-accent"
          >
            <Shield size={15} className="text-ink-muted" /> Administration
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <BadgeChip label={roleLabels[session.user.role ?? "member"]} category={session.user.role === "artist" ? "artist" : "member"} />
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-2 text-sm text-accent hover:underline mb-8"
      >
        <LogOut size={15} /> Se déconnecter
      </button>

      <div className="flex gap-4 text-xs text-ink-muted">
        <Link href="/contact" className="hover:text-ink">Contact</Link>
        <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
      </div>
    </div>
  );
}
