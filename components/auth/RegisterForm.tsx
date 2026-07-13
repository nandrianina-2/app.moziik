"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-display mb-1">Créer un compte</h1>
      <p className="text-sm text-ink-muted mb-6">
        Rejoins la communauté et soutiens tes artistes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Nom"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Mot de passe"
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
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-muted">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent"
      >
        Continuer avec Google
      </button>

      <p className="text-sm text-ink-muted mt-6">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-accent hover:underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
