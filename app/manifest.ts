import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/siteConfig";

// Même remarque que pour /api/site-config : sans ceci, ce fichier de
// métadonnées est généré une fois au build et ne reflèterait jamais un
// changement de logo fait depuis /admin/parametres.
export const dynamic = "force-dynamic";

/**
 * Chrome (et les autres navigateurs) vérifient que les dimensions
 * RÉELLES de l'icône correspondent exactement à celles déclarées dans
 * le manifest — sinon la PWA n'est simplement pas installable, sans
 * message d'erreur explicite. Le logo uploadé par l'admin ayant une
 * taille arbitraire, on force le format carré exact via une
 * transformation Cloudinary à la volée (padding transparent, jamais
 * de recadrage destructeur).
 */
function sizedIcon(logoUrl: string, size: number): string | null {
  if (!logoUrl.includes("/upload/")) return null; // pas une URL Cloudinary : on ne peut pas garantir la taille
  return logoUrl.replace("/upload/", `/upload/w_${size},h_${size},c_pad,b_auto/`);
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await getSiteConfig();

  const icon512 = (config.logoUrl && sizedIcon(config.logoUrl, 512)) || "/icon-512.png";
  const icon192 = (config.logoUrl && sizedIcon(config.logoUrl, 192)) || "/icon-192.png";

  return {
    name: config.siteName,
    short_name: config.siteName,
    description: config.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0D0F1A",
    theme_color: "#FF6B4A",
    icons: [
      { src: icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      // Icônes statiques garanties (fallback maskable) : toujours valides
      // même si le logo admin est une URL non-Cloudinary imprévisible.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
