"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/ui/FormField";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-display mb-1">Connexion</h1>
      <p className="text-sm text-ink-muted mb-6">
        Retrouve tes playlists et tes artistes préférés.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex justify-end">
          <Link href="/mot-de-passe-oublie" className="text-xs text-ink-muted hover:text-accent">
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-base transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
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
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-accent hover:underline">
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}
