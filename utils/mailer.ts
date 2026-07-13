import nodemailer from "nodemailer";
import { defaultSiteConfig } from "@/config/site";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"${defaultSiteConfig.siteName}" <${defaultSiteConfig.supportEmail}>`,
    to,
    subject: "Réinitialise ton mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Tu as demandé à réinitialiser ton mot de passe ${defaultSiteConfig.siteName}.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#FF6B4A;color:#fff;border-radius:8px;text-decoration:none;">
          Choisir un nouveau mot de passe
        </a></p>
        <p>Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
      </div>
    `,
  });
}
