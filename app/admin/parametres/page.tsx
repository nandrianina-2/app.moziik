"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { EqualizerLoader } from "@/components/ui/EqualizerLoader";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastProvider";
import { uploadToCloudinaryClient } from "@/lib/cloudinaryClient";

type PlanPricing = { plan: "premium" | "premium_annual"; amountUSD: number; amountMGA: number };

type SiteConfigForm = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  supportEmail: string;
  copyrightText: string;
  plans: PlanPricing[];
  payPerListenRateUSD: number;
};

export default function AdminSettingsPage() {
  const pushToast = useToast();
  const [config, setConfig] = useState<SiteConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/site-config");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setConfig(data.config);
      } catch {
        pushToast("error", "Impossible de charger les paramètres.");
      }
    }
    load();
  }, [pushToast]);

  async function handleLogoChange(file: File) {
    setUploadingLogo(true);
    try {
      const { url } = await uploadToCloudinaryClient(file, "site-assets");
      setConfig((prev) => (prev ? { ...prev, logoUrl: url } : prev));
    } catch {
      pushToast("error", "Échec de l'envoi du logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  function updatePlan(index: number, field: keyof PlanPricing, value: number) {
    if (!config) return;
    const plans = [...config.plans];
    plans[index] = { ...plans[index], [field]: value };
    setConfig({ ...config, plans });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      pushToast("success", "Paramètres enregistrés.");
      window.dispatchEvent(new Event("moziik-site-config-change"));
    } catch {
      pushToast("error", "L'enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <div className="py-10 grid place-items-center">
        <EqualizerLoader />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-xl">
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-ink-muted">Identité du site</h2>

        <div className="flex items-center gap-4">
          {config.logoUrl && (
            <Image src={config.logoUrl} alt="Logo" width={48} height={48} className="rounded-lg object-cover" />
          )}
          <label className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 cursor-pointer text-sm text-ink-muted hover:border-accent">
            <UploadCloud size={16} />
            {uploadingLogo ? "Envoi..." : "Changer le logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogoChange(e.target.files[0])}
            />
          </label>
        </div>

        <FormField
          label="Nom du site"
          value={config.siteName}
          onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
        />
        <FormField
          label="Slogan"
          value={config.tagline}
          onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
        />
        <FormField
          label="Email de support"
          type="email"
          value={config.supportEmail}
          onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
        />
        <FormField
          label="Mention de copyright"
          value={config.copyrightText}
          onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-wide text-ink-muted">Coûts d&apos;abonnement</h2>
        {config.plans.map((plan, i) => (
          <div key={plan.plan} className="rounded-xl2 border border-border bg-surface p-4">
            <p className="text-sm font-medium mb-3">
              {plan.plan === "premium" ? "Premium mensuel" : "Premium annuel"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Prix (USD / Stripe)"
                type="number"
                step="0.01"
                value={plan.amountUSD}
                onChange={(e) => updatePlan(i, "amountUSD", Number(e.target.value))}
              />
              <FormField
                label="Prix (MGA / Mobile Money)"
                type="number"
                value={plan.amountMGA}
                onChange={(e) => updatePlan(i, "amountMGA", Number(e.target.value))}
              />
            </div>
          </div>
        ))}

        <FormField
          label="Rémunération artiste par écoute complète (USD)"
          type="number"
          step="0.0001"
          value={config.payPerListenRateUSD}
          onChange={(e) => setConfig({ ...config, payPerListenRateUSD: Number(e.target.value) })}
        />
      </section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-base hover:bg-accent-hover disabled:opacity-60"
      >
        {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
      </button>
    </form>
  );
}
