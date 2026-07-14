import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Play from "@/models/Play";
import { withApiErrors } from "@/lib/apiError";

type Period = "day" | "week" | "month" | "year";
type ChartType = "artists" | "songs" | "listeners";

function periodStart(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

export const GET = withApiErrors(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") ?? "week") as Period;
  const type = (searchParams.get("type") ?? "songs") as ChartType;

  await connectDB();
  const since = periodStart(period);

  if (type === "songs") {
    const ranking = await Play.aggregate([
      { $match: { playedAt: { $gte: since }, completed: true } },
      { $group: { _id: "$song", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 20 },
      {
        $lookup: { from: "songs", localField: "_id", foreignField: "_id", as: "song" },
      },
      { $unwind: "$song" },
      {
        $lookup: { from: "artists", localField: "song.artist", foreignField: "_id", as: "artist" },
      },
      { $unwind: "$artist" },
      {
        $project: {
          plays: 1,
          title: "$song.title",
          coverUrl: "$song.coverUrl",
          artistName: "$artist.stageName",
          verified: "$artist.verified",
        },
      },
    ]);
    return NextResponse.json({ period, type, ranking });
  }

  if (type === "artists") {
    const ranking = await Play.aggregate([
      { $match: { playedAt: { $gte: since }, completed: true } },
      {
        $lookup: { from: "songs", localField: "song", foreignField: "_id", as: "song" },
      },
      { $unwind: "$song" },
      { $group: { _id: "$song.artist", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 20 },
      {
        $lookup: { from: "artists", localField: "_id", foreignField: "_id", as: "artist" },
      },
      { $unwind: "$artist" },
      {
        $project: {
          plays: 1,
          stageName: "$artist.stageName",
          coverUrl: "$artist.coverUrl",
          verified: "$artist.verified",
        },
      },
    ]);
    return NextResponse.json({ period, type, ranking });
  }

  // type === "listeners" : les membres les plus actifs (nombre d'écoutes complètes)
  const ranking = await Play.aggregate([
    { $match: { playedAt: { $gte: since }, completed: true, user: { $ne: null } } },
    { $group: { _id: "$user", plays: { $sum: 1 } } },
    { $sort: { plays: -1 } },
    { $limit: 20 },
    {
      $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
    },
    { $unwind: "$user" },
    {
      $project: { plays: 1, name: "$user.name", avatarUrl: "$user.avatarUrl", badges: "$user.badges" },
    },
  ]);
  return NextResponse.json({ period, type, ranking });
});
