import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new ApiError("Non authentifié.", 401);

  await connectDB();
  const notifications = await Notification.find({ recipient: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50);

  return NextResponse.json({ notifications });
});

// Création interne (appelée par d'autres routes serveur : nouveau
// son publié, nouvel abonné, etc.), pas exposée aux clients publics.
export const POST = withApiErrors(async (req: Request) => {
  const { recipient, type, title, message, link } = await req.json();
  if (!recipient || !type || !title || !message) {
    throw new ApiError("Champs manquants pour créer la notification.");
  }

  await connectDB();
  const notification = await Notification.create({ recipient, type, title, message, link });
  return NextResponse.json({ notification }, { status: 201 });
});
