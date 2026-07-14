import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Song from "@/models/Song";
import Artist from "@/models/Artist";
import { withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ songs: [], artists: [] });
  }

  await connectDB();
  const regex = { $regex: q, $options: "i" };

  const [songs, artists] = await Promise.all([
    Song.find({ status: "published", title: regex })
      .populate("artist", "stageName verified")
      .limit(15),
    Artist.find({ stageName: regex }).select("stageName verified coverUrl").limit(10),
  ]);

  return NextResponse.json({ songs, artists });
});
