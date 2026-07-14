import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Artist from "@/models/Artist";
import { requireAdmin } from "@/lib/requireAdmin";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const PATCH = withApiErrors(
  async (req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();

    const { role, verifiedArtist, suspended, badges } = await req.json();

    await connectDB();
    const user = await User.findById(params.id);
    if (!user) throw new ApiError("Utilisateur introuvable.", 404);

    if (role) user.role = role;
    if (typeof suspended === "boolean") user.suspended = suspended;
    if (Array.isArray(badges)) user.badges = badges;

    // Promotion en artiste : on crée le profil Artist s'il n'existe pas.
    if (role === "artist") {
      const existingArtist = await Artist.findOne({ user: user._id });
      if (!existingArtist) {
        await Artist.create({ user: user._id, stageName: user.name });
      }
    }

    if (typeof verifiedArtist === "boolean") {
      user.verifiedArtist = verifiedArtist;
      await Artist.findOneAndUpdate({ user: user._id }, { verified: verifiedArtist });
    }

    await user.save();
    return NextResponse.json({ user });
  }
);

export const DELETE = withApiErrors(
  async (_req: Request, { params }: { params: { id: string } }) => {
    await requireAdmin();

    await connectDB();
    const user = await User.findById(params.id);
    if (!user) throw new ApiError("Utilisateur introuvable.", 404);

    await Artist.deleteOne({ user: user._id });
    await user.deleteOne();

    return NextResponse.json({ message: "Utilisateur supprimé." });
  }
);
