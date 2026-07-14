import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSiteConfig } from "@/lib/siteConfig";
import { ApiError, withApiErrors } from "@/lib/apiError";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const POST = withApiErrors(async (req: Request) => {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) throw new ApiError("Tous les champs sont requis.");

  const config = await getSiteConfig();

  await transporter.sendMail({
    from: `"${config.siteName} — Contact" <${config.supportEmail}>`,
    to: config.supportEmail,
    replyTo: email,
    subject: `Nouveau message de contact — ${name}`,
    html: `
      <div style="font-family: sans-serif;">
        <p><strong>De :</strong> ${name} (${email})</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      </div>
    `,
  });

  return NextResponse.json({ message: "Message envoyé." });
});
