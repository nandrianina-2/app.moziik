// Configuration centrale du site.
// En Phase 5 (Admin), ces valeurs seront lues depuis un document
// SiteConfig en base (modifiable dans le dashboard admin) avec ces
// valeurs comme valeurs par défaut / fallback.

export type SiteConfig = {
  siteName: string;
  tagline: string;
  logoUrl: string; // hébergé sur Cloudinary, modifiable dans /admin/parametres — utilisé dans la sidebar, le header mobile et comme icône PWA
  supportEmail: string;
  currency: {
    international: "USD" | "EUR";
    mobile: "MGA"; // à étendre selon les régions supportées
  };
};

export const defaultSiteConfig: SiteConfig = {
  siteName: "Moziik",
  tagline: "Écoute, découvre, soutiens tes artistes.",
  logoUrl: "/icon-mark.png",
  supportEmail: "contact@moziik.app",
  currency: {
    international: "USD",
    mobile: "MGA",
  },
};
