import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Artist from "@/models/Artist";
import Song from "@/models/Song";
import Album from "@/models/Album";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async (_req: Request, { params }: { params: { id: string } }) => {
  await connectDB();
  const artist = await Artist.findById(params.id);
  if (!artist) throw new ApiError("Artiste introuvable.", 404);

  const [songs, albums] = await Promise.all([
    Song.find({ artist: artist._id, status: "published" })
      .populate("artist", "stageName verified")
      .sort({ releaseDate: -1 }),
    Album.find({ artist: artist._id }).sort({ releaseDate: -1 }),
  ]);

  return NextResponse.json({
    artist: {
      _id: artist._id,
      stageName: artist.stageName,
      bio: artist.bio,
      coverUrl: artist.coverUrl,
      genres: artist.genres,
      verified: artist.verified,
      followersCount: artist.followers.length,
    },
    songs,
    albums,
  });
});
