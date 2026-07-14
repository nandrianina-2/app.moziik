"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultSiteConfig, type SiteConfig } from "@/config/site";

type PublicSiteConfig = Pick<
  SiteConfig,
  "siteName" | "tagline" | "logoUrl" | "supportEmail"
> & { copyrightText?: string };

const SiteConfigContext = createContext<PublicSiteConfig>(defaultSiteConfig);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PublicSiteConfig>(defaultSiteConfig);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setConfig(data))
      .catch(() => {
        // repli silencieux sur defaultSiteConfig déjà en état initial
      });
  }, []);

  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);
