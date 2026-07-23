import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Song from "@/models/Song";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ liked: false });

    await connectDB();
    const user = await User.findById(session.user.id).select("likedSongs");
    const liked = !!user?.likedSongs.some((id) => id.toString() === params.id);

    return NextResponse.json({ liked });
  }
);

export const POST = withApiErrors(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("Non authentifié.", 401);

    await connectDB();
    const [user, song] = await Promise.all([
      User.findById(session.user.id),
      Song.findById(params.id),
    ]);
    if (!user) throw new ApiError("Utilisateur introuvable.", 404);
    if (!song) throw new ApiError("Son introuvable.", 404);

    const alreadyLiked = user.likedSongs.some((id) => id.equals(song._id));

    if (alreadyLiked) {
      user.likedSongs = user.likedSongs.filter((id) => !id.equals(song._id)) as typeof user.likedSongs;
      song.likesCount = Math.max(0, song.likesCount - 1);
    } else {
      user.likedSongs.push(song._id);
      song.likesCount += 1;
    }

    await Promise.all([user.save(), song.save()]);

    return NextResponse.json({ liked: !alreadyLiked, likesCount: song.likesCount });
  }
);