import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/siteConfig";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getSiteConfig();

  return {
    name: config.siteName,
    short_name: config.siteName,
    description: config.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0D0F1A",
    theme_color: "#FF6B4A",
    icons: [
      {
        // Le logo configuré par l'admin (icon-mark carré par défaut) sert
        // aussi d'icône PWA. Pour un rendu optimal, prévoir un logo carré
        // d'au moins 512x512 dans /admin/parametres.
        src: config.logoUrl || "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: config.logoUrl || "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
