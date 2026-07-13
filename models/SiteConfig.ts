import { Schema, models, model } from "mongoose";

export interface IPlanPricing {
  plan: "premium" | "premium_annual";
  amountUSD: number; // prix de référence, converti selon la région
  amountMGA: number; // prix pour le paiement mobile local
}

export interface ISiteConfig {
  siteName: string;
  tagline: string;
  logoUrl: string; // hébergé sur Cloudinary
  supportEmail: string;
  copyrightText: string;
  plans: IPlanPricing[]; // coûts d'abonnement, modifiables par l'admin
  payPerListenRateUSD: number; // rémunération artiste par écoute complète
  defaultTheme: "dark" | "light";
  updatedAt: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>({
  siteName: { type: String, required: true, default: "Moziik" },
  tagline: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  supportEmail: { type: String, default: "" },
  copyrightText: { type: String, default: "" },
  plans: [
    {
      plan: { type: String, enum: ["premium", "premium_annual"] },
      amountUSD: Number,
      amountMGA: Number,
    },
  ],
  payPerListenRateUSD: { type: Number, default: 0.003 },
  defaultTheme: { type: String, enum: ["dark", "light"], default: "dark" },
  updatedAt: { type: Date, default: Date.now },
});

// Un seul document en base : on force un id fixe pour le récupérer facilement.
export default models.SiteConfig || model<ISiteConfig>("SiteConfig", SiteConfigSchema);
