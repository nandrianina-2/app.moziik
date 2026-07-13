import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token et nouveau mot de passe requis." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Lien invalide ou expiré." },
      { status: 400 }
    );
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Mot de passe mis à jour." });
}
