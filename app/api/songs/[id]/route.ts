import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Song from "@/models/Song";
import Artist from "@/models/Artist";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async (_req: Request, { params }: { params: { id: string } }) => {
  await connectDB();
  const song = await Song.findById(params.id)
    .populate("artist", "stageName verified coverUrl")
    .populate("featuring.artist", "stageName verified");
  if (!song) throw new ApiError("Son introuvable.", 404);
  return NextResponse.json({ song });
});

export const PATCH = withApiErrors(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("Non authentifié.", 401);

    await connectDB();
    const song = await Song.findById(params.id);
    if (!song) throw new ApiError("Son introuvable.", 404);

    const ownerArtist = await Artist.findOne({ user: session.user.id });
    const isOwner = ownerArtist && song.artist.equals(ownerArtist._id);
    if (!isOwner && session.user.role !== "admin") {
      throw new ApiError("Tu ne peux modifier que tes propres sons.", 403);
    }

    const updates = await req.json();
    const allowed = ["title", "coverUrl", "genre", "lyrics", "explicit", "releaseDate", "status"];
    for (const key of allowed) {
      if (key in updates) {
        // Un admin peut forcer le statut (validation / rejet) ; un
        // artiste ne peut que replanifier sa date de sortie.
        if (key === "status" && session.user.role !== "admin") continue;
        (song as Record<string, unknown>)[key] = updates[key];
      }
    }
    if (updates.releaseDate) {
      song.status = new Date(updates.releaseDate) <= new Date() ? "published" : "scheduled";
    }

    await song.save();
    return NextResponse.json({ song });
  }
);

export const DELETE = withApiErrors(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("Non authentifié.", 401);

    await connectDB();
    const song = await Song.findById(params.id);
    if (!song) throw new ApiError("Son introuvable.", 404);

    const ownerArtist = await Artist.findOne({ user: session.user.id });
    const isOwner = ownerArtist && song.artist.equals(ownerArtist._id);
    if (!isOwner && session.user.role !== "admin") {
      throw new ApiError("Tu ne peux supprimer que tes propres sons.", 403);
    }

    await song.deleteOne();
    return NextResponse.json({ message: "Son supprimé." });
  }
);
