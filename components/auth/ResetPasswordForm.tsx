"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/ui/FormField";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push("/connexion");
  }

  if (!token) {
    return (
      <p className="text-sm text-accent">
        Lien invalide. Redemande une réinitialisation.
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-display mb-1">Nouveau mot de passe</h1>
      <p className="text-sm text-ink-muted mb-6">Choisis un mot de passe d&apos;au moins 8 caractères.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Nouveau mot de passe"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-base transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Mise à jour..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
}
