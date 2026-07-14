"use client";

import Link from "next/link";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export default function LegalPage() {
  const siteConfig = useSiteConfig();

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl">
      <h1 className="text-2xl font-display mb-6">Mentions légales</h1>

      <div className="space-y-6 text-sm text-ink-muted">
        <section>
          <h2 className="text-ink font-medium mb-2">Éditeur</h2>
          <p>
            {siteConfig.siteName} est édité et exploité en tant que
            plateforme de streaming musical. Pour toute question, contacte-nous
            à {siteConfig.supportEmail || "l'adresse indiquée sur la page contact"} ou
            via la <Link href="/contact" className="text-accent hover:underline">page contact</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-medium mb-2">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des sons, pochettes, textes et éléments visuels
            disponibles sur {siteConfig.siteName} sont la propriété de leurs
            auteurs et artistes respectifs, ou sont utilisés avec leur
            autorisation. Toute reproduction ou diffusion non autorisée est
            interdite.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-medium mb-2">Contenu des utilisateurs</h2>
          <p>
            Les artistes qui publient des sons sur {siteConfig.siteName}
            garantissent détenir les droits nécessaires à leur diffusion. La
            plateforme se réserve le droit de retirer tout contenu signalé
            comme contrevenant aux droits d&apos;un tiers.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-medium mb-2">Données personnelles</h2>
          <p>
            Les données de compte (nom, email) sont utilisées uniquement
            pour le fonctionnement du service (authentification,
            notifications, facturation). Aucune donnée n&apos;est revendue à
            des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-ink font-medium mb-2">Copyright</h2>
          <p>{siteConfig.copyrightText || `© ${new Date().getFullYear()} ${siteConfig.siteName}. Tous droits réservés.`}</p>
        </section>
      </div>
    </div>
  );
}
