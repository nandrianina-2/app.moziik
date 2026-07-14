import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Artist from "@/models/Artist";
import Song from "@/models/Song";
import Event from "@/models/Event";
import Subscription from "@/models/Subscription";
import { requireAdmin } from "@/lib/requireAdmin";
import { withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async () => {
  await requireAdmin();
  await connectDB();

  const [members, artists, publishedSongs, pendingSongs, pendingEvents, activeSubscriptions] =
    await Promise.all([
      User.countDocuments({ role: "member" }),
      Artist.countDocuments(),
      Song.countDocuments({ status: "published" }),
      Song.countDocuments({ status: "draft" }).then(async (draft) => {
        const scheduled = await Song.countDocuments({ status: "scheduled" });
        return draft + scheduled;
      }),
      Event.countDocuments({ status: "pending" }),
      Subscription.countDocuments({ status: "active" }),
    ]);

  return NextResponse.json({
    members,
    artists,
    publishedSongs,
    pendingSongs,
    pendingEvents,
    activeSubscriptions,
  });
});
