import { Play } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { defaultSiteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-display">
            Bon retour sur {defaultSiteConfig.siteName}
          </h1>
          <p className="text-ink-muted text-sm mt-1">{defaultSiteConfig.tagline}</p>
        </div>
        <ThemeToggle />
      </header>

      <section className="rounded-xl2 border border-border bg-surface p-6 md:p-8 mb-10">
        <div className="flex items-center gap-2 text-verified text-xs font-medium mb-3">
          <EqualizerLoader size="sm" />
          Phase 1 — Fondations
        </div>
        <h2 className="text-xl font-display mb-2">Base technique en place</h2>
        <p className="text-ink-muted text-sm max-w-xl">
          Next.js, MongoDB, Cloudinary, thème clair/sombre et design system
          sont configurés. Les prochaines phases ajouteront l&apos;authentification,
          les modèles complets, puis les fonctionnalités musique, admin,
          paiement et analytics.
        </p>
      </section>

      <section>
        <h3 className="text-sm uppercase tracking-wide text-ink-muted mb-4">
          Aperçu du composant lecteur
        </h3>
        <div className="flex items-center gap-4 rounded-xl2 border border-border bg-surface p-4 max-w-md">
          <button
            aria-label="Lecture"
            className="grid h-12 w-12 place-items-center rounded-full bg-accent text-base transition-colors hover:bg-accent-hover"
          >
            <Play size={20} fill="currentColor" />
          </button>
          <div>
            <p className="text-sm font-medium">Titre d&apos;exemple</p>
            <p className="text-xs text-ink-muted">Artiste d&apos;exemple</p>
          </div>
        </div>
      </section>
    </div>
  );
}
