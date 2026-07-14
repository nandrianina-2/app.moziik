import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Artist from "@/models/Artist";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const POST = withApiErrors(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("Non authentifié.", 401);

    await connectDB();
    const artist = await Artist.findById(params.id);
    if (!artist) throw new ApiError("Artiste introuvable.", 404);

    const alreadyFollowing = artist.followers.some(
      (id: Types.ObjectId) => id.toString() === session.user.id
    );

    if (alreadyFollowing) {
      artist.followers = artist.followers.filter(
        (id: Types.ObjectId) => id.toString() !== session.user.id
      );
    } else {
      artist.followers.push(new Types.ObjectId(session.user.id));
    }

    await artist.save();
    return NextResponse.json({ following: !alreadyFollowing, followersCount: artist.followers.length });
  }
);