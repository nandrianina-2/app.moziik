import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/utils/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });

  // Réponse identique que le compte existe ou non, pour ne pas
  // révéler quels emails sont enregistrés.
  if (user) {
    const token = randomUUID();
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reinitialiser-mot-de-passe?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return NextResponse.json({
    message: "Si un compte existe avec cet email, un lien a été envoyé.",
  });
}
