import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { analyzeSentiment } from "@/lib/sentiment";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const GET = withApiErrors(async (_req: Request, { params }: { params: { id: string } }) => {
  await connectDB();
  const comments = await Comment.find({ song: params.id })
    .populate("user", "name avatarUrl")
    .sort({ createdAt: -1 });
  return NextResponse.json({ comments });
});

export const POST = withApiErrors(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("Non authentifié.", 401);

    const { text, timestampInSong, parentComment } = await req.json();
    if (!text?.trim()) throw new ApiError("Le commentaire ne peut pas être vide.");

    const { sentiment, score } = analyzeSentiment(text);

    await connectDB();
    const comment = await Comment.create({
      song: params.id,
      user: session.user.id,
      text: text.trim(),
      timestampInSong,
      parentComment,
      sentiment,
      sentimentScore: score,
    });

    await comment.populate("user", "name avatarUrl");
    return NextResponse.json({ comment }, { status: 201 });
  }
);
