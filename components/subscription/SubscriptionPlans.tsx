"use client";

import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Check } from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { FormField } from "@/components/ui/FormField";

type Plan = { plan: "premium" | "premium_annual"; amountUSD: number; amountMGA: number };

export function SubscriptionPlans() {
  const pushToast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [preferredMethod, setPreferredMethod] = useState<"stripe" | "mobile_money">("stripe");
  const [selectedPlan, setSelectedPlan] = useState<Plan["plan"]>("premium");
  const [method, setMethod] = useState<"stripe" | "mobile_money">("stripe");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const [configRes, regionRes] = await Promise.all([
        fetch("/api/site-config"),
        fetch("/api/region"),
      ]);
      if (regionRes.ok) {
        const region = await regionRes.json();
        setPreferredMethod(region.preferredMethod);
        setMethod(region.preferredMethod);
      }
      if (configRes.ok) {
        const data = await configRes.json();
        setPlans(data.plans);
      }
    }
    load();
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      if (method === "stripe") {
        const res = await fetch("/api/subscriptions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: selectedPlan }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        window.location.href = data.url;
      } else {
        if (!phoneNumber) {
          pushToast("error", "Renseigne ton numéro Mobile Money.");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/subscriptions/mobile-money", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: selectedPlan, phoneNumber }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        pushToast("success", data.message);
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Le paiement a échoué.");
    } finally {
      setLoading(false);
    }
  }

  const currentPlan = plans.find((p) => p.plan === selectedPlan);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-display mb-2">Passer en Premium</h1>
      <p className="text-sm text-ink-muted mb-6">
        Écoute sans limite, soutiens tes artistes préférés, débloque le hors-ligne.
      </p>

      <div className="space-y-2 mb-6">
        {plans.map((plan) => (
          <button
            key={plan.plan}
            onClick={() => setSelectedPlan(plan.plan)}
            className={`w-full flex items-center justify-between rounded-xl2 border px-4 py-3.5 text-left transition-colors ${
              selectedPlan === plan.plan ? "border-accent bg-surface" : "border-border hover:border-accent"
            }`}
          >
            <span>
              <span className="block text-sm font-medium">
                {plan.plan === "premium_annual" ? "Premium annuel" : "Premium mensuel"}
              </span>
              <span className="block text-xs text-ink-muted">
                {plan.amountUSD.toFixed(2)} $ · {plan.amountMGA.toLocaleString("fr-FR")} Ar
              </span>
            </span>
            {selectedPlan === plan.plan && <Check size={18} className="text-accent shrink-0" />}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMethod("stripe")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
            method === "stripe" ? "border-accent text-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <CreditCard size={16} /> Carte bancaire
        </button>
        <button
          onClick={() => setMethod("mobile_money")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
            method === "mobile_money" ? "border-accent text-accent" : "border-border text-ink-muted hover:border-accent"
          }`}
        >
          <Smartphone size={16} /> Mobile Money
        </button>
      </div>

      {method === preferredMethod && (
        <p className="text-xs text-ink-muted mb-4">Mode recommandé pour ta région.</p>
      )}

      {method === "mobile_money" && (
        <div className="mb-4">
          <FormField
            label="Numéro Mobile Money"
            placeholder="034 XX XXX XX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading || !currentPlan}
        className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-base hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Redirection..." : `S'abonner — ${method === "stripe" ? `${currentPlan?.amountUSD.toFixed(2)} $` : `${currentPlan?.amountMGA.toLocaleString("fr-FR")} Ar`}`}
      </button>
    </div>
  );
}
