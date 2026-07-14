import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new ApiError("Non authentifié.", 401);

  await connectDB();
  const subscription = await Subscription.findOne({ user: session.user.id }).sort({ startedAt: -1 });

  return NextResponse.json({ subscription });
});
