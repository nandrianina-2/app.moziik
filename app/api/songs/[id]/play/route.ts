import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Play from "@/models/Play";
import Song from "@/models/Song";
import { ApiError, withApiErrors } from "@/lib/apiError";

export const POST = withApiErrors(
  async (req: Request, { params }: { params: { id: string } }) => {
    const { secondsListened, completed, device } = await req.json();
    const session = await getServerSession(authOptions);

    await connectDB();
    const song = await Song.findById(params.id);
    if (!song) throw new ApiError("Son introuvable.", 404);

    // Sur Vercel, ces en-têtes de géolocalisation sont ajoutés
    // automatiquement en périphérie ; en local, ils seront absents.
    const headerList = headers();
    const country = headerList.get("x-vercel-ip-country") ?? undefined;
    const city = headerList.get("x-vercel-ip-city") ?? undefined;

    await Play.create({
      song: song._id,
      user: session?.user?.id,
      country,
      city,
      device,
      secondsListened: secondsListened ?? 0,
      completed: !!completed,
    });

    if (completed) {
      song.playsCount += 1;
      await song.save();
    }

    return NextResponse.json({ message: "Écoute enregistrée." }, { status: 201 });
  }
);
