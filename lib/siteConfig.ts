import { connectDB } from "@/lib/db";
import SiteConfigModel from "@/models/SiteConfig";
import { defaultSiteConfig } from "@/config/site";

const SITE_CONFIG_ID = "000000000000000000000001";

/** Lit la config du site en base ; crée le document par défaut au premier appel. */
export async function getSiteConfig() {
  await connectDB();
  let config = await SiteConfigModel.findById(SITE_CONFIG_ID);

  if (!config) {
    config = await SiteConfigModel.create({
      _id: SITE_CONFIG_ID,
      siteName: defaultSiteConfig.siteName,
      tagline: defaultSiteConfig.tagline,
      logoUrl: defaultSiteConfig.logoUrl,
      supportEmail: defaultSiteConfig.supportEmail,
      copyrightText: `© ${new Date().getFullYear()} ${defaultSiteConfig.siteName}. Tous droits réservés.`,
      plans: [
        { plan: "premium", amountUSD: 4.99, amountMGA: 15000 },
        { plan: "premium_annual", amountUSD: 49.99, amountMGA: 150000 },
      ],
    });
  }

  return config;
}
