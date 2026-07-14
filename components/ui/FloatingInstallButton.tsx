"use client";

import { Download, X } from "lucide-react";
import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export function FloatingInstallButton() {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const siteConfig = useSiteConfig();

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-[9.5rem] md:bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-border bg-surface pl-4 pr-2 py-2 shadow-lg">
      <span className="text-xs">Installer {siteConfig.siteName}</span>
      <button
        onClick={promptInstall}
        aria-label="Installer l'application"
        className="grid h-8 w-8 place-items-center rounded-full bg-accent text-base hover:bg-accent-hover"
      >
        <Download size={14} />
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className="text-ink-muted hover:text-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}
