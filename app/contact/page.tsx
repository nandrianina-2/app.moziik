"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastProvider";
import { useSiteConfig } from "@/context/SiteConfigProvider";

export default function ContactPage() {
  const pushToast = useToast();
  const siteConfig = useSiteConfig();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      pushToast("error", "L'envoi a échoué. Réessaie plus tard.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="px-6 py-16 md:px-10 text-center max-w-md mx-auto">
        <Mail size={28} className="text-accent mx-auto mb-4" />
        <h1 className="font-display text-xl mb-2">Message envoyé</h1>
        <p className="text-sm text-ink-muted">
          Merci de nous avoir écrit, on te répond dès que possible à {email}.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-md">
      <h1 className="text-2xl font-display mb-2">Contact</h1>
      <p className="text-sm text-ink-muted mb-6">
        Une question, un problème, une suggestion ? Écris-nous
        {siteConfig.supportEmail ? ` ou directement à ${siteConfig.supportEmail}` : ""}.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nom" required value={name} onChange={(e) => setName(e.target.value)} />
        <FormField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="block">
          <span className="text-sm text-ink-muted mb-1.5 block">Message</span>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-border bg-base px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
          />
        </label>

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-base hover:bg-accent-hover disabled:opacity-60"
        >
          {sending ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
